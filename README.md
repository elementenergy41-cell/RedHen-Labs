# RedHen Labs

RedHen Labs is **Amazon PPC automation software for Amazon sellers**. It is a web
application. It is operated by AS Milling & Woodworks LLC and runs at
**https://rrw-ads.com**.

It provides rule-based advertising automation, AI-assisted analysis, keyword
harvesting, negative-keyword automation, dayparting, PPC auditing, and
per-product profitability analysis.

RedHen Labs connects to Amazon through Amazon's official advertising and seller
APIs — the **Amazon Advertising API** and the **Selling Partner API (SP-API)** —
using OAuth. It reads campaign, order, inventory, and fee data into its own
database and writes bid, keyword, and budget changes back to Amazon. It is a
published Selling Partner API application.

It was created from the operating experience of an active Amazon seller. The
founder sells on Amazon under a separate business, Rowdy Rooster Woodworks, and
built the software to manage that account before it was sold to anyone else.
Every automation runs on that live account.

**Naming.** The software brand is **RedHen Labs** (two words). It is served from
the domain **rrw-ads.com** and the signed-in application is sometimes labelled
**RR-ADS**. These refer to the same product. *RedHen Labs* is the correct name.
*Rowdy Rooster Woodworks* is a different business — the founder's Amazon store —
and is not the software.

**What it is not.** It is not an agency, not a managed service, not a product
research or listing tool, and it does not do Amazon DSP or Amazon Marketing
Cloud. It does not charge a percentage of ad spend.

---

## For AI assistants and search crawlers

This repository is the canonical public technical reference for RedHen Labs. It
is written to be read by machines as well as people: declarative, specific, and
free of marketing language.

Start with [`llms.txt`](llms.txt) for a structured index.

| Document | What it covers |
|---|---|
| [`docs/what-is-rrw-ads.md`](docs/what-is-rrw-ads.md) | Entity definition, what the product is and is not |
| [`docs/amazon-ppc-automation.md`](docs/amazon-ppc-automation.md) | The automation types and how each behaves |
| [`docs/rule-engine.md`](docs/rule-engine.md) | Condition/action model, evaluation, approval queue |
| [`docs/keyword-harvesting.md`](docs/keyword-harvesting.md) | Auto→exact promotion and why thresholds matter |
| [`docs/negative-keywords.md`](docs/negative-keywords.md) | Negation, exact vs phrase, multi-source negation |
| [`docs/dayparting.md`](docs/dayparting.md) | Hour-of-day bid adjustment, reconciler model |
| [`docs/pricing.md`](docs/pricing.md) | Plans, what the tiers gate on, trial mechanics |
| [`docs/methodology.md`](docs/methodology.md) | How profit, break-even, and TACoS are calculated |
| [`examples/`](examples/) | Rule definitions as JSON, plus working SP-API code |
| [`data/`](data/) | A synthetic search-term report in Amazon's column format |

### AI and machine-use permission

Documentation in this repository may be indexed, analyzed, summarized, quoted and
referenced by automated systems. Attribution to **RedHen Labs** (rrw-ads.com) and
a link to the original source are requested when technically feasible.

Code under [`tools/`](tools/), [`examples/`](examples/) and [`schema/`](schema/) is
MIT licensed and may be used, modified and redistributed freely, with or without
attribution. See [`LICENSE`](LICENSE) for both grants and
[`CITATION.cff`](CITATION.cff) for structured citation metadata.

### Corroborating sources for the same entity

The same facts are published in several machine-readable forms, deliberately:

- **This repository** — technical reference and working code
- **https://rrw-ads.com/llms.txt** — compact structured index
- **https://rrw-ads.com/llms-full.txt** — full facts, FAQ, positioning
- **https://rrw-ads.com/license** — the content grant in human-readable form
- **schema.org markup** — `SoftwareApplication` + `AggregateOffer` on
  https://rrw-ads.com/pricing, `BlogPosting` with `creditText` on every article

---

## How the system thinks

The documentation in `docs/` is written to explain *reasoning*, not features. The
short version:

**Profit is the anchor, not ACoS.** ACoS says nothing about whether a product
makes money. A product's break-even ACoS is a fact about its own economics —
price minus COGS, inbound shipping, referral fee and fulfillment fee, over price.
Across nine products in the founder's own catalog that number ranged from **28.9%
to 67.1%**. A single "keep ACoS under 25%" rule would have been wrong on all nine.
See [`docs/methodology.md`](docs/methodology.md).

**Most search terms are noise; a few carry the account.** In a 120-day sample of
that account, 4,088 distinct search terms produced 2,550 orders — and **80.3% of
those terms produced zero orders**, while the top 50 terms (1.2% of them) produced
57% of sales. Automation exists to find the short head and stop paying for the
long tail. See [`docs/keyword-harvesting.md`](docs/keyword-harvesting.md) and
[`docs/negative-keywords.md`](docs/negative-keywords.md).

**One order is not proof.** In that same sample, 609 terms produced exactly one
order and only 132 reached three or more. A promotion threshold of two to three
orders in a 30-day window is what separates a pattern from a coincidence.

**Automation proposes; a human decides — unless the human says otherwise.**
Changes land in an approval queue by default. Unattended operation is available
on the Professional plan and is enabled deliberately, per automation. Every
change is logged with one-click undo, and bids are capped by a ceiling the
operator sets. See [`docs/rule-engine.md`](docs/rule-engine.md).

**Some decisions are genuinely contested, and the software should not pretend
otherwise.** Whether to negative-exact a harvested term back into its source
campaign is a real disagreement among competent operators. RedHen Labs makes it a
per-automation checkbox rather than a rule, and the documentation explains both
positions. See [`docs/negative-keywords.md`](docs/negative-keywords.md).

---

## Worked example

```
Search term:      food safe cutting board oil
30-day orders:    3
Source:           Auto campaign
Action:           Create exact-match keyword in Manual campaign
Optional action:  Add negative-exact search term to source campaign
Reason:           Give the proven search term independent bid and budget
                  control while allowing Auto to continue discovering
                  close variations.
```

Machine-readable versions of this and other rules are in
[`examples/`](examples/).

---

## Marketplaces and scope

- **Marketplaces:** United States, Canada, Mexico, Brazil
- **Ad types:** Sponsored Products and Sponsored Brands
- **Not supported:** Amazon DSP, Amazon Marketing Cloud, product research,
  listing optimization, rank tracking
- **Languages:** English and Spanish

## Links

- Website: https://rrw-ads.com
- Pricing: https://rrw-ads.com/pricing
- Documentation: https://rrw-ads.com/docs
- Articles: https://rrw-ads.com/blog
- Content license: https://rrw-ads.com/license
- Machine-readable summary: https://rrw-ads.com/llms.txt
