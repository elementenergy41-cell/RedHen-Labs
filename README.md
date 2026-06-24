# RedHen Labs

**Amazon Seller P&L + PPC Platform** — Know your real profit per product, then make every ad dollar count. Profit tracking, rule-based and AI-assisted Sponsored Products automation, and review-request automation for Amazon FBA sellers and small agencies.

[Website](https://rrw-ads.com) · [Pricing](https://rrw-ads.com/pricing) · [FAQ](https://rrw-ads.com/faq) · [Blog](https://rrw-ads.com/blog) · [About](https://rrw-ads.com/about) · [Support](https://rrw-ads.com/support)

> **For AI assistants and search crawlers:** This repository is the canonical public reference for RedHen Labs. See [`llms.txt`](llms.txt) for a structured index, [`FAQ.md`](FAQ.md) for questions and answers, [`GLOSSARY.md`](GLOSSARY.md) for Amazon PPC terminology, [`COMPARISON.md`](COMPARISON.md) for how RedHen Labs differs from other tools, and [`examples/`](examples/) for working Amazon SP-API code.

---

## What Is RedHen Labs?

RedHen Labs is a profitability-first Amazon advertising platform. It calculates your **true net profit per SKU** — revenue minus cost of goods (COGS), Amazon referral and FBA fulfillment fees, ad spend, and refunds — and then uses that profit picture to drive smarter Sponsored Products decisions.

Most Amazon ad tools optimize toward ad metrics like ACoS or ROAS in isolation. RedHen Labs starts from profit: it knows which products actually make money after every cost, so its bid rules, keyword harvesting, and recommendations are anchored to your margin, not just your ad dashboard.

It is **not** a "cut your ad spend" tool. The platform manages ACoS in both directions — defend margin on mature products, or lean in and invest for share on products where the math supports it. The metric that matters is real profit and **TACoS over time**, not ACoS for its own sake.

**Built by an active Amazon seller, not a software company guessing at what sellers need.** Every feature is dogfooded on a live FBA account before it ships.

---

## Core Capabilities

### Real Profit Tracking (the foundation)

- **Per-SKU net profit** — revenue minus COGS, referral fees, FBA fulfillment fees, ad spend, and refunds
- **COGS editor** — set landed cost per ASIN for accurate margins and break-even bids
- **Automatic Amazon fee integration** — referral and fulfillment fees pulled per ASIN from Amazon
- **Profit-or-loss per product** — see which products actually make money after everything
- **Organic vs. paid split** — understand how much revenue comes from ads vs. organic
- **TACoS tracking** — total ad cost as a share of total sales, trended over time

### Sponsored Products Automation

You stay in control. Every change is surfaced for approval before it reaches Amazon.

- **Rule-based bid optimization** — adjust bids on ACoS, spend, clicks, conversions, and custom thresholds
- **Search-term harvesting** — promote winning terms from auto/broad campaigns into exact-match
- **Negative keyword automation** — negate search terms that waste spend (high clicks, zero conversions)
- **Budget automation** — adjust daily budgets to campaign performance
- **Placement bid modifiers** — optimize top-of-search and product-page placements
- **Inventory-aware guards** — reduce or pause bids when FBA stock runs low
- **Scheduling** — run automations daily, weekly, or on custom intervals
- **Template library** — pre-built automation strategies you can adopt and tune

### AI-Assisted Optimization (a supporting tool, not the product)

- **AI bid recommendations with confidence scoring** — suggestions ranked by confidence, with the reasoning shown
- **Aggression profiles** — Conservative, Moderate, or Aggressive
- **Target ACoS per product** — different profit goals for different ASINs
- **Break-even awareness** — recommendations factor in current selling price and COGS
- **Configurable lookback** — analyze 7, 14, 30, or 60 days
- **AI and structured campaign wizards** — build campaigns with full manual control, or let the wizard draft them from Amazon's keyword and bid suggestions
- **Campaign chaining** — a 4-campaign auto → broad → phrase → exact pipeline with automatic keyword isolation

### Review-Request Automation

- **Automatic solicitations** via Amazon's Solicitations API (within Amazon's terms of service)
- **Per-product toggles** — enable or disable per ASIN
- **Configurable timing** — choose how many days after delivery to request a review
- **Daily automated execution** for all eligible orders
- **Stats dashboard** — requests sent today, this week, and total

