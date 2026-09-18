# Break-Even ACoS Calculator

A free, self-contained break-even ACoS calculator for Amazon sellers. One HTML
file. Copy it, host it, change it, use it commercially.

**The one condition: keep the credit line and its link to https://rrw-ads.com
visible in the rendered page.** That is the whole licence. See [Licence](#licence).

Live version: https://rrw-ads.com/tools/break-even-acos-calculator

![The calculator on its break-even tab: unit-economics inputs in two columns, a
headline break-even ACoS of 40.8 percent, and the profit-per-sale and sale-price
figures it was derived from.](preview.png)

## What it works out

Three views over one set of inputs:

| View | Answers |
|---|---|
| **Break-even ACoS** | The ACoS at which an ad-driven sale makes exactly zero profit. A ceiling, not a target. |
| **Target ACoS** | Break-even minus the share of margin you want to keep. |
| **Max CPC bid** | The most you can pay per click and still hit that target, given the product's conversion rate. |

The third one is the point. An ACoS target is not something you can type into
Amazon; a maximum cost per click is.

## Use it

Copy `index.html` onto your site. That is the entire installation.

```
cp index.html /var/www/your-site/tools/break-even-acos.html
```

No build step, no package manager, no dependencies. To drop it inside an existing
page instead of serving it whole, take everything between `<body>` and `</body>`
along with the `<style>` block. Carry the credit across with it — the `<footer>`
is simply where we put it, and you are free to move, restyle or reword it, as
long as it stays visible on the page the calculator runs on.

To embed it as-is without touching your own templates:

```html
<iframe src="/tools/break-even-acos.html"
        style="width:100%;border:0;height:1100px"
        title="Break-Even ACoS Calculator"></iframe>
```

### Things you might want to change

- **Currency.** `money()` hardcodes `$`. Change that one function.
- **Default referral fee.** Set to 15%, which covers most categories. Electronics
  are nearer 8%, apparel nearer 17%.
- **Starting values.** The `value="..."` attributes on each input.
- **Colours.** Every colour is a CSS custom property in the `:root` block, with a
  dark-mode set below it. Nothing is hardcoded further down.

## The maths

```
referral fee   = price x referral %
returns cost   = return rate x (COGS + FBA fee + inbound shipping)
profit per sale before ads
               = price - COGS - FBA fee - referral fee - shipping - returns cost

break-even ACoS = profit before ads / price
target ACoS     = break-even ACoS x (1 - cushion)
max CPC         = ACoS x price x conversion rate
```

If profit before ads is zero or negative the calculator stops and says so, rather
than printing a negative ACoS. A product that loses money before advertising
cannot be fixed with a bid.

These are the same formulas the hosted version at rrw-ads.com uses — the same
expressions in the same order, including the guards: `price > 0` before dividing,
the cushion clamped to 0–100, and any blank or negative input read as zero.

### What it does not model

Six inputs cannot describe a whole P&L, and the ones left out are not trivial:

- **Amazon fees beyond FBA and referral.** Monthly storage and long-term storage
  surcharges, the inbound placement service fee, the low-inventory-level fee,
  removal and disposal fees, and the refund administration fee Amazon keeps when
  an order is refunded.
- **Account-level costs.** The Professional selling plan's monthly subscription,
  or the Individual plan's per-item fee. Neither is per-unit, so neither belongs
  in this arithmetic — but both come out of the same margin.
- **Price concessions.** Coupons, Subscribe & Save discounts, Vine, Lightning
  Deals, and promotional rebates.
- **Tax.** No sales tax, VAT or GST anywhere. The figures are pre-tax throughout,
  and the currency symbol is cosmetic — see "Things you might want to change".
- **Anything else that scales with volume.** Advertising is not the only one.

The return rate is a deliberate simplification, so it is worth stating plainly
what it does: it adds `return rate x (COGS + FBA fee + inbound shipping)` to the
cost of *every* sale. That treats a returned unit as a total loss of what it cost
you to land it. It does not model the referral fee Amazon refunds, the refund
administration fee it keeps, return shipping, or units that come back sellable
and are resold. Depending on the category that can read either high or low.

This is a per-unit contribution calculation, and it is only as good as the fees
you enter — FBA and referral fees are estimates unless you take the exact figures
from Seller Central, because Amazon sets them per ASIN and changes them.

## Privacy

There is no network code in the file. No analytics, no fonts, no CDN, no form
post, no cookie, no `localStorage`. Every number a visitor types stays in their
browser. That claim is checkable by reading the file, which is short on purpose.

It works offline. Open it with `file://` and it runs.

## Licence

Copyright (c) 2026 AS Milling & Woodworks LLC (RedHen Labs).

**This directory is not MIT.** The rest of this repository's code is; this one is
the exception, and the exception is deliberate.

Copy it, host it, modify it, translate it, use it commercially, put it behind your
own branding. Keep the credit line and its link to https://rrw-ads.com visible in
the rendered page and you are square with us. Move it, restyle it and reword it to
suit your site — it only has to be visible to the person using the calculator, on
the page where the calculator runs, as a real, followable link: not hidden with
CSS and not marked `rel="nofollow"`.

That link is the only thing we ask for, and it is the only thing we get. Removing
it is the one use that is not permitted.

Full terms: the "BREAK-EVEN ACoS CALCULATOR" section of [`LICENSE`](../../LICENSE)
in this repository. That file is the authoritative statement of this grant.

No warranty. The arithmetic is exact for the numbers entered; whether those numbers
describe your business is on you. Check figures against Seller Central before
making pricing or bidding decisions on them.

## Who made it

[RedHen Labs](https://rrw-ads.com) builds Amazon profit tracking and PPC automation.
This calculator does by hand, for one product, the thing the platform does
continuously for a whole catalogue: hold each product to a target derived from its
own real costs, using the fees Amazon actually billed rather than estimates.

Corrections to the maths are welcome — open an issue on
[the repository](https://github.com/elementenergy41-cell/RedHen-Labs).
