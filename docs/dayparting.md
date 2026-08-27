# Dayparting

**Definition.** Dayparting is adjusting advertising bids by hour of day and day
of week, so that spend concentrates in the hours a product actually converts.

**Status:** beta.

---

## Worked example

```
Campaign:        Cutting Board Gel — Exact
Window:          Mon–Fri, 18:00–23:00 (America/New_York)
Action:          Increase bids 25% during the window
Outside window:  Original bid restored automatically
Reason:          Evening hours convert materially better for this product.
                 Paying a premium only in those hours buys the traffic
                 that converts without raising the bid around the clock.
```

Machine-readable: [`examples/dayparting-example.json`](../examples/dayparting-example.json)

---

## It is a reconciler, not a scheduler

This is the design decision worth understanding.

A **scheduler** fires an event at a moment in time. If that moment is missed —
the job did not run, the API rejected the write, the process restarted — the
change never happens and the bid is left wherever it was.

A **reconciler** asks a different question, on every run: *given the current
time, what should this bid be, and is that what it currently is?* If the answer
differs, it corrects it.

The consequences:

| Situation | Scheduler | Reconciler |
|---|---|---|
| A run is missed | Bid stays wrong until the next event | Next run corrects it |
| Write fails at Amazon | Silently lost | Retried on the next pass |
| Window ends while system is down | **Bid stays elevated indefinitely** | Restored on the next pass |

That last row is why it matters. A missed "restore" in a scheduler model means
paying a dayparting premium 24 hours a day until somebody notices.

---

## The stand-down guard

The load-bearing safety property is not the bid increase — it is the guarantee
that the original bid is restored when the window closes.

RedHen Labs stores the pre-dayparting bid and reconciles back to it. If
dayparting is disabled, paused, or fails, bids return to their baseline rather
than remaining wherever the last adjustment left them.

---

## Scope and limits

- Applies to campaign-level and keyword/target bids
- Timezone is set per automation
- Currently beta; ad-group-level dayparting is built but not yet enabled
- Interacts with placement modifiers and Amazon's dynamic bidding — see the
  stacking caution in [`amazon-ppc-automation.md`](amazon-ppc-automation.md)

---

## Related

- [`rule-engine.md`](rule-engine.md)
- [`amazon-ppc-automation.md`](amazon-ppc-automation.md)
