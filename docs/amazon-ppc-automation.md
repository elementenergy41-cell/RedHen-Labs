# Amazon PPC Automation

The automation types RedHen Labs provides, what each one decides, and what it
writes back to Amazon. All of them share the condition/action model described in
[`rule-engine.md`](rule-engine.md), and all of them propose rather than apply
unless explicitly set otherwise.

---

## The types

| Automation | Decides | Writes to Amazon |
|---|---|---|
| **Bid rules** | Whether a keyword or target's bid should move | Keyword/target bid |
| **Keyword harvesting** | Whether a search term has proven itself | New keyword; optional negative in source |
| **Negative keywords** | Whether a term should stop being paid for | Negative keyword or negative product target |
| **Budget** | Whether a campaign's daily budget should move | Campaign daily budget |
| **Placement** | Whether a placement modifier should move | Campaign placement modifiers |
| **Inventory guards** | Whether stock is too low to keep advertising | Bid reduction or pause |
| **Dayparting** | What the bid should be at this hour | Keyword/target bid, then restore |
| **Review requests** | Whether an order is eligible for a review request | Solicitations API call |

---

## Bid rules

The most common pattern is a tiered stack rather than one rule:

```
Scale:    acos <= 27  AND  orders >= 5   → increase bid 20%
Rein in:  acos > 27   AND  orders >= 5   → reduce toward target ACoS
Reset:    acos > 40   AND  orders < 5    → reset bid to CPC
Warn:     spend >= 10 AND  orders = 0    → reduce bid
Kill:     spend >= 16 AND  orders = 0    → pause
```

Each tier answers a different question. The escalation from "reduce at $10" to
"pause at $16" exists so that a keyword is given a cheaper chance before it is
switched off.

**Bid ceiling.** Every bid automation is bounded by a maximum the operator sets.
The ceiling — not the undo button — is the real protection: it means a bidding war
you cannot win on the math gets capped rather than chased.

---

## Inventory guards

Reads days-of-supply per ASIN and reduces bids or pauses targets below a
threshold you set, recovering automatically above a second threshold.

**The reason is rank, not spend.** Running out of stock loses the consistent
availability signal Amazon favours; rank and Buy Box position slide and do not
snap back on restock. Set the threshold to your own lead time — if production and
inbound take three weeks, a 45-day threshold gives real cushion.

---

## Placement modifiers

Placement optimization runs inside the AI feature rather than as a standalone
rule. It is opt-in per AI profile, bounded by a maximum step per change and a
maximum total adjustment, and is **human-review only** — it proposes, it never
applies on its own.

**The technique it executes:** a low base bid with a high top-of-search modifier
on proven targets. This buys the position that converts without raising the bid
everywhere.

⚠️ **Modifiers stack on dynamic bidding.** Base bid × dynamic bidding ×
placement modifier compounds — an $0.80 bid can clear well over $3.00. This is
the single most common way a placement strategy goes wrong.

---

## AI-assisted recommendations

Claude-powered analysis of your actual campaign data, producing suggestions with
confidence scores and the reasoning shown. Configurable aggression profile,
per-product target ACoS, and a configurable lookback.

**AI is a supporting tool, not the product.** Rules handle exact mechanics; AI
catches relevance a threshold cannot see — for example, that a high-ACoS term is
the category-defining phrase for the product and should be defended rather than
cut. The two run alongside each other.

---

## Review requests

Triggers Amazon's own **Request a Review** through the Solicitations API on a
daily schedule for eligible orders, with per-product toggles, inside Amazon's
eligibility window.

No buyer-seller messaging, no custom email, no incentives — there is nothing to
get wrong, which is why this is the one automation that runs unattended by
default.

---

## Related

- [`rule-engine.md`](rule-engine.md)
- [`keyword-harvesting.md`](keyword-harvesting.md)
- [`negative-keywords.md`](negative-keywords.md)
- [`dayparting.md`](dayparting.md)
- Article: https://rrw-ads.com/blog/top-of-search-placement-bidding
- Article: https://rrw-ads.com/blog/throttle-ads-before-stockout
