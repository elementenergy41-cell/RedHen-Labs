# Amazon PPC & Profit Glossary

Plain-language definitions of the Amazon advertising and seller-profitability terms used across [RedHen Labs](https://rrw-ads.com). See also the [README](README.md) and [FAQ](FAQ.md).

## Profitability terms

**Real profit (net profit per product)** — What you actually keep on a product after all costs: revenue minus cost of goods sold (COGS), Amazon referral fees, FBA fulfillment fees, ad spend, and refunds. RedHen Labs treats this — not ad metrics — as the number that matters.

**COGS (Cost of Goods Sold)** — Your landed unit cost: manufacturing plus inbound shipping and duties. Required for accurate margin and break-even bid calculations.

**Referral fee** — Amazon's commission on each sale, typically a category-based percentage of the item price.

**FBA fulfillment fee** — The per-unit fee Amazon charges to pick, pack, and ship an order through Fulfillment by Amazon, based on size and weight.

**Break-even ACoS** — The advertising cost of sales at which an additional sale makes zero profit. Above it you lose money on the ad; below it you profit. It depends on your margin after COGS and fees.

**Margin** — The share of revenue left as profit after costs. Gross margin is before ad spend; net margin is after everything.

## Advertising metrics

**ACoS (Advertising Cost of Sales)** — Ad spend divided by ad-attributed sales, as a percentage. Lower ACoS means more efficient ad-attributed sales, but minimizing ACoS is not the same as maximizing profit.

**TACoS (Total Advertising Cost of Sales)** — Ad spend divided by *total* sales (ad-attributed plus organic). Trended over time, TACoS shows whether advertising is building a self-sustaining organic business or just renting sales. RedHen Labs uses TACoS-over-time and real profit as its headline measures.

**ROAS (Return on Ad Spend)** — Ad-attributed revenue divided by ad spend. The inverse view of ACoS (ROAS = 1 / ACoS).

**CTR (Click-Through Rate)** — Clicks divided by impressions; how often shoppers who see your ad click it.

**CVR (Conversion Rate)** — Orders divided by clicks; how often a click becomes a sale.

**Impressions** — The number of times an ad was shown.

**Attribution window** — The period after an ad click during which a resulting sale is credited to the ad. Conversions can arrive late, which is why RedHen Labs re-syncs recent data (a 14-day attribution correction).

## Campaign structure

**Sponsored Products** — Amazon's keyword- and product-targeted ads that promote individual listings in search results and on product pages. RedHen Labs automates these fully.

**Sponsored Brands** — Banner-style ads featuring a brand logo and multiple products. RedHen Labs tracks their performance.

**Campaign** — The top-level ad container holding a budget and a bidding strategy.

**Ad group** — A grouping of keywords/targets and product ads within a campaign.

**Auto campaign (auto-targeting)** — A campaign where Amazon chooses what to match your products against. Useful for discovering new converting search terms.

**Manual campaign** — A campaign where you choose the keywords or product targets and set bids.

**Match types** — How closely a shopper's search must match your keyword: **broad** (loosest), **phrase** (in order), and **exact** (precise). Broad/auto discover terms; exact captures proven winners at controlled bids.

**Product targeting (ASIN targeting)** — Showing your ad on or against specific products (ASINs) or categories rather than search keywords.

## Optimization concepts

**Keyword harvesting** — Finding search terms that convert in auto/broad campaigns and promoting them into exact-match campaigns for tighter control. RedHen Labs automates auto → broad → phrase → exact promotion.

**Negative keywords** — Search terms you block from triggering your ads, usually because they get clicks but no conversions and waste spend. Automating negatives is a core spend-protection lever.

**Keyword isolation** — Preventing the same keyword from competing against itself across campaigns by negating harvested winners in the campaigns they graduated from. RedHen Labs' campaign chaining does this automatically.

**Campaign chaining** — A structured 4-campaign pipeline (auto → broad → phrase → exact) where discovery flows into performance and winners are isolated as they graduate.

**Bid** — The maximum you'll pay for a click on a keyword or target. Optimization adjusts bids toward your profit goals.

**Bidding strategy** — How Amazon adjusts your bids in real time: *dynamic down only* (lowers bids when a conversion looks unlikely), *dynamic up and down* (raises and lowers), or *fixed* (uses your bid as-is).

**Placement modifiers** — Percentage bid boosts for specific ad placements (top-of-search, rest-of-search, product pages) where performance differs.

**Dayparting** — Adjusting bids or budgets by time of day or day of week based on when conversions happen.

**Target ACoS** — The advertising cost of sales you're aiming for on a product, set relative to its break-even point and your profit goal. RedHen Labs supports a different target per product.

**Aggression profile** — A preset (Conservative, Moderate, Aggressive) that governs how boldly the optimizer changes bids.

## Amazon API & operations

**SP-API (Selling Partner API)** — Amazon's API for seller data: orders, catalog, fees, inventory, and reports. RedHen Labs uses it for profit and operations data. See [examples/](examples/).

**Advertising API** — Amazon's API for managing and reporting on Sponsored ads. RedHen Labs uses it for all PPC automation.

**Solicitations API** — The SP-API endpoint for sending Amazon's official "Request a Review" message for an eligible order. RedHen Labs automates these within Amazon's terms of service.

**OAuth** — The authorization method used to connect your Amazon account without sharing a password; access can be revoked at any time.

**Audit trail** — A complete log of every change (manual, rule-based, or AI) with who, what, when, and why — paired with one-click undo.

**Approval workflow** — The gate that holds every proposed change for your explicit approval before it reaches Amazon. At RedHen Labs, 100% of changes wait for approval.
