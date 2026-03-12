/**
 * SP-API Authentication — Complete Auth Chain
 *
 * This module handles the three-step authentication required for every SP-API request:
 *   1. LWA (Login with Amazon) token exchange → access token
 *   2. STS AssumeRole → temporary AWS credentials
 *   3. SigV4 request signing → signed Authorization header
 *
 * No external AWS SDK required — uses only Node.js built-in crypto module.
 *
 * Usage:
 *   import { spApiRequest } from './sp-api-auth.js';
 *   const orders = await spApiRequest('GET', '/orders/v0/orders', { queryParams: { ... } });
 *
 * Environment variables required:
 *   SP_API_CLIENT_ID, SP_API_CLIENT_SECRET — from your SP-API app
 *   AWS_SP_API_ACCESS_KEY_ID, AWS_SP_API_SECRET_ACCESS_KEY — IAM user for STS
 *   AWS_SP_API_ROLE_ARN — IAM role ARN to assume
 *   SP_API_REFRESH_TOKEN — per-user refresh token from OAuth
 */

import crypto from "crypto";
import "dotenv/config";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const config = {
  clientId: process.env.SP_API_CLIENT_ID,
  clientSecret: process.env.SP_API_CLIENT_SECRET,
  refreshToken: process.env.SP_API_REFRESH_TOKEN,
  awsAccessKeyId: process.env.AWS_SP_API_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SP_API_SECRET_ACCESS_KEY,
  roleArn: process.env.AWS_SP_API_ROLE_ARN,
};

// Region configuration — change these for EU or FE marketplaces
const REGION_CONFIG = {
  NA: { endpoint: "sellingpartnerapi-na.amazon.com", awsRegion: "us-east-1" },
  EU: { endpoint: "sellingpartnerapi-eu.amazon.com", awsRegion: "eu-west-1" },
  FE: { endpoint: "sellingpartnerapi-fe.amazon.com", awsRegion: "us-west-2" },
};

const region = REGION_CONFIG[process.env.SP_API_REGION || "NA"];

// ---------------------------------------------------------------------------
// Caching — tokens are expensive to fetch, so cache them
// ---------------------------------------------------------------------------

let lwaCache = { token: null, expiresAt: 0 };
let stsCache = { creds: null, expiresAt: 0 };
const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

// ---------------------------------------------------------------------------
// Step 1: LWA Token Exchange
// ---------------------------------------------------------------------------

/**
 * Exchange a refresh token for an LWA access token.
 * This token goes in the x-amz-access-token header of every SP-API request.
 */
async function getLwaAccessToken() {
  // Return cached token if still valid
  if (lwaCache.token && Date.now() < lwaCache.expiresAt - EXPIRY_BUFFER_MS) {
    return lwaCache.token;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LWA token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  // Cache the token
  lwaCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ---------------------------------------------------------------------------
// Step 2: STS AssumeRole
// ---------------------------------------------------------------------------

/**
 * Assume an IAM role to get temporary AWS credentials.
 * These credentials are used to SigV4-sign SP-API requests.
 *
 * Important: The STS request itself is signed with your IAM USER credentials,
 * not the temporary credentials. This is a common point of confusion.
 */
async function getStsCredentials() {
  // Return cached credentials if still valid
  if (stsCache.creds && Date.now() < stsCache.expiresAt - EXPIRY_BUFFER_MS) {
    return stsCache.creds;
  }

  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);

  // STS request body
  const body = new URLSearchParams({
    Action: "AssumeRole",
    Version: "2011-06-15",
    RoleArn: config.roleArn,
    RoleSessionName: `sp-api-${Date.now()}`,
    DurationSeconds: "3600",
  }).toString();

  // Headers for the STS request
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    host: "sts.amazonaws.com",
    "x-amz-date": amzDate,
  };

  // Sign the STS request with IAM USER credentials (not temporary creds)
  signRequest({
    method: "POST",
    path: "/",
    headers,
    body,
    service: "sts",
    region: "us-east-1",
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
    amzDate,
    dateStamp,
  });

  const response = await fetch("https://sts.amazonaws.com/", {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`STS AssumeRole failed (${response.status}): ${text}`);
  }

  const xml = await response.text();

  // Parse the XML response (simple extraction — no XML parser needed)
  const creds = {
    accessKeyId: xmlValue(xml, "AccessKeyId"),
    secretAccessKey: xmlValue(xml, "SecretAccessKey"),
    sessionToken: xmlValue(xml, "SessionToken"),
    expiration: xmlValue(xml, "Expiration"),
  };

  if (!creds.accessKeyId) {
    throw new Error("STS response missing credentials");
  }

  // Cache the credentials
  stsCache = {
    creds,
    expiresAt: new Date(creds.expiration).getTime(),
  };

  return creds;
}

/** Extract a value from XML by tag name */
function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Step 3: SigV4 Request Signing
// ---------------------------------------------------------------------------

/**
 * AWS Signature Version 4 signing.
 *
 * This is the core of AWS authentication. Every SP-API request must be signed
 * with this algorithm. The signature proves you have valid AWS credentials
 * without transmitting the secret key.
 *
 * The function modifies the headers object in-place, adding the Authorization header.
 */
