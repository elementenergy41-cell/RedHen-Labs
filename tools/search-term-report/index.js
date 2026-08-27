// Amazon Sponsored Products Search Term Report — parser and analyzer.
//
// Zero dependencies. Node 18+. MIT licensed — use it however you like.
//
// Amazon's search term report is the most useful file an Amazon advertiser has
// and the most annoying to work with: the column names are long, they contain
// commas and parentheses, and the numeric columns arrive as formatted strings.
// This module normalizes it and answers the four questions worth asking:
//
//   1. How much am I spending on search terms that have never produced an order?
//   2. How concentrated are my sales?
//   3. Which terms have proven themselves enough to promote to exact match?
//   4. Which terms have taken enough clicks to be worth negating?
//
// The thresholds are arguments, not opinions baked into the code. Defaults come
// from the methodology documented at https://rrw-ads.com/blog/amazon-ppc-benchmarks

/** Amazon's headers vary slightly by report version; match on a normalized key. */
const COLUMN_ALIASES = {
  searchterm: "searchTerm",
  customersearchterm: "searchTerm",
  campaignname: "campaign",
  adgroupname: "adGroup",
  targeting: "targeting",
  matchtype: "matchType",
  impressions: "impressions",
  clicks: "clicks",
  spend: "spend",
  "7daytotalsales": "sales",
  "14daytotalsales": "sales",
  "totalsales": "sales",
  "7daytotalorders": "orders",
  "14daytotalorders": "orders",
  "totalorders": "orders",
};

const NUMERIC = new Set(["impressions", "clicks", "spend", "sales", "orders"]);

const normalizeKey = (h) =>
  String(h).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");

/** Amazon emits "1,234.56", "$12.34", "45%", and occasionally an empty string. */
function toNumber(value) {
  if (value == null) return 0;
  const cleaned = String(value).replace(/[$,%\s]/g, "").replace(/,/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Minimal RFC-4180 CSV splitter — Amazon quotes fields containing commas. */
function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i += 1; }
      else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Parse a search term report CSV into normalized row objects.
 * Unrecognized columns are preserved under `raw`.
 */
export function parseSearchTermReport(csvText) {
  const lines = String(csvText).split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const mapped = headers.map((h) => COLUMN_ALIASES[normalizeKey(h)] || null);

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = { raw: {} };
    headers.forEach((header, i) => {
      const key = mapped[i];
      const value = cells[i];
      if (key) row[key] = NUMERIC.has(key) ? toNumber(value) : String(value ?? "").trim();
      else row.raw[header] = value;
    });
    return row;
  });
}

/**
 * Collapse rows to one entry per search term, summing metrics.
 * A term appears once per campaign/ad group/date in Amazon's export; the
 * question "does this term convert" is about the term, not the row.
 */
export function aggregateBySearchTerm(rows) {
  const byTerm = new Map();
  for (const r of rows) {
    const term = r.searchTerm;
    if (!term || term === "*") continue;
    const acc = byTerm.get(term) || {
      searchTerm: term, impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0,
      sourceCampaigns: new Set(),
    };
    acc.impressions += r.impressions || 0;
    acc.clicks += r.clicks || 0;
    acc.spend += r.spend || 0;
    acc.sales += r.sales || 0;
    acc.orders += r.orders || 0;
    if (r.campaign) acc.sourceCampaigns.add(r.campaign);
    byTerm.set(term, acc);
  }
  return [...byTerm.values()].map((t) => ({
    ...t,
    sourceCampaigns: [...t.sourceCampaigns],
    acos: t.sales > 0 ? t.spend / t.sales : null,
    conversionRate: t.clicks > 0 ? t.orders / t.clicks : 0,
  }));
}

/**
 * Summarize an aggregated report.
 *
 * @param {object[]} terms       output of aggregateBySearchTerm
 * @param {object}   [options]
 * @param {number}   [options.harvestMinOrders=2]  orders to call a term proven
 * @param {number}   [options.negateMinClicks=20]  clicks before zero orders is evidence
 */
export function analyze(terms, options = {}) {
  const { harvestMinOrders = 2, negateMinClicks = 20 } = options;

  const totalSpend = terms.reduce((s, t) => s + t.spend, 0);
  const totalSales = terms.reduce((s, t) => s + t.sales, 0);
  const totalOrders = terms.reduce((s, t) => s + t.orders, 0);
  const totalClicks = terms.reduce((s, t) => s + t.clicks, 0);

  const zeroOrder = terms.filter((t) => t.orders === 0);
  const wasted = zeroOrder.filter((t) => t.clicks > 0);
  const wastedSpend = wasted.reduce((s, t) => s + t.spend, 0);

  const bySales = [...terms].sort((a, b) => b.sales - a.sales);
  const shareOfSales = (n) =>
    totalSales > 0 ? bySales.slice(0, n).reduce((s, t) => s + t.sales, 0) / totalSales : 0;

  return {
    totals: {
      searchTerms: terms.length,
      impressions: terms.reduce((s, t) => s + t.impressions, 0),
      clicks: totalClicks,
      spend: round(totalSpend),
      sales: round(totalSales),
      orders: totalOrders,
      acos: totalSales > 0 ? round(totalSpend / totalSales, 4) : null,
      conversionRate: totalClicks > 0 ? round(totalOrders / totalClicks, 4) : 0,
    },
    waste: {
      termsWithZeroOrders: zeroOrder.length,
      shareOfTermsWithZeroOrders: pct(zeroOrder.length, terms.length),
      termsClickedButNeverOrdered: wasted.length,
      spendOnZeroOrderTerms: round(wastedSpend),
      shareOfSpendOnZeroOrderTerms: pct(wastedSpend, totalSpend),
    },
    concentration: {
      shareOfTermsWithAnyOrder: pct(terms.filter((t) => t.orders > 0).length, terms.length),
      top10TermsShareOfSales: round(shareOfSales(10), 4),
      top50TermsShareOfSales: round(shareOfSales(50), 4),
      // One order is noise. See docs/keyword-harvesting.md.
      termsWithExactlyOneOrder: terms.filter((t) => t.orders === 1).length,
      termsWithThreeOrMoreOrders: terms.filter((t) => t.orders >= 3).length,
    },
    candidates: {
      harvest: terms
        .filter((t) => t.orders >= harvestMinOrders)
        .sort((a, b) => b.orders - a.orders)
        .map((t) => ({
          searchTerm: t.searchTerm, orders: t.orders, spend: round(t.spend),
          acos: t.acos == null ? null : round(t.acos, 4),
          // More than one source means negating only one leaves the others paying.
          sourceCampaigns: t.sourceCampaigns,
          multiSource: t.sourceCampaigns.length > 1,
        })),
      negate: terms
        .filter((t) => t.orders === 0 && t.clicks >= negateMinClicks)
        .sort((a, b) => b.spend - a.spend)
        .map((t) => ({ searchTerm: t.searchTerm, clicks: t.clicks, spend: round(t.spend) })),
    },
  };
}

const round = (n, dp = 2) => Number(n.toFixed(dp));
const pct = (part, whole) => (whole > 0 ? Number((part / whole).toFixed(4)) : 0);

/** Convenience: CSV text in, analysis out. */
export function analyzeReport(csvText, options) {
  return analyze(aggregateBySearchTerm(parseSearchTermReport(csvText)), options);
}
