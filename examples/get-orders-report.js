/**
 * SP-API Reports — Request, Poll, Download, and Parse
 *
 * Demonstrates the full report lifecycle:
 *   1. Create a report request
 *   2. Poll until Amazon finishes generating it
 *   3. Get the download URL
 *   4. Download and decompress the report
 *   5. Parse the TSV data
 *
 * This example requests an orders report, but the same pattern works for
 * any SP-API report type (listings, inventory, FBA shipments, etc.).
 *
 * Usage:
 *   node get-orders-report.js
 *   node get-orders-report.js --days 30
 *   node get-orders-report.js --report-type GET_MERCHANT_LISTINGS_ALL_DATA
 */

import { spApiRequest } from "./sp-api-auth.js";
import zlib from "zlib";
import { promisify } from "util";
import "dotenv/config";

const gunzip = promisify(zlib.gunzip);

const MARKETPLACE_ID = process.env.SP_API_MARKETPLACE_ID || "ATVPDKIKX0DER";

// ---------------------------------------------------------------------------
// Common report types
// ---------------------------------------------------------------------------

const REPORT_TYPES = {
  // Orders — all order data by order date
  orders: "GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL",
  // Listings — all active and inactive listings
  listings: "GET_MERCHANT_LISTINGS_ALL_DATA",
  // FBA inventory — current FBA stock levels
  fbaInventory: "GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA",
  // FBA restock — restock recommendations
  restock: "GET_RESTOCK_INVENTORY_RECOMMENDATIONS_REPORT",
};

// ---------------------------------------------------------------------------
// Step 1: Create a report request
// ---------------------------------------------------------------------------

/**
 * Request Amazon to generate a report.
 *
 * Some report types (orders, returns) support date ranges.
 * Others (listings, inventory) return current-state snapshots and don't use dates.
 *
 * @param {string} reportType - Amazon report type identifier
 * @param {Object} [options]
 * @param {string} [options.startDate] - ISO 8601 date string
 * @param {string} [options.endDate] - ISO 8601 date string
 * @returns {Promise<string>} reportId
 */
async function createReport(reportType, { startDate, endDate } = {}) {
  const body = {
    reportType,
    marketplaceIds: [MARKETPLACE_ID],
  };

  // Only add date range for report types that support it
  if (startDate) body.dataStartTime = startDate;
  if (endDate) body.dataEndTime = endDate;

  console.log(`Creating report: ${reportType}`);
  if (startDate) console.log(`  Date range: ${startDate} to ${endDate}`);

  const response = await spApiRequest("POST", "/reports/2021-06-30/reports", { body });

  const reportId = response.reportId;
  console.log(`  Report ID: ${reportId}`);
  return reportId;
}

// ---------------------------------------------------------------------------
// Step 2: Poll until report is ready
// ---------------------------------------------------------------------------

/**
 * Poll the report status until it's done.
 *
 * Amazon processes reports asynchronously. Status flow:
 *   IN_QUEUE → IN_PROGRESS → DONE (or CANCELLED / FATAL)
 *
 * Typical processing time: 30 seconds to 5 minutes depending on data volume.
 *
 * @param {string} reportId
 * @returns {Promise<string>} reportDocumentId (used to download the report)
 */
async function pollReport(reportId) {
  const MAX_ATTEMPTS = 30;
  const POLL_INTERVAL_MS = 10_000; // 10 seconds

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const report = await spApiRequest("GET", `/reports/2021-06-30/reports/${reportId}`);

    console.log(`  Poll ${attempt}/${MAX_ATTEMPTS}: ${report.processingStatus}`);

    switch (report.processingStatus) {
      case "DONE":
        return report.reportDocumentId;

      case "CANCELLED":
        throw new Error("Report was cancelled by Amazon");

      case "FATAL":
        throw new Error("Report generation failed (FATAL)");

      case "IN_QUEUE":
      case "IN_PROGRESS":
        // Wait and try again
        await sleep(POLL_INTERVAL_MS);
        break;

      default:
        throw new Error(`Unknown report status: ${report.processingStatus}`);
    }
  }

  throw new Error(`Report did not complete after ${MAX_ATTEMPTS} attempts`);
}

