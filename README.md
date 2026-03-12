# RedHenLabs

**Amazon Seller Profitability Platform** — Automated PPC management, real profit tracking, and review request automation for Amazon sellers and agencies.

[Website](https://rrw-ads.com) | [Pricing](https://rrw-ads.com/pricing) | [FAQ](https://rrw-ads.com/faq) | [Blog](https://rrw-ads.com/blog) | [Support](https://rrw-ads.com/support)

---

## What Is RedHenLabs?

RedHenLabs is a profitability-first Amazon PPC tool built by Amazon sellers. It combines real profit tracking (COGS, FBA fees, ad spend, refunds) with automated bid management, keyword harvesting, and review request automation — so you can stop guessing and start optimizing based on actual profit per SKU.

Unlike tools that only show ad metrics, RedHenLabs calculates your true net profit per product, then uses that data to drive smarter automation decisions.

---

## Core Features

### Real Profit Tracking

- **Per-SKU profitability** — revenue minus COGS, FBA fees, shipping, ad spend, refunds, and promotional discounts
- **COGS editor** — set cost of goods per ASIN for accurate margin calculations
- **Automatic FBA fee integration** — referral fees and fulfillment fees pulled directly from Amazon
- **Net profit/loss per product** — see which products actually make money after all costs
- **Organic vs. paid revenue split** — understand how much revenue comes from ads vs. organic traffic

### Campaign Management

- **Structured Campaign Wizard** — build campaigns with full control over categories, keywords, ASINs, and bids
- **AI Campaign Wizard** — AI-assisted campaign creation using Amazon's keyword and bid recommendations
- **Campaign chaining** — 4-campaign discovery-to-performance pipeline (auto, broad, phrase, exact) with automatic keyword isolation
- **Portfolio management** — organize campaigns into portfolios
- **Bidding strategies** — dynamic down only, dynamic up and down, or fixed bids
- **Placement bid modifiers** — top-of-search and product page modifier optimization
- **Bulk campaign actions** — pause, enable, archive, and adjust bids across multiple campaigns

### Rule-Based Automation

Set rules based on performance metrics and let RedHenLabs execute them automatically:

- **Bid optimization** — adjust bids based on ACoS, spend, clicks, conversions, and other performance thresholds
- **Negative keyword automation** — automatically negate search terms that waste spend (high clicks, zero conversions)
- **Search term harvesting** — automatically promote winning search terms from broad/auto campaigns into exact match campaigns
- **Budget automation** — dynamically adjust daily budgets based on campaign performance
- **Placement automation** (beta) — optimize top-of-search and product page bid modifiers
- **Inventory-aware budget guards** (beta) — automatically pause or reduce bids when FBA stock runs low
- **Scheduling** — run automations daily, weekly, or on custom intervals
- **Template library** — pre-built automation templates for common optimization strategies

### AI-Powered Optimization

- **AI recommendations with confidence scoring** — get bid change suggestions ranked by confidence level
- **Aggression controls** — choose Conservative, Moderate, or Aggressive optimization profiles
- **Target ACoS per product** — set different profitability goals for different ASINs
- **Penalty box strategy** — mid-range bids for keywords with uncertain performance data
- **AI insights with reasoning** — understand why each recommendation was made
- **Product price integration** — break-even calculations based on current selling price
- **Configurable lookback windows** — analyze 7, 14, 30, or 60 days of data

### Review Request Automation

- **Automatic review solicitation** via Amazon's Solicitations API (100% TOS compliant)
- **Per-product toggles** — enable or disable review requests for individual ASINs
- **Customizable delay** — set how many days after purchase to request a review (10-21 days)
- **Daily automated execution** — runs every night for all eligible orders
- **Stats dashboard** — track requests sent today, this week, and total

### Dashboard & Analytics

- **Real-time profitability dashboard** — see your numbers at a glance
- **Performance metrics** — ACoS, TACoS, CTR, CVR, spend, sales, impressions
- **Historical trend charts** — track performance over time with prior period comparison
- **Custom date ranges** — 3, 7, 14, 30, 60, or 90 day views
- **Per-product analytics** — drill into individual ASIN performance
- **Search term analysis** — see which search terms drive sales and which waste money
- **Campaign detail pages** — deep-dive into campaign, ad group, and keyword performance

### Audit Trail & Control

- **Full change history** — every change (AI, automation, or manual) is logged with who, what, when, and why
- **One-click undo** — reverse any campaign change instantly
- **Approval-based workflow** — review all AI and automation suggestions before they're applied
- **Batch approve/dismiss** — handle multiple suggestions at once

---

## Data Sync

RedHenLabs syncs your data nightly from Amazon's Ads API and Selling Partner API:

- **Advertising data** — campaigns, ad groups, keywords, targets, search terms, and performance metrics
- **Order data** — order-level detail with product, revenue, and shipping information
- **Product catalog** — titles, images, and ASINs from your seller account
- **FBA fees** — referral and fulfillment fee estimates per ASIN
- **Inventory levels** — FBA stock quantities for inventory-aware automation
- **14-day attribution correction** — automatically re-syncs recent data to capture delayed attribution
- **Multi-marketplace support** — US, Canada, Mexico, and Brazil

All data is synced to a database — RedHenLabs never makes decisions based on stale or incomplete API calls.

---

## Pricing

| Plan | Price | What's Included |
|------|-------|-----------------|
| **Review Automation** | $29/month | Automated review requests, orders & sales sync, product dashboard, inventory alerts |
| **Professional** | $129/month | Everything in Review + full PPC automation, AI recommendations, profit tracking, campaign wizards, audit trail |
| **Operator Setup** | $399 first month, then $129/month | Everything in Professional + done-for-you campaign architecture, rule configuration, and 30-day operating runbook |
| **Agency** | $399/month | Everything in Professional + up to 5 Amazon seller accounts, priority support, dedicated onboarding |

**All plans include a 14-day free trial. No credit card required.**

Annual billing available with ~15% discount.

### What's Included in Operator Setup

A hands-on setup service where we build your entire PPC automation stack:

- Campaign architecture review and design
- Profit model integration (COGS + fee setup for all products)
- Rule engine configuration from scratch
- Harvest and negative keyword logic alignment
- Placement modifier structure
- Inventory guardrail configuration
- ACoS/TACoS targets per product group
- Budget allocation across campaign tiers
- Search term audit + initial negative keyword list
- Bid strategy mapping (dynamic vs. fixed decisions)
- Review request automation setup
- Written 30-day operating framework and runbook

---

## How It Works

1. **Connect your Amazon account** — OAuth-based connection, your credentials are never stored
2. **Initial data sync** — pulls up to 90 days of historical advertising data plus orders, catalog, and inventory
3. **Set your goals** — define target ACoS per product, set COGS, choose optimization aggressiveness
4. **Configure automation** — use templates or build custom rules for bids, negatives, harvesting, and budgets
5. **Review and approve** — all changes are surfaced for your review before being sent to Amazon
6. **Monitor results** — track profit, not just ad metrics, with daily synced dashboards

---

## Security

- **OAuth authentication** — connect your Amazon account without sharing credentials
- **Token-based API access** — credentials are never stored on our servers
- **One-click credential revocation** — disconnect your Amazon account instantly
- **Bank-level encryption** — all data encrypted in transit and at rest
- **SP-API compliant** — fully authorized Amazon developer application

---

## Who It's For

- **Amazon FBA sellers** who want to automate PPC management based on real profitability data
- **Private label sellers** running Sponsored Products campaigns across multiple ASINs
- **Small agencies** managing PPC for multiple Amazon seller accounts
- **Sellers new to PPC** who want AI-assisted campaign creation and optimization
- **Experienced sellers** who want rule-based automation with full control and audit trails

---

## What Makes RedHenLabs Different

- **Profit-first approach** — decisions are based on net profit per SKU, not just ACoS or ROAS
- **Built by Amazon sellers** — designed around real seller workflows, not generic SaaS patterns
- **Rule-based AND AI-powered** — choose the automation style that fits your comfort level
- **Campaign chaining** — structured auto > broad > exact pipeline with automated keyword isolation
- **No percentage of ad spend** — flat monthly pricing regardless of how much you spend on ads
- **No minimum ad spend** — works for sellers at any scale
- **Full audit trail** — every change is logged and reversible
- **14-day attribution correction** — data accuracy that most tools skip

---

## Supported Amazon Ad Types

- **Sponsored Products** — campaigns, keywords, product targets, and auto-targeting
- **Sponsored Brands** — campaign and keyword performance tracking

---

## Links

- **Website**: [rrw-ads.com](https://rrw-ads.com)
- **Pricing**: [rrw-ads.com/pricing](https://rrw-ads.com/pricing)
- **FAQ**: [rrw-ads.com/faq](https://rrw-ads.com/faq)
- **Blog**: [rrw-ads.com/blog](https://rrw-ads.com/blog)
- **Support**: [rrw-ads.com/support](https://rrw-ads.com/support)
- **About**: [rrw-ads.com/about](https://rrw-ads.com/about)

---

## Contact

- **Email**: support@rrw-ads.com
- **Website**: [rrw-ads.com](https://rrw-ads.com)

---

*RedHenLabs is proprietary software. This repository contains product documentation only.*
