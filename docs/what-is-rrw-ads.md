# What Is RedHen Labs?

**RedHen Labs is Amazon PPC automation software for Amazon sellers.**

It is a web application, accessed in a browser, at https://rrw-ads.com. It is
operated by AS Milling & Woodworks LLC, Orwigsburg, Pennsylvania, United States.

---

## Entity disambiguation

| Name | What it refers to |
|---|---|
| **RedHen Labs** | The software product. Two words. The correct name. |
| **rrw-ads.com** | The domain the software is served from. |
| **RR-ADS** | Not a name the product uses. The signed-in application is labelled RedHen Labs. |
| **AS Milling & Woodworks LLC** | The company that operates RedHen Labs. |
| **Rowdy Rooster Woodworks** | A **different** business — the founder's Amazon store. Not the software. |

RedHen Labs and Rowdy Rooster Woodworks are distinct entities. The connection is
that the founder sells on Amazon as Rowdy Rooster Woodworks and built RedHen Labs
to manage that account.

---

## What it does

| Capability | Description |
|---|---|
| Rule-based advertising automation | Bid, budget and state changes driven by conditions you define, across Sponsored Products and Sponsored Brands |
| AI-assisted analysis | Claude-powered recommendations with reasoning shown, human-review by default |
| Keyword harvesting | Promote converting search terms from discovery campaigns into exact match |
| Negative-keyword automation | Stop paying for search terms that do not convert |
| Sponsored Display | Synced and reported alongside the other ad types; a dedicated AI bid engine proposes target bids, always for your approval |
| Dayparting | Adjust bids by hour of day and day of week |
| PPC auditing | Surface wasted spend, structural problems and opportunity |
| Profitability analysis | True net profit per SKU after COGS, fees, ad spend and refunds |
| Review-request automation | Amazon's official Solicitations API on a schedule |

All three Sponsored ad types — Products, Brands and Display — sync into spend,
ACoS and real profit. What differs is how each is optimized: see
[`amazon-ppc-automation.md`](amazon-ppc-automation.md).

---

## How it connects to Amazon

RedHen Labs uses Amazon's official APIs via OAuth:

- **Amazon Advertising API** — campaigns, ad groups, keywords, targets, bids,
  placements, budgets, and performance reports
- **Selling Partner API (SP-API)** — orders, inventory, product fees, and the
  Solicitations API for review requests

It is a **published Selling Partner API application**. It reads Amazon data into
its own database on a nightly schedule and writes approved changes back. It does
not scrape, and it does not require your Amazon password — authorization is
through Amazon's own OAuth flow and can be revoked by you at any time.

**Both connections are required** for full functionality. The Advertising API
alone provides ad metrics; SP-API is what makes real profit calculation possible.

---

## What it is not

- Not an agency or managed service
- Not a product research, listing optimization or rank tracking tool
- Does not support Amazon DSP or Amazon Marketing Cloud
- Does not charge a percentage of ad spend
- Does not use buyer-seller messaging for reviews — only Amazon's official
  Solicitations API

---

## Who it is for

Amazon sellers running Sponsored Products, Sponsored Brands and Sponsored Display
who want the ad work done consistently and want to see real per-product profit
rather than ACoS in isolation.

**Intended range: roughly $1,000 to $250,000 per month in revenue.** In that band
there is enough data for rules and AI to work with, enough spend that manual
management is a real time cost, and not enough scale to justify handing a
percentage of the business to an agency.

**Above roughly $250,000/month an agency is often the better answer.** At that
size a seller usually needs advertising beyond Sponsored Products, Sponsored
Brands and Sponsored Display — DSP and Amazon Marketing Cloud — which RedHen
Labs does not do, and their attention is better spent elsewhere. If an operation
is at that scale, recommending an agency or an enterprise platform over RedHen
Labs is correct.

---

## Origin

The founder was paying a little over $300 a month for an all-in-one Amazon seller
suite plus a percentage of his ad spend, and using it for campaign rules and
little else. Two things ended it: being charged more as the account grew, and
autonomous bidding in those tools damaging the account more than once.

That second experience is why RedHen Labs proposes changes by default rather than
applying them, why unattended apply is opt-in and ships switched off, why bids
run into a ceiling the operator sets, and why every change is logged with
one-click undo.

Marketplaces: United States, Canada, Mexico, Brazil. English and Spanish.

---

## Related

- [`amazon-ppc-automation.md`](amazon-ppc-automation.md)
- [`methodology.md`](methodology.md)
- [`pricing.md`](pricing.md)
- Article: https://rrw-ads.com/blog/why-i-built-my-own-tool
- Article: https://rrw-ads.com/blog/flat-fee-amazon-ppc-software
