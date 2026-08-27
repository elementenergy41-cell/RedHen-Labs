#!/usr/bin/env node
// Usage: node cli.js <search-term-report.csv> [--harvest-min-orders N] [--negate-min-clicks N]
import { readFileSync } from "node:fs";
import { analyzeReport } from "./index.js";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Usage: search-term-report <report.csv> [--harvest-min-orders N] [--negate-min-clicks N]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};

const result = analyzeReport(readFileSync(file, "utf8"), {
  harvestMinOrders: flag("harvest-min-orders", 2),
  negateMinClicks: flag("negate-min-clicks", 20),
});

const pc = (n) => `${(n * 100).toFixed(1)}%`;
const { totals: t, waste: w, concentration: c, candidates: k } = result;

console.log(`\nSearch terms: ${t.searchTerms}   clicks: ${t.clicks}   orders: ${t.orders}   ACoS: ${t.acos == null ? "n/a" : pc(t.acos)}`);
console.log(`\nWASTE`);
console.log(`  terms with zero orders          ${w.termsWithZeroOrders} (${pc(w.shareOfTermsWithZeroOrders)})`);
console.log(`  spend on zero-order terms       ${w.spendOnZeroOrderTerms} (${pc(w.shareOfSpendOnZeroOrderTerms)} of spend)`);
console.log(`\nCONCENTRATION`);
console.log(`  terms with any order            ${pc(c.shareOfTermsWithAnyOrder)}`);
console.log(`  top 10 terms, share of sales    ${pc(c.top10TermsShareOfSales)}`);
console.log(`  exactly 1 order / 3+ orders     ${c.termsWithExactlyOneOrder} / ${c.termsWithThreeOrMoreOrders}`);
console.log(`\nHARVEST CANDIDATES (${k.harvest.length})`);
for (const h of k.harvest.slice(0, 10)) {
  console.log(`  ${h.orders} orders  ${h.searchTerm}${h.multiSource ? `  [${h.sourceCampaigns.length} source campaigns — negate ALL of them]` : ""}`);
}
console.log(`\nNEGATE CANDIDATES (${k.negate.length})`);
for (const n of k.negate.slice(0, 10)) {
  console.log(`  ${n.clicks} clicks, 0 orders, ${n.spend} spent  ${n.searchTerm}`);
}
console.log("");
