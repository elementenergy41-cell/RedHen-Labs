# SP-API Examples

Standalone Node.js examples for Amazon's Selling Partner API (SP-API). No external AWS SDK required — these use only Node.js built-in modules (`crypto`, `zlib`, `https`).

These examples cover the parts of SP-API that are hardest to get right from Amazon's documentation alone.

## Prerequisites

- Node.js 18+
- An Amazon SP-API developer application ([setup guide](https://developer-docs.amazon.com/sp-api/docs/registering-as-a-developer))
- IAM user + IAM role for SP-API signing ([IAM setup guide](https://developer-docs.amazon.com/sp-api/docs/creating-and-configuring-iam-policies-and-entities))
- A seller who has authorized your application via OAuth

## Environment Variables

Create a `.env` file (or set these in your environment):

```bash
# LWA (Login with Amazon) credentials — from your SP-API app
SP_API_CLIENT_ID=amzn1.application-oa2-client.xxxxx
SP_API_CLIENT_SECRET=your-client-secret

# AWS IAM credentials — for SigV4 signing
AWS_SP_API_ACCESS_KEY_ID=AKIA...
AWS_SP_API_SECRET_ACCESS_KEY=your-iam-secret
AWS_SP_API_ROLE_ARN=arn:aws:iam::123456789:role/your-sp-api-role

# User's refresh token — obtained via OAuth authorization flow
SP_API_REFRESH_TOKEN=Atzr|your-refresh-token

# Marketplace (US default)
SP_API_MARKETPLACE_ID=ATVPDKIKX0DER
```

## Examples

| File | What It Does |
|------|-------------|
| [sp-api-auth.js](sp-api-auth.js) | LWA token exchange, STS AssumeRole, and SigV4 request signing — the complete auth chain |
| [get-orders-report.js](get-orders-report.js) | Request, poll, download, and decompress an SP-API report |
| [request-review.js](request-review.js) | Send a review/feedback solicitation for an order via the Solicitations API |
| [get-fba-fees.js](get-fba-fees.js) | Get FBA fee estimates (referral fee, fulfillment fee) for an ASIN |

## Running

```bash
# Install dotenv for loading .env files (only dependency)
npm install dotenv

# Run any example
node examples/sp-api-auth.js
node examples/get-orders-report.js
node examples/request-review.js --order-id 123-4567890-1234567
node examples/get-fba-fees.js --asin B0XXXXXXXXX
```

## Auth Chain Overview

Every SP-API request requires three layers of authentication:

```
1. LWA Token Exchange
   POST https://api.amazon.com/auth/o2/token
   → Returns: access_token (goes in x-amz-access-token header)

2. STS AssumeRole
   POST https://sts.amazonaws.com/ (signed with IAM user creds)
   → Returns: temporary accessKeyId, secretAccessKey, sessionToken

3. SigV4 Request Signing
   Sign the actual SP-API request with the STS temporary credentials
   → Produces: Authorization header with AWS4-HMAC-SHA256 signature
```

All three must succeed before you can make any SP-API call. The auth example handles all of this and exports a reusable `spApiRequest()` function used by the other examples.

## Common Pitfalls

- **SigV4 signing order matters** — headers must be sorted alphabetically, payload must be SHA256 hashed
- **STS uses IAM user credentials**, not the temporary credentials — don't mix them up
- **LWA tokens expire in 1 hour** — cache them but refresh before expiry
- **Report downloads use pre-signed S3 URLs** — no auth headers needed for the download itself
- **Reports are GZIP compressed** — decompress before parsing
- **Solicitations API has strict eligibility windows** — orders must be 5-30 days old
- **Fee estimates need a price** — if you don't provide one, Amazon may return an error

## Marketplace IDs

| Marketplace | ID |
|------------|-----|
| US | ATVPDKIKX0DER |
| Canada | A2EUQ1WTGCTBG2 |
| Mexico | A1AM78C64UM0Y8 |
| Brazil | A2Q3Y263D00KWC |
| UK | A1F83G8C2ARO7P |
| Germany | A1PA6795UKMFR9 |
| France | A13V1IB3VIYZZH |
| Italy | APJ6JRA9NG5V4 |
| Spain | A1RKKUPIHCS9HS |
| Japan | A1VC38T7YXB528 |
| Australia | A39IBJ37TRP1C6 |

## SP-API Endpoints by Region

| Region | Endpoint |
|--------|----------|
| North America | sellingpartnerapi-na.amazon.com |
| Europe | sellingpartnerapi-eu.amazon.com |
| Far East | sellingpartnerapi-fe.amazon.com |

---

Built by [RedHen Labs](https://rrw-ads.com) — if you'd rather not build all this yourself, we automate Amazon PPC management, profit tracking, and review requests out of the box.
