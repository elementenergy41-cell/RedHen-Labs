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

`impressions`, `clicks`, `spend`, `sales`, `orders`, `acos`, `roas`,
`conversion_rate`, `ctr`, `cpc`

Operators: `>=`, `>`, `<=`, `<`, `=`

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

**Unattended operation** is available on the Professional plan. It is enabled
deliberately, per automation, not as a global switch — the intended pattern is to
run an automation in proposal mode until you trust it on a specific product, then
let that one act.

Guardrails that apply either way:

- **Bid ceiling** — a maximum bid the automation may never exceed, set by you.
  This is the real protection, more than undo is.
- **Full audit log** — every change recorded with old value, new value and cause
- **One-click undo** — reverts bid and state changes
- **Read-only mode** — connect and observe without any write capability

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