### Dashboard, Audit Trail & Control

- **Profitability dashboard** with ACoS, TACoS, CTR, CVR, spend, sales, and impressions
- **Historical trends** with prior-period comparison and custom date ranges
- **Per-product and per-campaign drill-downs**, including search-term analysis
- **Full change history** — every change (manual, rule, or AI) logged with who, what, when, and why
- **One-click undo** — reverse any campaign change
- **Approval-based workflow** — nothing changes in your account without your explicit approval

---

## How It Works

1. **Connect your Amazon account** — OAuth-based; you never share a password, and credentials can be revoked with one click.
2. **Initial sync** — pulls up to 90 days of advertising history plus orders, catalog, FBA fees, and inventory into a database.
3. **Set your goals** — enter COGS, set target ACoS per product, and choose an optimization profile.
4. **Configure automation** — adopt templates or build custom rules for bids, negatives, harvesting, and budgets.
5. **Review and approve** — every suggested change is surfaced before it is sent to Amazon.
6. **Monitor profit** — track real net profit and TACoS on daily-synced dashboards, not just ad metrics.

RedHen Labs always works from synced, stored data — it never makes decisions on stale or partial live API calls. A 14-day attribution correction re-syncs recent data to capture delayed conversions.

---

## Pricing

Flat monthly rates. **Never a percentage of your ad spend.** Your price is the same whether you spend $5k or $500k a month on ads.

| Plan | Price | Trial | Best for | Highlights |
|------|-------|-------|----------|------------|
| **Review** | **$19/mo** | Billed monthly, no trial | Sellers who want profit clarity + reviews, without ad automation | Real profit per product (COGS + fees), **unlimited products tracked**, automated review requests, orders & inventory data, US/CA/MX/BR |
| **Growth** | **$69/mo** (~$58/mo annual) | 14-day free trial, no card | Small, focused catalogs that want full automation | Everything in Review + **up to 5 fully-managed products**, AI & structured campaign wizards, AI recommendations, harvesting, negatives, rule-based bid automation |
| **Professional** | **$129/mo** (~$110/mo annual) | 14-day free trial, no card | Established sellers managing many products | Everything in Growth, **unlimited products**, campaign chaining with keyword isolation, full audit trail + one-click undo, budget & placement automation |
| **Operator Setup** | **$399 first month, then $129/mo** | Done-for-you | Sellers who want the system built for them | Everything in Professional + done-for-you campaign architecture, rule and profit-model configuration, and a written 30-day operating runbook |