// ---------------------------------------------------------------------------
// Step 3: Download and decompress the report
// ---------------------------------------------------------------------------

/**
 * Download a completed report.
 *
 * Amazon returns a pre-signed S3 URL and a compression algorithm.
 * The download itself doesn't need authentication — the URL is self-authenticating.
 * Most reports are GZIP compressed and need to be decompressed before parsing.
 *
 * @param {string} reportDocumentId
 * @returns {Promise<string>} Raw report content (tab-separated values)
 */
async function downloadReport(reportDocumentId) {
  // Get the download URL
  const doc = await spApiRequest(
    "GET",
    `/reports/2021-06-30/documents/${reportDocumentId}`
  );

  console.log(`  Downloading from S3...`);
  console.log(`  Compression: ${doc.compressionAlgorithm || "none"}`);

  // Download the file (no auth needed — pre-signed URL)
  const response = await fetch(doc.url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // Decompress if needed
  if (doc.compressionAlgorithm === "GZIP") {
    const decompressed = await gunzip(buffer);
    return decompressed.toString("utf-8");
  }

  return buffer.toString("utf-8");
}

// ---------------------------------------------------------------------------
// Step 4: Parse the TSV data
// ---------------------------------------------------------------------------

/**
 * Parse a tab-separated values (TSV) string into an array of objects.
 *
 * Amazon SP-API reports use TSV format (not CSV). The first row is always
 * the header row with column names.
 *
 * @param {string} tsv - Raw TSV string
 * @returns {Array<Object>} Array of row objects keyed by column name
 */
function parseTsv(tsv) {
  const lines = tsv.trim().split("\n");
  if (lines.length < 2) return []; // Header only, no data

  const headers = lines[0].split("\t").map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split("\t");
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() || "";
    }
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main — run the full report lifecycle
// ---------------------------------------------------------------------------

(async () => {
  try {
    // Parse CLI arguments
    const args = process.argv.slice(2);
    const daysBack = parseInt(getArg(args, "--days") || "7", 10);
    const reportTypeKey = getArg(args, "--report-type") || "orders";

    // Resolve report type
    const reportType = REPORT_TYPES[reportTypeKey] || reportTypeKey;

    // Calculate date range (only for date-based reports)
    const useDateRange = ["orders"].includes(reportTypeKey) ||
      reportTypeKey.includes("ORDER");

    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    console.log(`\nSP-API Report Example`);
    console.log(`Report type: ${reportType}`);
    console.log(`Marketplace: ${MARKETPLACE_ID}\n`);

    // Step 1: Create report
    const reportId = await createReport(
      reportType,
      useDateRange ? { startDate, endDate } : {}
    );

    // Step 2: Poll until ready
    console.log(`\nPolling for completion...`);
    const documentId = await pollReport(reportId);
    console.log(`  Document ID: ${documentId}`);

    // Step 3: Download
    console.log(`\nDownloading report...`);
    const rawData = await downloadReport(documentId);

    // Step 4: Parse
    const rows = parseTsv(rawData);
    console.log(`\nParsed ${rows.length} rows`);

    // Show first 5 rows as preview
    if (rows.length > 0) {
      console.log(`\nColumns: ${Object.keys(rows[0]).join(", ")}`);
      console.log(`\nFirst ${Math.min(5, rows.length)} rows:`);
      for (const row of rows.slice(0, 5)) {
        console.log(JSON.stringify(row, null, 2));
      }
    }

    if (rows.length > 5) {
      console.log(`\n... and ${rows.length - 5} more rows`);
    }
  } catch (err) {
    console.error("\nError:", err.message);
    if (err.response) {
      console.error("Response:", JSON.stringify(err.response, null, 2));
    }
    process.exit(1);
  }
})();

function getArg(args, name) {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}
