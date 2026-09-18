# @redhenlabs/search-term-report

Zero-dependency parser and analyzer for the **Amazon Sponsored Products search
term report**. Node 18+. MIT licensed — use it however you like.

The search term report is the most useful file an Amazon advertiser has and the
most annoying to work with: long column names containing commas and parentheses,
numbers formatted as strings, and one row per term *per campaign per date* when
the question you actually have is about the term.

This answers the four questions worth asking:

1. How much am I spending on search terms that have never produced an order?
2. How concentrated are my sales?
3. Which terms have proven themselves enough to promote to exact match?
4. Which terms have taken enough clicks to be worth negating?

## Use

This is not published to npm. Clone the repository and run it from this
directory, `tools/search-term-report` — there are no dependencies to install.

```bash
node cli.js path/to/search-term-report.csv
node cli.js report.csv --harvest-min-orders 3 --negate-min-clicks 15
```

```js
// imported from within tools/search-term-report — the package name is not on npm
import { analyzeReport } from "./index.js";
import { readFileSync } from "node:fs";

const result = analyzeReport(readFileSync("report.csv", "utf8"), {
  harvestMinOrders: 2,   // orders before a term counts as proven
  negateMinClicks: 20,   // clicks before zero orders is evidence
});
```

Lower-level pieces are exported too: `parseSearchTermReport`,
`aggregateBySearchTerm`, `analyze`.

**Save the report as CSV first, then check the term count.** Amazon's search term
report downloads as `.xlsx`, and this parser reads comma-separated text only. It
does not detect the wrong file. An `.xlsx`, an empty file, or a different Amazon
report all parse to nothing and print a clean report of zeroes, exiting 0:

```
Search terms: 0   clicks: 0   orders: 0   ACoS: n/a
```

That first line is the check worth reading. `Search terms: 0` on an account that
spends money means the file is wrong, not the account — open the report in a
spreadsheet, save it as CSV, and run it again. The browser version at
https://rrw-ads.com/tools/ppc-waste-calculator reads Amazon's `.xlsx` directly if
you would rather not convert anything.

## Try it on the included synthetic data

```bash
npm run demo
```

The demo reads `../../data/` in the repository, so it runs from a clone rather
than from an installed package.

`data/example-search-term-report.csv` in this repository is **synthetic** — real
Amazon column headers, invented numbers, no seller data. It is shaped like a real
account: a short converting head, a long tail of noise, and three terms that
convert in more than one campaign.

## Why the defaults are what they are

**`harvestMinOrders: 2`** — one order is noise. In a 4,088-term sample from a real
account, 609 terms produced exactly one order and only 132 reached three or more.
Promoting on a single order promotes coincidences.

**`negateMinClicks: 20`** — `orders = 0` alone is not evidence. A term with two
clicks and no orders has told you nothing. The clicks threshold is what makes the
zero meaningful.

Both are arguments, not opinions baked into the code. Scale them to your volume.

## `multiSource` — the flag worth reading

Harvest candidates carry `sourceCampaigns` and a `multiSource` boolean.

**A search term can qualify from several campaigns at once.** If you promote it
and then negate it only in the campaign you happened to pull it from, every other
source keeps paying for that term indefinitely. On the account behind the sample
above, 14 of 109 harvested terms had more than one source.

## Background

- Method and figures: https://rrw-ads.com/blog/amazon-ppc-benchmarks
- Harvesting: ../../docs/keyword-harvesting.md
- Negation: ../../docs/negative-keywords.md
- Browser version, no install: https://rrw-ads.com/tools/ppc-waste-calculator