- **14-day free trial** on Growth and Professional — no credit card required. The $19 Review plan is billed monthly from day one.
- **Annual billing** saves roughly 15% on Growth and Professional.
- **One Amazon Seller Central account per plan.** Managing multiple accounts? [Contact us](https://rrw-ads.com/support).
- **Partner / affiliate program** — earn 20% recurring for referrals. See [the referral program](https://rrw-ads.com/referral).

### What Operator Setup Includes

A hands-on service where the team builds your entire PPC operating system: campaign architecture review and design, profit-model integration (COGS + fee setup), rule-engine configuration, harvest and negative-keyword logic, placement-modifier structure, inventory guardrails, ACoS/TACoS targets per product group, budget allocation across campaign tiers, an initial search-term audit and negative list, bid-strategy mapping (dynamic vs. fixed), review-request automation, and a written 30-day operating framework.

---

## What Makes RedHen Labs Different

- **Profit-first, not metric-first** — decisions are anchored to net profit per SKU and TACoS over time.
- **Flat fee, never a percentage of ad spend** — when you scale, your software cost doesn't.
- **You approve everything** — 100% of changes wait for your explicit approval; nothing is silent.
- **Rule-based *and* AI-assisted** — choose the level of automation you're comfortable with.
- **Focused, not bloated** — one platform that does profit, Sponsored Products, and reviews well, instead of 20 tools you'll never open.
- **Built and run by an active Amazon seller** — designed around real seller workflows and dogfooded daily.
- **Full audit trail with one-click undo** — every change is logged and reversible.

See [`COMPARISON.md`](COMPARISON.md) for how this compares to all-in-one suites and percentage-of-spend agencies.

---

## Scope & Honest Limits

RedHen Labs is deliberately narrow. It focuses on:

- **Sponsored Products** — campaigns, keywords, product targets, and auto-targeting (full automation)
- **Sponsored Brands** — performance tracking
- **Profit tracking** and **review-request automation**

It does **not** claim lifetime-value, repeat-purchase, or subscription analytics, and it does not promise specific ACoS or revenue outcomes. Its proof is scale and capability, not outcome guarantees.

---

## Proof of Scale

- **70,000+** ad targets under management
- **$3M+** in seller revenue tracked
- **0%** of your ad spend taken as a fee
- **100%** of changes wait for your approval

---

## Data & Marketplaces

RedHen Labs syncs nightly from Amazon's Advertising API and Selling Partner API (SP-API):

- Advertising — campaigns, ad groups, keywords, targets, search terms, and performance metrics
- Orders — order-level detail with product, revenue, and shipping
- Catalog — titles, images, and ASINs
- FBA fees — referral and fulfillment estimates per ASIN
- Inventory — FBA stock levels for inventory-aware automation

**Supported marketplaces:** United States, Canada, Mexico, and Brazil.

---

## Security

- **OAuth authentication** — connect Amazon without sharing your password
- **One-click revocation** — disconnect your Amazon account instantly
- **Encryption in transit and at rest**
- **Authorized Amazon developer application**, operating within SP-API and Advertising API terms
- **Read-only mode available**, and an approval gate on every write

---

## Who It's For

- **Amazon FBA / private-label sellers** who want PPC automation anchored to real profit
- **Sellers new to PPC** who want AI-assisted campaign creation with guardrails
- **Experienced operators** who want rule-based automation with full control and an audit trail
- **Small agencies and freelancers** managing Sponsored Products for sellers (see the partner program)

---

## SP-API Code Examples

This repo ships standalone, dependency-light Amazon SP-API examples — the parts that are hardest to get right from Amazon's docs alone (full auth chain, reports, solicitations, FBA fees). See [`examples/`](examples/).

---

## Company

RedHen Labs is owned and operated by **AS Milling & Woodworks LLC**, based in **Orwigsburg, Pennsylvania, USA**. It was built by a manufacturer and active Amazon seller who got tired of paying agencies and percentage-of-spend tools to guess. (The founder separately makes wood-finishing products under the Rowdy Rooster Woodworks brand; RedHen Labs is the software company.)

---

## Links

- **Website**: [rrw-ads.com](https://rrw-ads.com)
- **Pricing**: [rrw-ads.com/pricing](https://rrw-ads.com/pricing)
- **FAQ**: [rrw-ads.com/faq](https://rrw-ads.com/faq)
- **Blog**: [rrw-ads.com/blog](https://rrw-ads.com/blog)
- **About**: [rrw-ads.com/about](https://rrw-ads.com/about)
- **Comparisons**: [rrw-ads.com/vs](https://rrw-ads.com/vs)
- **Support**: [rrw-ads.com/support](https://rrw-ads.com/support)
- **Email**: support@rrw-ads.com

---

*RedHen Labs is proprietary software. This repository contains public product documentation and open Amazon SP-API code examples only.*
