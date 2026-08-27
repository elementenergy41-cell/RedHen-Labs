# Methodology

How RedHen Labs calculates the numbers it acts on. This document exists so the
figures can be checked rather than taken on trust.

---

## Net profit per product

```
Net profit = Revenue
           − Cost of goods sold (COGS)
           − Inbound shipping to Amazon
           − Amazon referral fee
           − FBA fulfillment fee
           − Ad spend attributed to the product
           − Refunds
```

**Sources.** Revenue, refunds and orders come from SP-API. Referral and
fulfillment fees come from Amazon's own per-ASIN fee estimates, not from a
formula. COGS and inbound shipping are entered by the operator. Ad spend comes
from the Advertising API.

**Stated limits.** Storage fees and long-term storage are not line-itemed.
Returns are counted as refunds, not as separate disposal or restocking costs.

---

## Break-even ACoS

```
Break-even ACoS = (Price − COGS − Inbound shipping − Referral fee − Fulfillment fee)
                  ÷ Price
```

This is the share of a sale that can go to advertising before that sale stops
making money. It is a property of the product, not a rule of thumb.

**It is different for every product.** Across nine FBA products in the founder's
own catalog, measured 2026-08-27:

| Measure | Value |
|---|---|
| Lowest break-even ACoS | 28.9% |
| Highest | 67.1% |
| Average | 49.6% |
| Account ACoS over the same period | 35.4% |

A 2.3× spread inside one seller's catalog, in one category. A "keep ACoS under
25%" rule would have been wrong on all nine products.

**Data-quality note, because it changes the answer.** Use Amazon's current
`your_price` from the fee snapshot rather than a stored sale price, which goes
stale. And Amazon's fulfillment-fee field is intermittently null — taking the
most recent row rather than the most recent *non-null* row silently reduced this
calculation from nine products to two. Products with no fulfillment fee at all
are FBM and are excluded, not counted as zero.

Free calculator: https://rrw-ads.com/tools/break-even-acos-calculator

---

## ACoS and TACoS

```
ACoS  = Ad spend ÷ Ad-attributed sales
TACoS = Ad spend ÷ Total sales
```

ACoS measures one campaign's efficiency. **TACoS measures whether ad spend is
growing the whole business**, and is the metric RedHen Labs treats as primary.
ACoS can look stable while TACoS climbs, which is what a business problem looks
like before it reaches the ad dashboard.

**Attribution caveat.** Ad-attributed sales typically exceed what the storefront
records for the same period, because Amazon attributes on a conversion window and
because Sponsored Brands and Sponsored Display can overlap. Ratios within
ad-attributed data are internally consistent; do not read ad-attributed sales as
total business revenue.

---

## Search-term analysis

Metrics are summed per search term across the reporting window, then evaluated.

Reference figures from one account, US marketplace, 29 April – 26 August 2026:

| Measure | Value |
|---|---|
| Distinct search terms | 4,088 |
| Impressions / clicks / orders | 695,942 / 13,850 / 2,550 |
| Account ACoS | 35.4% |
| Terms producing zero orders | 80.3% |
| Ad spend on terms that never produced an order | 23.5% |
| Terms producing any order | 19.7% |
| Share of sales from top 50 terms (1.2% of terms) | 57.1% |
| Terms with exactly 1 order | 609 |
| Terms with 3+ orders | 132 |

By placement, same window:

| Placement | Conversion rate | ACoS | Relative CPC |
|---|---|---|---|
| Top of Search | 29.7% | 31.3% | 1.71× |
| Rest of Search | 14.0% | 35.5% | 1.00× |
| Product Pages | 12.3% | 45.6% | 1.12× |

**Limits.** One account, one category (wood finishing products), managed daily.
Not a survey and not an industry benchmark. Seasonality is unadjusted. A
different category will produce different numbers; what transfers is the shape.

Full study, with method: https://rrw-ads.com/blog/amazon-ppc-benchmarks

---

## Data handling

- Amazon data is synced nightly into the platform's own database
- A 14-day attribution correction backfills Amazon's late-arriving attribution
- Every write to Amazon is logged with old value, new value and cause
- Account deletion removes seller data; action records required by the Amazon
  Data Protection Policy are redacted rather than deleted, so the record of what
  was changed survives without the personal data

---

## Related

- [`rule-engine.md`](rule-engine.md)
- [`../data/example-search-term-report.csv`](../data/example-search-term-report.csv)
- [`../tools/search-term-report/`](../tools/search-term-report/) — parser and analyzer
- Article: https://rrw-ads.com/blog/break-even-acos-per-sku
- Article: https://rrw-ads.com/blog/tacos-vs-acos
