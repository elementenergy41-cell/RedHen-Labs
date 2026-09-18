# Amazon PPC Automation

The automation types RedHen Labs provides, what each one decides, and what it
writes back to Amazon. All of them share the condition/action model described in
[`rule-engine.md`](rule-engine.md), and all of them propose rather than apply
unless explicitly set otherwise.

**Which plan.** The rule engine — everything in the table below except review
requests — is part of Professional ($129/mo). AI recommendations, including the
separate Sponsored Display engine, start at Growth ($69/mo). Review-request
automation is on every paid plan, including Review ($19/mo).

---

## The types

| Automation | Ad products | Decides | Writes to Amazon |
|---|---|---|---|
| **Bid rules** | SP + SB | Whether a keyword or target's bid should move | Keyword/target bid |
| **Keyword harvesting** | SP + SB | Whether a search term has proven itself | New keyword; optional negative in source |
| **Negative keywords** | SP + SB | Whether a term should stop being paid for | Negative keyword or negative product target |
| **Budget** | SP + SB | Whether a campaign's daily budget should move | Campaign daily budget |
| **Placement** | SP only | Whether a placement modifier should move | Campaign placement modifiers |
| **Inventory guards** | SP + SB | Whether stock is too low to keep advertising | Bid reduction or pause |
| **Dayparting** | SP + SB | What the bid should be at this hour | Keyword/target bid, then restore |
| **Review requests** | n/a | Whether an order is eligible for a review request | Solicitations API call |

SP = Sponsored Products, SB = Sponsored Brands. Sponsored Brands negatives are
written at ad-group level, the only level Amazon accepts for them. The placement
automation acts on Sponsored Products only — see Placement modifiers below.
Sponsored Display is handled by a separate engine, also below.

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

Placement optimization comes in two forms, both Sponsored Products only. There is
a standalone placement automation in the rule engine, which behaves like the
other rules: it proposes by default, and you may authorize it to apply on its
own. There is also a per-AI-profile option that reuses the same decision logic —
opt-in, bounded by a maximum step per change and a maximum total adjustment, and
**human-review only**; it proposes, it never applies on its own.

Sponsored Brands campaigns have placement adjustments of their own at Amazon —
a different set, on a different range — and you can edit them by hand on the
campaign detail page. No automation moves them. Sponsored Display has no
placement adjustments at all.

**The technique both execute:** a low base bid with a high top-of-search modifier
on proven targets. This buys the position that converts without raising the bid
everywhere.

**Modifiers stack on dynamic bidding.** Base bid × dynamic bidding ×
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

## Sponsored Display — a separate engine

Sponsored Display is synced and reported alongside Sponsored Products and
Sponsored Brands, but it sits deliberately outside the rule-based automations
above. It has no keywords and no search terms, so harvesting and negative
keywords have nothing to act on, and Amazon refuses per-target bid writes on
conversion-optimised ad groups.

Instead it gets a dedicated AI bid engine over its audience and product targets,
which reports why any ad group was skipped — vCPM pricing, a `conversions` bid
optimization, or an active cost control.

**Its recommendations always queue for approval, on every plan including
Professional.** That is not a plan limit; it is a property of the engine.

On Growth and Professional, Sponsored Display campaigns also get their own table
where you can pause, activate and set daily budgets.

---

## Review requests

Triggers Amazon's own **Request a Review** through the Solicitations API on a
daily schedule for eligible orders, with per-product toggles, inside Amazon's
eligibility window.

No buyer-seller messaging, no custom email, no incentives: Amazon sends its own
template, so there is no message for us to get wrong.

**It is opt-in all the same, and every box that offers it starts unticked** — at
signup, and again when you enable a marketplace. Once you switch it on it runs to
its schedule without asking each time, which is the point of it. But it is the
one setting in this product with a footprint outside the app — it lands in your
buyers' inboxes under your name — so it has to be something you chose, not
something you failed to untick.

---

## Related

- [`rule-engine.md`](rule-engine.md)
- [`keyword-harvesting.md`](keyword-harvesting.md)
- [`negative-keywords.md`](negative-keywords.md)
- [`dayparting.md`](dayparting.md)
- Article: https://rrw-ads.com/blog/top-of-search-placement-bidding
- Article: https://rrw-ads.com/blog/throttle-ads-before-stockout
