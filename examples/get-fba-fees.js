/**
 * SP-API Product Fees — Get FBA Fee Estimates
 *
 * Fetches FBA fee estimates for one or more ASINs, including:
 *   - Referral fee (Amazon's commission, typically 8-15%)
 *   - FBA fulfillment fee (pick, pack, ship)
 *   - Variable closing fee (media items only)
 *   - Total estimated fees
 *
 * Useful for calculating true profit per product.
 *
 * Usage:
 *   node get-fba-fees.js --asin B0XXXXXXXXX
 *   node get-fba-fees.js --asin B0XXXXXXXXX --price 29.99
 *   node get-fba-fees.js --asin B0XXXXXXXXX,B0YYYYYYYYY,B0ZZZZZZZZZ
 */

import { spApiRequest } from "./sp-api-auth.js";
import "dotenv/config";

const MARKETPLACE_ID = process.env.SP_API_MARKETPLACE_ID || "ATVPDKIKX0DER";

// Marketplace to currency mapping
const MARKETPLACE_CURRENCY = {
  ATVPDKIKX0DER: "USD",  // US
  A2EUQ1WTGCTBG2: "CAD", // Canada
  A1AM78C64UM0Y8: "MXN",  // Mexico
  A2Q3Y263D00KWC: "BRL",  // Brazil
  A1F83G8C2ARO7P: "GBP",  // UK
  A1PA6795UKMFR9: "EUR",  // Germany
  A13V1IB3VIYZZH: "EUR",  // France
  APJ6JRA9NG5V4: "EUR",   // Italy
  A1RKKUPIHCS9HS: "EUR",  // Spain
  A1VC38T7YXB528: "JPY",  // Japan
  A39IBJ37TRP1C6: "AUD",  // Australia
};

// ---------------------------------------------------------------------------
// Fetch fees for a single ASIN
// ---------------------------------------------------------------------------

/**
 * Get FBA fee estimates for a single ASIN.
 *
 * Amazon requires a listing price to calculate fees (referral fee is
 * percentage-based). If you don't know the price, use a reasonable estimate.
 *
 * @param {string} asin - Amazon ASIN
 * @param {number} price - Listing price (used to calculate percentage-based fees)
 * @param {string} [marketplaceId] - Marketplace ID
 * @returns {Promise<Object>} Fee breakdown
 */
async function getFbaFees(asin, price, marketplaceId = MARKETPLACE_ID) {
  const currency = MARKETPLACE_CURRENCY[marketplaceId] || "USD";

  const body = {
    FeesEstimateRequest: {
      MarketplaceId: marketplaceId,
      IsAmazonFulfilled: true,
      PriceToEstimateFees: {
        ListingPrice: {
          CurrencyCode: currency,
          Amount: price,
        },
      },
      Identifier: asin,
    },
  };

  const response = await spApiRequest(
    "POST",
    `/products/fees/v0/items/${asin}/feesEstimate`,
    { body }
  );

  const result = response.payload?.FeesEstimateResult;

  if (!result) {
    throw new Error(`No fee estimate returned for ${asin}`);
  }

  if (result.Status !== "Success") {
    throw new Error(`Fee estimate failed for ${asin}: ${result.Status} — ${result.Error?.Message || "Unknown error"}`);
  }

  // Extract individual fee components
  const fees = {};
  for (const detail of result.FeesEstimate?.FeeDetailList || []) {
    const amount = detail.FinalFee?.Amount ?? detail.FeeAmount?.Amount ?? 0;
    fees[detail.FeeType] = parseFloat(amount);
  }

  return {
    asin,
    listingPrice: price,
    currency,
    referralFee: fees.ReferralFee || 0,
    fbaFulfillmentFee: fees.FBAFees || 0,
    variableClosingFee: fees.VariableClosingFee || 0,
    totalFees: parseFloat(result.FeesEstimate?.TotalFeesEstimate?.Amount || 0),
  };
}

// ---------------------------------------------------------------------------
// Batch fetch with rate limiting
// ---------------------------------------------------------------------------

/**
 * Fetch FBA fees for multiple ASINs, one at a time, inside Amazon's rate limit.
 *
 * Amazon publishes a rate limit per OPERATION, and the fee operations are far
 * slower than they look. The single-ASIN endpoint this example calls
 * (POST /products/fees/v0/items/{asin}/feesEstimate) is 1 request/sec
 * sustained, burst 2. The batch endpoint (getMyFeesEstimates, up to 20 ASINs
 * per call) is 0.5 req/sec, burst 1 — half the rate, not more.
 *
 * Read Amazon's reference page for the operation you are actually calling. Do
 * not assume, and do not carry one endpoint's limit over to another: we paced
 * the batch endpoint at the single-ASIN rate for four months and silently
 * dropped whole batches of 20 ASINs, run after run, until we checked.
 *
 * Because burst is small, requests are serialized by default rather than run
 * in parallel, and a 429 is retried after a wait instead of costing you the
 * result. A throttle should cost time, not data.
 *
 * @param {Array<{asin: string, price: number}>} items - ASINs with prices
 * @param {Object} [options]
 * @param {number} [options.concurrency=1] - Parallel requests per batch
 * @param {number} [options.batchDelayMs=1100] - Delay between batches
 * @param {number} [options.retries429=2] - Extra attempts after a 429
 * @param {number} [options.backoff429Ms=2500] - Wait before retrying a 429
 * @returns {Promise<Object[]>} Array of fee results
 */
