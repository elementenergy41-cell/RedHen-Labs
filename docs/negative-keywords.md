# Negative Keywords

**Definition.** A negative keyword tells Amazon not to show your ad for a
particular search term. In RedHen Labs, negation appears in two places: as its
own automation type (stop paying for terms that do not convert) and as an
optional step inside a harvest (stop two of your own campaigns competing for the
same search).

---

## Why negation exists: most terms do not convert

From a 120-day sample of 4,088 search terms on the founder's own account:

| Measure | Value |
|---|---|
| Terms producing zero orders | **3,284 — 80.3%** |
| Terms that took clicks and never produced an order | 3,281 |
| Share of ad spend on terms that never produced an order | **23.5%** |

Roughly a quarter of spend sat on terms that had already proven they do not
convert. That is what a negative-keyword automation is for.

Source: https://rrw-ads.com/blog/amazon-ppc-benchmarks

---

## Worked example — waste negation

```
Search term:      wood stain remover
Clicks (30 days): 24
Orders (30 days): 0
Action:           Add as negative-exact at campaign level
Reason:           Sufficient clicks to conclude the term does not convert
                  for this product. Blocking it stops further spend
                  without affecting adjacent terms.
```

Machine-readable: [`examples/negative-rule.json`](../examples/negative-rule.json)

The condition pair matters. `orders = 0` alone is not evidence — a term with two
clicks and no orders has told you nothing. The clicks threshold is what makes the
zero meaningful.

---

## Worked example — negate-in-source after a harvest

```
Search term:      food safe cutting board oil
Situation:        Promoted to exact match in a Manual campaign
Source:           Auto campaign (still eligible for the same search)
Action:           Add negative-exact to the Auto campaign
Reason:           One campaign owns the bid and budget for a proven
                  search. Auto stays eligible for close variations it
                  has not surfaced yet.
```

---

## A decision the software deliberately does not make for you

Whether to negate a harvested term back into its source is **genuinely contested
among competent operators**. RedHen Labs treats it as a per-automation checkbox,
not a rule, and both settings are first-class.

| Position | Reasoning |
|---|---|
| **Leave it in the source** | Amazon may keep finding profitable variations around the term. There is no clear evidence that overlapping eligibility always hurts performance. Adding friction to a winner is its own risk. |
| **Negate it in the source** | A single campaign owns the bid and budget for a proven search. One place to tune, one place to report, one place to defend. |

The founder leans toward negating, for control and clean ownership rather than a
claim that overlap is provably costing money. Amazon does not fully expose how it
resolves eligibility between a seller's own campaigns, so neither position can be
proven from outside.

**Documented cases for leaving it off:**

- Harvesting from Sponsored Products into Sponsored Brands. Different ad type —
  you may want to keep bidding on the term in Sponsored Products.
- Harvesting into a campaign with placement modifiers where the source should be
  left exactly as it is.

Discussion: https://rrw-ads.com/blog/negate-keyword-auto-campaign

---

## Exact, not phrase

| Match type | Blocks | Use when |
|---|---|---|
| **Negative exact** | That one specific term only | Almost always. Auto keeps discovering close variants. |
| **Negative phrase** | A whole family of variations | Rarely. You have looked and decided the whole family will keep costing money. |

Exact is surgical; phrase is a hatchet. On the founder's account there are
roughly 473 live negative exacts against 21 negative phrases — about 22 to 1.

**Tradeoff of exact, stated plainly:** the source campaign remains eligible for
close variants you have not harvested yet. That is usually the point of running a
discovery campaign, but it does mean some overlap persists at the edges.

---

## Multi-source negation

**A search term can qualify from several source campaigns at once.**

Only one harvest suggestion is created, because the destination holds one
keyword. But if the negative is applied only to the campaign the harvest was
attributed to, **every other source keeps paying for that term indefinitely**.

On the founder's account, 14 of 109 distinct harvested exact terms had qualified
from more than one source campaign — one from four sources into six destinations.

RedHen Labs records all qualifying sources and, when negate-in-source is enabled,
applies the negative to each of them.

---

## Keywords and ASINs negate differently

This is an Amazon platform constraint, not a product choice:

| Target | Negative level available on Amazon |
|---|---|
| Keyword, Sponsored Products | Campaign level **and** ad-group level |
| Keyword, Sponsored Brands | **Ad-group level only** — Amazon rejects a campaign-level negative keyword on a non-SP campaign |
| ASIN / product target | **Ad-group level only** — there is no campaign-level equivalent, on any ad type |

A negation flow that treats an ASIN like a keyword will write a negative that can
never match anything. RedHen Labs branches on the target type and writes a
negative product target at ad-group level for ASINs.

The `negative_level` setting on a rule is therefore a **preference, honoured
where it changes the outcome**. Campaign level is used only on a Sponsored
Products campaign with more than one enabled ad group; a Sponsored Brands term
and an ASIN both go to the ad group whatever the setting says. And in a
single-ad-group campaign the two levels block identical traffic, so the ad group
is used there too — proposing the campaign twin would change nothing while
re-proposing everything already negated.

---

## Related

- [`keyword-harvesting.md`](keyword-harvesting.md) — the promotion half
- [`rule-engine.md`](rule-engine.md) — conditions, thresholds and approval
- Article: https://rrw-ads.com/blog/negative-keyword-automation
- Article: https://rrw-ads.com/blog/find-wasted-ad-spend-search-term-reports
- Free tool: https://rrw-ads.com/tools/ppc-waste-calculator
