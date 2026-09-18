/**
 * SP-API Authentication — LWA access token, and nothing else
 *
 * An SP-API request needs exactly one credential: a Login with Amazon (LWA)
 * access token, sent in the `x-amz-access-token` header. There is no AWS
 * account, no IAM user, no role to assume and no request signing.
 *
 * This module handles the one step:
 *   1. LWA token exchange — refresh token -> access token
 *
 * WHY THERE IS NO AWS CODE HERE
 *
 * SP-API used to require AWS SigV4 signing, so the chain was
 * LWA -> STS AssumeRole -> SigV4. Amazon removed that requirement, and we
 * removed the AWS half from our own production code on 2026-08-16. We verified
 * it against the live API before deleting anything: a
 * GET /sellers/v1/marketplaceParticipations carrying only the LWA token
 * returned HTTP 200.
 *
 * Deleting it was not tidying. An AWS access key had become a hard dependency
 * of a protocol that did not need one, and when ours lapsed, every SP-API call
 * started returning 403 with wording that reads as though each SELLER needs to
 * re-authorize. Inventory, restock and listings syncs failed for every seller
 * whose jobs ran in that window; the actual fault was one expired credential of
 * ours. If you find an older tutorial that walks you through IAM users and role
 * ARNs, you are reading something that predates the change — you do not need
 * any of it.
 *
 * No AWS SDK and no SP-API client library: this file talks to Amazon with
 * `fetch` alone. The only external package anywhere in these examples is
 * `dotenv`, for loading a `.env` file.
 *
 * Usage:
 *   import { spApiRequest } from './sp-api-auth.js';
 *   const orders = await spApiRequest('GET', '/orders/v0/orders', { queryParams: { ... } });
 *
 * Environment variables required:
 *   SP_API_CLIENT_ID, SP_API_CLIENT_SECRET — from your SP-API app
 *   SP_API_REFRESH_TOKEN — per-user refresh token from OAuth
 *   SP_API_REGION — NA (default), EU or FE
 */

import "dotenv/config";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const config = {
  clientId: process.env.SP_API_CLIENT_ID,
  clientSecret: process.env.SP_API_CLIENT_SECRET,
  refreshToken: process.env.SP_API_REFRESH_TOKEN,
};

// Region configuration — change SP_API_REGION for EU or FE marketplaces
const REGION_CONFIG = {
  NA: { endpoint: "sellingpartnerapi-na.amazon.com" },
  EU: { endpoint: "sellingpartnerapi-eu.amazon.com" },
  FE: { endpoint: "sellingpartnerapi-fe.amazon.com" },
};

const region = REGION_CONFIG[process.env.SP_API_REGION || "NA"];

/**
 * Amazon's Agent Policy requires that software acting on behalf of, or at the
 * instruction of, a seller identify itself in the user agent of every
 * Amazon-bound request, using the literal form `Agent/[agent name]`. Use the
 * agent name from your Solution Provider Portal registration in place of
 * YourAgentName — a name Amazon cannot tie back to your filing does not satisfy
 * the policy.
 *
 * Send it on every Amazon-bound request, not just the API calls: the LWA token
 * exchange and pre-signed report-document downloads are covered too.
 */
export const USER_AGENT =
  "Agent/YourAgentName SP-API-Example/1.0 (Language=JavaScript; Platform=Node.js)";

// ---------------------------------------------------------------------------
// Caching — tokens are expensive to fetch, so cache them
// ---------------------------------------------------------------------------

let lwaCache = { token: null, expiresAt: 0 };
const EXPIRY_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

// ---------------------------------------------------------------------------
// LWA Token Exchange — the whole auth chain
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
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
// Main: spApiRequest() — make authenticated SP-API calls
// ---------------------------------------------------------------------------

/**
 * Make an authenticated SP-API request.
 *
 *   1. Gets (or refreshes) an LWA access token
 *   2. Sends the request with that token in the x-amz-access-token header
 *   3. Returns the parsed response
 *
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API path (e.g., '/orders/v0/orders')
 * @param {Object} options
 * @param {Object} [options.body] - Request body (will be JSON-serialized)
 * @param {Object} [options.queryParams] - Query parameters
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function spApiRequest(method, path, { body, queryParams } = {}) {
  const accessToken = await getLwaAccessToken();

  let queryString = "";
  if (queryParams) {
    queryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
      .join("&");
  }

  const bodyStr = body ? JSON.stringify(body) : "";

  // The LWA access token is the only credential. No signature, no session
  // token, no date header to get wrong.
  const headers = {
    host: region.endpoint,
    "x-amz-access-token": accessToken,
    "user-agent": USER_AGENT,
  };

  if (body) {
    headers["content-type"] = "application/json";
  }

  const url = `https://${region.endpoint}${path}${queryString ? "?" + queryString : ""}`;

  const response = await fetch(url, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  // Read failures as TEXT, before any JSON parsing.
  //
  // SP-API does not always answer with JSON — an edge 429, an HTML error page
  // or an empty body will all throw a SyntaxError if you call .json() first,
  // and that error destroys the HTTP status and Amazon's own message along
  // with it. You end up debugging "Unexpected token <" instead of reading
  // "403 AccessDeniedException".
  //
  // Amazon also classifies its own errors. `x-amzn-errortype` carries the
  // exception class and `x-amzn-RequestId` is the first thing Amazon Support
  // asks for. Keep both instead of guessing from the status code.
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `SP-API ${method} ${path} failed (${response.status}): ${errorText}`
    );
    error.status = response.status;
    error.responseBody = errorText;
    error.amznErrorType = response.headers.get("x-amzn-errortype");
    error.amznRequestId = response.headers.get("x-amzn-RequestId");
    // Best effort only — callers that want Amazon's structured
    // { errors: [{ code, message }] } shape can read error.response, but a body
    // that is not JSON leaves it undefined rather than throwing.
    try {
      error.response = JSON.parse(errorText);
    } catch {
      // Not JSON. errorText still has everything Amazon said.
    }
    throw error;
  }

  // Handle empty responses (201 Created, 204 No Content)
  if (response.status === 201 || response.status === 204) {
    return { status: response.status };
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("json")) {
    return { status: response.status };
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Self-test — run this file directly to verify your credentials
// ---------------------------------------------------------------------------

const isMainModule = process.argv[1]?.endsWith("sp-api-auth.js");
if (isMainModule) {
  (async () => {
    console.log("Testing SP-API auth...\n");

    try {
      console.log("1. LWA token exchange...");
      const token = await getLwaAccessToken();
      console.log(`   OK — token: ${token.slice(0, 20)}...`);

      console.log("2. Test SP-API call (GET /sellers/v1/marketplaceParticipations)...");
      const result = await spApiRequest("GET", "/sellers/v1/marketplaceParticipations");
      const marketplaces = result.payload || [];
      console.log(`   OK — found ${marketplaces.length} marketplace(s):`);
      for (const mp of marketplaces) {
        const m = mp.marketplace;
        console.log(`   - ${m.name} (${m.id}) — ${m.countryCode}`);
      }

      console.log("\nAuth passed.");
    } catch (err) {
      console.error("\nAuth test failed:", err.message);
      process.exit(1);
    }
  })();
}
