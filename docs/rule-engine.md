# Rule Engine

Every automation in RedHen Labs is built from the same shape: **conditions** are
evaluated over a **lookback window**, and entities that satisfy them receive an
**action**. The action becomes a proposal, not a change, unless the automation is
explicitly set to run unattended.

---

## The model

```
Automation
├── scope        which campaigns / ad groups the rule may touch
├── schedule     how often it evaluates (e.g. every 7 days)
├── rules[]
│   ├── conditions[]   metric + operator + value  (ALL must hold)
│   ├── lookback_days  the window metrics are summed over
│   └── actions        what to do with entities that qualify
└── auto_apply   false = propose and wait; true = act unattended
```

**Conditions are AND-ed.** A rule with `clicks >= 20` and `orders = 0` fires only
for entities satisfying both.

**Metrics are summed over the lookback window**, not averaged per day. A 30-day
lookback on `orders >= 3` means three orders across those 30 days.

---

## Available condition metrics

`impressions`, `clicks`, `spend`, `sales`, `orders`, `conversions`, `acos`,
`roas`, `cvr`, `ctr`, `cpc`, `bid`

Operators: `>=`, `>`, `<=`, `<`, `=`

`cvr` is the conversion rate — there is no `conversion_rate`, and a condition
naming it is rejected. `conversions` is an alias for `orders`, and the
bid-automation editor does not offer it. `bid` is the target's current effective
bid. A metric the target has no data for **fails** the condition rather than
being guessed at.

---

## Worked examples

**Scale a proven keyword**
```
Conditions:   acos <= 27  AND  orders >= 5
Lookback:     30 days
Action:       increase bid by 20%
Reason:       Converting well below target ACoS with enough orders to
              trust the signal. Buy more of what is working.
```

**Stop a losing keyword**
```
Conditions:   spend >= 16  AND  orders = 0
Lookback:     30 days
Action:       pause keyword
Reason:       Sufficient spend to conclude the keyword does not convert.
              Escalation from an earlier bid reduction at $10 spend.
```

**Harvest a search term**
```
Conditions:   orders >= 2
Lookback:     30 days
Action:       create exact-match keyword in destination campaign
              (+ optional negative-exact in source)
```

Machine-readable versions: [`examples/`](../examples/)

---

## Why lookback is about volume, not the calendar

A longer window makes any condition more likely to trip, because metrics
accumulate. That cuts both ways: a 60-day lookback on `orders >= 3` is a *weaker*
test than 30 days, because three orders spread over two months is a slower rate.

**Match the window to your volume, not to a calendar habit.** A decisive
condition — $16 of spend with zero orders — is decisive whether it accrued over
14 days or 30. A marginal one is not.

---

## Approval is the default

Automated changes enter a review queue. You see the entity, the current value,
the proposed value, and the condition that fired. You approve or reject.

**Unattended operation** is opt-in and ships switched off. It is enabled
deliberately, one automation at a time, not as a global switch — the intended
pattern is to run an automation in proposal mode until you trust it on a specific
product, then let that one act.

Which engine you can hand the keys to depends on your plan. The rule engine
described on this page is part of Professional ($129/mo), and so is its
unattended mode. The AI bid engine is separate: it starts at Growth ($69/mo), and
since 2026-09-11 an individual AI profile on Growth may also apply its own bid
changes unattended. Sponsored Display bid recommendations are the one thing that
never runs unattended, on any plan. See [`pricing.md`](pricing.md).

Guardrails that apply either way:

- **Bid ceiling** — `max_bid`, the ceiling a rule may never exceed. It is set
  **per rule**, inside that rule's `actions`; there is no automation-level
  ceiling. This is the real protection, more than undo is — and a rule that
  raises a bid without one of its own runs against a $10.00 default, which is
  almost certainly not what you want.
- **Bid floor** — `min_bid`, also per rule, and it binds in both directions: a
  floor pulls a bid up to reach it as well as stopping a cut below it.
- **Full audit log** — every change recorded with old value, new value and cause
- **One-click undo** — reverts bid and state changes
- **Approval by default** — every automation and AI profile is created with
  auto-apply off, so an account that changes nothing until you say so is the
  starting state, not a mode you have to find

The design reason: autonomous bidding in previously-used tools damaged the
founder's own account more than once. Approval-first is a response to that, not a
marketing position.

---

## Multi-rule reconciliation

When several rules could act on the same entity in one run, the engine resolves
them rather than issuing conflicting writes. A single entity receives at most one
bid change per run.

---

## Related

- [`amazon-ppc-automation.md`](amazon-ppc-automation.md) — the automation types
- [`keyword-harvesting.md`](keyword-harvesting.md)
- [`negative-keywords.md`](negative-keywords.md)
- [`../schema/rule.schema.json`](../schema/rule.schema.json) — JSON Schema
- Article: https://rrw-ads.com/blog/amazon-ppc-automation-rules
- Article: https://rrw-ads.com/blog/rules-vs-ai
- Article: https://rrw-ads.com/blog/over-optimizing-amazon-bids
