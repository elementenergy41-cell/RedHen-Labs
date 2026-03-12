/**
 * SP-API Solicitations — Request a Product Review
 *
 * Sends an automated review and seller feedback request for an Amazon order
 * using the Solicitations API. This is the same mechanism as the
 * "Request a Review" button in Seller Central.
 *
 * Important constraints:
 *   - Orders must be between 5 and 30 days old (Amazon enforces this)
 *   - Each order can only be solicited once
 *   - Amazon sends their standard template — you cannot customize the message
 *   - Rate limit: ~1 request per second (be conservative)
 *
 * Usage:
 *   node request-review.js --order-id 123-4567890-1234567
 *   node request-review.js --order-id 123-4567890-1234567 --marketplace ATVPDKIKX0DER
 */

import { spApiRequest } from "./sp-api-auth.js";
import "dotenv/config";

const MARKETPLACE_ID = process.env.SP_API_MARKETPLACE_ID || "ATVPDKIKX0DER";

// ---------------------------------------------------------------------------
// Error codes that mean "don't retry"
// ---------------------------------------------------------------------------

/**
 * Amazon returns specific error codes when a solicitation can't be sent.
 * These are permanent — retrying won't help.
 */
const INELIGIBLE_CODES = new Set([
  "InvalidInput",           // Bad order ID format
  "INVALID_ORDER_STATE",    // Order cancelled, returned, etc.
  "ALREADY_SOLICITED",      // Review already requested for this order
  "BUYER_OPTED_OUT",        // Buyer has opted out of messages
  "ORDER_NOT_ELIGIBLE",     // Generic ineligibility
  "Unauthorized",           // Outside 5-30 day window
  "AccessDenied",           // Missing permissions
]);

// ---------------------------------------------------------------------------
// Send a review request
// ---------------------------------------------------------------------------

/**
 * Send a review/feedback solicitation for a single order.
 *
 * @param {string} orderId - Amazon order ID (e.g., "123-4567890-1234567")
 * @param {string} [marketplaceId] - Marketplace ID (defaults to US)
 * @returns {Promise<Object>} Result with status and details
 */
async function requestReview(orderId, marketplaceId = MARKETPLACE_ID) {
  const path = `/solicitations/v1/orders/${orderId}/solicitations/productReviewAndSellerFeedback`;

  try {
    const response = await spApiRequest("POST", path, {
      queryParams: { marketplaceIds: marketplaceId },
      body: {}, // Empty body — Amazon uses their own template
    });

    return { success: true, orderId, status: response.status || 201 };
  } catch (err) {
    const errorCode = parseErrorCode(err);

    return {
      success: false,
      orderId,
      errorCode,
      message: err.message,
      retryable: !INELIGIBLE_CODES.has(errorCode),
    };
  }
}

/**
 * Send review requests for multiple orders with rate limiting.
 *
 * Includes delays between requests to respect Amazon's rate limits
 * and a circuit breaker that stops after too many consecutive throttles.
 *
 * @param {string[]} orderIds - Array of Amazon order IDs
 * @param {Object} [options]
 * @param {number} [options.delayMs=5000] - Delay between requests (ms)
 * @param {number} [options.batchSize=10] - Pause after this many requests
 * @param {number} [options.batchPauseMs=15000] - Pause duration between batches
 * @param {number} [options.maxThrottles=3] - Stop after this many consecutive throttles
 * @returns {Promise<Object>} Summary of results
 */
async function requestReviewsBatch(orderIds, options = {}) {
  const {
    delayMs = 5000,
    batchSize = 10,
    batchPauseMs = 15000,
    maxThrottles = 3,
  } = options;

  const results = { sent: 0, skipped: 0, failed: 0, throttled: 0, details: [] };
  let consecutiveThrottles = 0;

  for (let i = 0; i < orderIds.length; i++) {
    const orderId = orderIds[i];

    // Circuit breaker — stop if too many throttles
    if (consecutiveThrottles >= maxThrottles) {
      console.log(`\nCircuit breaker: ${maxThrottles} consecutive throttles. Stopping.`);
      // Mark remaining orders as skipped
      results.skipped += orderIds.length - i;
      break;
    }

    // Send the request
    const result = await requestReview(orderId);
    results.details.push(result);

    if (result.success) {
      results.sent++;
      consecutiveThrottles = 0;
      console.log(`  [${i + 1}/${orderIds.length}] ${orderId} — sent`);
    } else if (result.errorCode === "QuotaExceeded" || result.errorCode === "TooManyRequests") {
      results.throttled++;
      consecutiveThrottles++;
      console.log(`  [${i + 1}/${orderIds.length}] ${orderId} — throttled`);
    } else if (!result.retryable) {
      results.skipped++;
      consecutiveThrottles = 0;
      console.log(`  [${i + 1}/${orderIds.length}] ${orderId} — ${result.errorCode}`);
    } else {
      results.failed++;
      consecutiveThrottles = 0;
      console.log(`  [${i + 1}/${orderIds.length}] ${orderId} — error: ${result.message}`);
    }

    // Rate limiting
    if (i < orderIds.length - 1) {
      // Extra pause after each batch
      if ((i + 1) % batchSize === 0) {
        console.log(`  Batch pause (${batchPauseMs / 1000}s)...`);
        await sleep(batchPauseMs);
      } else {
        await sleep(delayMs);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract an Amazon error code from an SP-API error response.
 * Amazon's error format: { errors: [{ code: "...", message: "..." }] }
 */
function parseErrorCode(err) {
  if (err.response?.errors?.[0]?.code) {
    return err.response.errors[0].code;
  }
  if (err.status === 429) return "TooManyRequests";
  if (err.status === 403) return "AccessDenied";
  return "Unknown";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const args = process.argv.slice(2);
  const orderId = getArg(args, "--order-id");
  const marketplaceId = getArg(args, "--marketplace") || MARKETPLACE_ID;

  if (!orderId) {
    console.log("Usage: node request-review.js --order-id 123-4567890-1234567");
    console.log("");
    console.log("Options:");
    console.log("  --order-id       Amazon order ID (required)");
    console.log("  --marketplace    Marketplace ID (default: ATVPDKIKX0DER / US)");
    console.log("");
    console.log("Notes:");
    console.log("  - Order must be 5-30 days old");
    console.log("  - Each order can only be solicited once");
    console.log("  - Amazon sends their standard review request template");
    process.exit(0);
  }

  console.log(`\nRequesting review for order: ${orderId}`);
  console.log(`Marketplace: ${marketplaceId}\n`);

  const result = await requestReview(orderId, marketplaceId);

  if (result.success) {
    console.log("Review request sent successfully.");
  } else {
    console.log(`Failed: ${result.errorCode}`);
    console.log(`Message: ${result.message}`);
    console.log(`Retryable: ${result.retryable}`);
  }
})();

function getArg(args, name) {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}
