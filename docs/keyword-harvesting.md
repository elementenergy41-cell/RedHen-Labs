# Keyword Harvesting

**Definition.** Keyword harvesting is the practice of taking a search term that
has already produced sales in a discovery campaign and promoting it into its own
keyword in a manual campaign, where it can be bid on directly.

In RedHen Labs, harvesting is an automation type. It reads search-term
performance on a schedule, identifies terms meeting a threshold you define,
and proposes the promotion for your approval.

---

## The mechanical fact everything else follows from

In an Amazon auto campaign, Amazon matches your ad to **search terms**. You
cannot set a bid on an individual search term. You can move the whole campaign's
bid up or down, but you cannot say "bid $1.10 on *food safe cutting board oil*
specifically."

The only way to get that control is to make the term a **keyword** in a manual
campaign.

That is all harvesting is: taking a proven search term out of the discovery net
and turning it into a keyword you can bid on, budget for, and defend.

| Entity | Where it lives | Can you set a bid on it? |
|---|---|---|
| Search term | What the shopper typed | No |
| Keyword (auto campaign) | Amazon's automatic targeting | No — campaign-level only |
| Keyword (manual campaign) | Your keyword list | **Yes** |

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

Machine-readable: [`examples/harvesting-rule.json`](../examples/harvesting-rule.json)

---

## Why the threshold matters more than it looks

A harvest rule fires on a condition, typically `orders >= N` over a lookback
window. Choosing N is the whole decision.

From a 120-day sample of 4,088 search terms on the founder's own account:

| Terms producing | Count |
|---|---|
| Exactly 1 order | **609** |
| 3 or more orders | **132** |

Promoting on a single order means promoting roughly **609 coincidences for every
132 real signals**. One order is noise — it can be a fluke, a gift purchase, a
shopper who would have found you anyway.

**Default guidance:** two to three orders within a 30-day window. Scale the
threshold to your volume; a larger account can afford to be stricter. The
principle transfers even when the number does not.

Source: https://rrw-ads.com/blog/amazon-ppc-benchmarks

---

## Why harvesting is worth doing at all

The same sample shows why the short head matters:

| Measure | Value |
|---|---|
| Distinct search terms | 4,088 |
| Terms producing any order | 19.7% |
| Share of sales from the top 10 terms | 37.1% |
| Share of sales from the top 50 terms (1.2% of all terms) | **57.1%** |

An Amazon account is not a broad portfolio with a long profitable tail. It is a
very short head and a very long tail of noise. Harvesting is the mechanism for
finding the head and owning it deliberately.

---

## What the automation does

1. Reads qualifying search terms from Amazon's search-term report on your schedule
2. Applies your rule conditions (`orders`, `acos`, `clicks`, lookback window)
3. Proposes a keyword in the destination campaign at a bid you set
4. Optionally proposes a negative-exact back into the source campaign
5. Waits for approval — unless the automation is explicitly set to auto-apply

**Guard:** the automation will not negate a term into a campaign that is also a
harvest destination. Doing so would cancel the harvest it just performed.

**Multi-source:** a term can qualify from several source campaigns at once. All
qualifying sources are recorded, and if negate-in-source is enabled the negative
is applied to each of them — not only the first. See
[`negative-keywords.md`](negative-keywords.md).

---

## Harvest targets are not only keywords

The same mechanism applies to ASINs. A converting product target discovered by an
auto campaign can be promoted into a product-targeting campaign.

The negation half behaves differently and is covered in
[`negative-keywords.md`](negative-keywords.md): negative product targets exist
only at ad-group level on Amazon, while a negative keyword can be set at campaign
level on Sponsored Products — Sponsored Brands takes negative keywords at the ad
group only.

---

## Related

- [`negative-keywords.md`](negative-keywords.md) — the negation half of the flow
- [`rule-engine.md`](rule-engine.md) — how conditions and approval work
- Article: https://rrw-ads.com/blog/amazon-keyword-harvesting-auto-to-exact
- Article: https://rrw-ads.com/blog/negate-keyword-auto-campaign
- Article: https://rrw-ads.com/blog/keyword-research-myth
