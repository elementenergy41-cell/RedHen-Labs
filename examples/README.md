# SP-API Examples

Standalone Node.js examples for Amazon's Selling Partner API (SP-API). No AWS SDK and no SP-API client library — just `fetch` and the Node built-ins `zlib` and `util`. The only external package is `dotenv`, and only for loading a `.env` file.

These examples cover the parts of SP-API that are hardest to get right from Amazon's documentation alone.

## Prerequisites

- Node.js 18+
- An Amazon SP-API developer application ([setup guide](https://developer-docs.amazon.com/sp-api/docs/registering-as-a-developer))
- A seller who has authorized your application via OAuth

No AWS account, IAM user or IAM role is needed. Amazon removed the SigV4 signing requirement from SP-API, so an LWA access token is the only credential involved. If a tutorial walks you through creating IAM entities for SP-API, it predates that change.

## Environment Variables

Create a `.env` file (or set these in your environment):

```bash
# LWA (Login with Amazon) credentials — from your SP-API app
SP_API_CLIENT_ID=amzn1.application-oa2-client.xxxxx
SP_API_CLIENT_SECRET=your-client-secret

# User's refresh token — obtained via OAuth authorization flow
SP_API_REFRESH_TOKEN=Atzr|your-refresh-token

# Region — NA (default), EU or FE
SP_API_REGION=NA

# Marketplace (US default)
SP_API_MARKETPLACE_ID=ATVPDKIKX0DER
```

## Examples

| File | What It Does |
|------|-------------|
| [sp-api-auth.js](sp-api-auth.js) | LWA token exchange, and the reusable `spApiRequest()` the other examples call. That is the whole auth chain — no AWS steps |
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

An SP-API request needs one credential — an LWA access token:

```
LWA Token Exchange
  POST https://api.amazon.com/auth/o2/token
  → Returns: access_token (goes in the x-amz-access-token header)
```

That is the whole chain. Amazon removed the SigV4 / IAM-role requirement, so there is no STS AssumeRole step and no request signing. The auth example handles this and exports a reusable `spApiRequest()` function used by the other examples.

One header to get right on top of the token: Amazon's Agent Policy requires software acting on a seller's behalf to identify itself with an `Agent/<your agent name>` token in the user agent of **every** Amazon-bound request — the API calls, the LWA token exchange, and pre-signed report-document downloads alike. Use the agent name from your Solution Provider Portal registration.

## Common Pitfalls

- **Amazon labels its own errors** — read `x-amzn-errortype` and `x-amzn-RequestId` off the response instead of guessing from the status code. `x-amzn-RequestId` is the first thing Amazon Support asks for
- **Error bodies are not always JSON** — read them with `.text()` first. Calling `.json()` on an HTML error page throws a parse error that destroys the HTTP status and Amazon's own message
- **Per-operation rate limits are published, and lower than you'd guess** — the single-ASIN fee endpoints are 1 req/sec burst 2, while the batch `getMyFeesEstimates` is 0.5 req/sec burst 1. Check the reference page for the operation you call; don't carry one endpoint's limit to another
- **A 429 means wait, not fail** — retry it after a backoff. Dropping the batch instead turns a throttle into silently missing data
- **Orders reports ignore `marketplaceIds`** — `GET_FLAT_FILE_ALL_ORDERS_DATA_*` returns the account's orders across every marketplace regardless. Filter on the per-row `sales-channel` column, or you'll mix currencies and double-count
- **LWA tokens expire in 1 hour** — cache them but refresh before expiry
- **Report downloads use pre-signed S3 URLs** — no auth token needed for the download itself, though the agent user-agent still belongs on it
- **Reports are GZIP compressed** — decompress before parsing
- **Solicitations API has strict eligibility windows** — orders must be 5-30 days old, and a repeat request comes back as `Unauthorized`, which means "already requested", not an auth failure
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