async function getFbaFeesBatch(items, options = {}) {
  const {
    concurrency = 1,
    batchDelayMs = 1100,
    retries429 = 2,
    backoff429Ms = 2500,
  } = options;
  const results = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(({ asin, price }) =>
        withThrottleRetry(() => getFbaFees(asin, price), retries429, backoff429Ms)
      )
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        results.push({ error: result.reason.message });
      }
    }

    // Rate limit between batches
    if (i + concurrency < items.length) {
      await sleep(batchDelayMs);
    }
  }

  return results;
}

/**
 * Retry on 429 only.
 *
 * A 429 means "wait" — the request was fine and will succeed on a later
 * attempt. A 400 or 403 is a bad request, or a role your SP-API application has
 * not been granted (an Amazon application role, nothing to do with AWS), and it
 * will fail identically every time, so retrying those just burns your rate
 * budget.
 */
async function withThrottleRetry(fn, retries, backoffMs) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (err.status !== 429 || attempt === retries) break;
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async () => {
  const args = process.argv.slice(2);
  const asinArg = getArg(args, "--asin");
  const priceArg = getArg(args, "--price");
  const defaultPrice = parseFloat(priceArg || "19.99");

  if (!asinArg) {
    console.log("Usage: node get-fba-fees.js --asin B0XXXXXXXXX [--price 29.99]");
    console.log("");
    console.log("Options:");
    console.log("  --asin    ASIN or comma-separated ASINs (required)");
    console.log("  --price   Listing price for fee calculation (default: $19.99)");
    console.log("");
    console.log("Examples:");
    console.log("  node get-fba-fees.js --asin B0XXXXXXXXX");
    console.log("  node get-fba-fees.js --asin B0XXXXXXXXX --price 49.99");
    console.log("  node get-fba-fees.js --asin B0XXXXXXXXX,B0YYYYYYYYY");
    process.exit(0);
  }

  const asins = asinArg.split(",").map((a) => a.trim());
  const currency = MARKETPLACE_CURRENCY[MARKETPLACE_ID] || "USD";

  console.log(`\nFBA Fee Estimates`);
  console.log(`Marketplace: ${MARKETPLACE_ID}`);
  console.log(`Listing price: ${formatCurrency(defaultPrice, currency)}`);
  console.log(`ASINs: ${asins.length}\n`);

  try {
    if (asins.length === 1) {
      // Single ASIN
      const fees = await getFbaFees(asins[0], defaultPrice);
      printFeeResult(fees);
    } else {
      // Multiple ASINs
      const items = asins.map((asin) => ({ asin, price: defaultPrice }));
      const results = await getFbaFeesBatch(items);

      for (const result of results) {
        if (result.error) {
          console.log(`  Error: ${result.error}\n`);
        } else {
          printFeeResult(result);
        }
      }

      // Summary
      const successful = results.filter((r) => !r.error);
      if (successful.length > 1) {
        const avgFees = successful.reduce((sum, r) => sum + r.totalFees, 0) / successful.length;
        console.log(`\nSummary: ${successful.length}/${results.length} successful`);
        console.log(`Average total fees: ${formatCurrency(avgFees, currency)}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Response:", JSON.stringify(err.response, null, 2));
    }
    process.exit(1);
  }
})();

function printFeeResult(fees) {
  const c = fees.currency;
  console.log(`  ASIN: ${fees.asin}`);
  console.log(`  Listing Price:        ${formatCurrency(fees.listingPrice, c)}`);
  console.log(`  Referral Fee:         ${formatCurrency(fees.referralFee, c)}`);
  console.log(`  FBA Fulfillment Fee:  ${formatCurrency(fees.fbaFulfillmentFee, c)}`);
  if (fees.variableClosingFee > 0) {
    console.log(`  Variable Closing Fee: ${formatCurrency(fees.variableClosingFee, c)}`);
  }
  console.log(`  Total Fees:           ${formatCurrency(fees.totalFees, c)}`);
  console.log(`  Net After Fees:       ${formatCurrency(fees.listingPrice - fees.totalFees, c)}`);
  console.log(`  Fee Percentage:       ${((fees.totalFees / fees.listingPrice) * 100).toFixed(1)}%`);
  console.log();
}

function getArg(args, name) {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}