function signRequest({
  method,
  path,
  queryString,
  headers,
  body,
  service,
  region: sigRegion,
  accessKeyId,
  secretAccessKey,
  amzDate,
  dateStamp,
}) {
  // Step 3a: Build the canonical request
  // Headers MUST be sorted alphabetically — this is critical
  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders =
    sortedHeaderKeys.map((k) => `${k}:${headers[k]}`).join("\n") + "\n";
  const signedHeaders = sortedHeaderKeys.join(";");
  const payloadHash = sha256(body || "");

  const canonicalRequest = [
    method,
    path,
    queryString || "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // Step 3b: Create the string to sign
  const credentialScope = `${dateStamp}/${sigRegion}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  // Step 3c: Derive the signing key (4 rounds of HMAC)
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, sigRegion);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");

  // Step 3d: Calculate the signature
  const signature = hmac(kSigning, stringToSign, "hex");

  // Step 3e: Add the Authorization header
  headers["authorization"] =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------

function sha256(data) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function hmac(key, data, encoding) {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "utf8") : key;
  const h = crypto.createHmac("sha256", keyBuffer).update(data, "utf8");
  return encoding ? h.digest(encoding) : h.digest();
}

function toAmzDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// ---------------------------------------------------------------------------
// Main: spApiRequest() — make authenticated SP-API calls
// ---------------------------------------------------------------------------

/**
 * Make an authenticated SP-API request.
 *
 * Handles the full auth chain automatically:
 *   1. Gets (or refreshes) an LWA access token
 *   2. Gets (or refreshes) STS temporary credentials
 *   3. Signs the request with SigV4
 *   4. Sends the request and returns the parsed response
 *
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API path (e.g., '/orders/v0/orders')
 * @param {Object} options
 * @param {Object} [options.body] - Request body (will be JSON-serialized)
 * @param {Object} [options.queryParams] - Query parameters
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function spApiRequest(method, path, { body, queryParams } = {}) {
  // Step 1: Get LWA access token
  const accessToken = await getLwaAccessToken();

  // Step 2: Get STS temporary credentials
  const stsCreds = await getStsCredentials();

  // Build sorted query string (SigV4 requires sorted params)
  let queryString = "";
  if (queryParams) {
    queryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join("&");
  }

  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const bodyStr = body ? JSON.stringify(body) : "";

  // Build headers — these are included in the signature
  const headers = {
    host: region.endpoint,
    "x-amz-access-token": accessToken,
    "x-amz-date": amzDate,
    "x-amz-security-token": stsCreds.sessionToken,
  };

  if (body) {
    headers["content-type"] = "application/json";
  }

  // Sign the request with STS TEMPORARY credentials
  signRequest({
    method,
    path,
    queryString,
    headers,
    body: bodyStr,
    service: "execute-api",
    region: region.awsRegion,
    accessKeyId: stsCreds.accessKeyId,
    secretAccessKey: stsCreds.secretAccessKey,
    amzDate,
    dateStamp,
  });

  // User-agent is added AFTER signing (not part of signature)
  headers["user-agent"] = "RedHenLabs-SP-API-Example/1.0";

  // Build the full URL
  const url = `https://${region.endpoint}${path}${queryString ? "?" + queryString : ""}`;

  const response = await fetch(url, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  // Handle empty responses (201 Created, 204 No Content)
  if (response.status === 201 || response.status === 204) {
    return { status: response.status };
  }

  const responseData = await response.json();

  if (!response.ok) {
    const error = new Error(
      `SP-API ${method} ${path} failed (${response.status}): ${JSON.stringify(responseData)}`
    );
    error.status = response.status;
    error.response = responseData;
    throw error;
  }

  return responseData;
}

// ---------------------------------------------------------------------------
// Self-test — run this file directly to verify your credentials
// ---------------------------------------------------------------------------

const isMainModule = process.argv[1]?.endsWith("sp-api-auth.js");
if (isMainModule) {
  (async () => {
    console.log("Testing SP-API auth chain...\n");

    try {
      console.log("1. LWA token exchange...");
      const token = await getLwaAccessToken();
      console.log(`   OK — token: ${token.slice(0, 20)}...`);

      console.log("2. STS AssumeRole...");
      const creds = await getStsCredentials();
      console.log(`   OK — access key: ${creds.accessKeyId}`);

      console.log("3. Test SP-API call (GET /sellers/v1/marketplaceParticipations)...");
      const result = await spApiRequest("GET", "/sellers/v1/marketplaceParticipations");
      const marketplaces = result.payload || [];
      console.log(`   OK — found ${marketplaces.length} marketplace(s):`);
      for (const mp of marketplaces) {
        const m = mp.marketplace;
        console.log(`   - ${m.name} (${m.id}) — ${m.countryCode}`);
      }

      console.log("\nAll auth steps passed.");
    } catch (err) {
      console.error("\nAuth test failed:", err.message);
      process.exit(1);
    }
  })();
}
