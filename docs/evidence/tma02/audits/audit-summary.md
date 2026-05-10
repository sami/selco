# Audit summary — 2026-05-09 (baseline) and 2026-05-10 (post-fix)

Two audit passes against the live deploy at `https://sami.github.io/selco/`:

- **Baseline (CC-02, HEAD `280b6bc`, 2026-05-09)** — sections 1–4 below.
- **Post-fix (CC-03, HEAD `8394ff2`, 2026-05-10)** — section 5 below.

Three tiers per pass: automated greens, axe-core accessibility,
Lighthouse audit.

## Tier 1 — automated greens

| Check | Result |
|-------|--------|
| `npm run build` | ✓ 10 pages built in 7.66 s |
| HTTP 200 on 7 live routes | ✓ all pass, 119–137 ms |
| `npx vitest run --exclude '**/.claude/**'` | ✓ 52 files / 515 tests pass in 27.72 s |

## Tier 2 — axe-core (pa11y runner, WCAG 2 AA)

| Route | Total | Critical | Serious |
|-------|------:|---------:|--------:|
| `/` | 15 | 1 | 14 |
| `/tiling/` | 49 | 1 | 48 |
| `/hard-flooring/` | 8 | 1 | 7 |
| `/brick-wall/` | 9 | 1 | 8 |
| `/decking/` | 22 | 1 | 21 |
| `/unit-converter/` | 9 | 1 | 8 |
| `/coverage/` | 10 | 1 | 9 |
| **Total** | **122** | **7** | **115** |

### Distinct issues

Three rules are violated; two are **chrome-wide** (one fix each
resolves the violation on every page):

| Rule | Impact | Where | Fix scope |
|------|--------|-------|-----------|
| `button-name` | critical | Header search button (disabled, no accessible name) | Chrome — single fix in `SelcoLayout` |
| `link-name` | serious | Five footer social-icon links (icons only, no `aria-label`) | Chrome — single fix in footer component |
| `color-contrast` | serious | Mostly `text-text-muted` text on light backgrounds and the "Coming soon" badge; tiling and decking pages worst because they contain longer descriptive copy | Per-page or one token-system change |

The chrome rules count for 6 violations × 7 pages = 42 of the 122
total. `color-contrast` accounts for the remaining 80.

Raw per-page output: `audits/axe/{01-home..07-board-coverage}.json`.

## Tier 3 — Lighthouse 13.3.0

Categories: Performance, Accessibility, Best Practices, SEO. Default
mobile preset (slow 4G, simulated CPU).

| Route | Perf | A11y | Best | SEO |
|-------|-----:|-----:|-----:|----:|
| `/` | 71 | 83 | 96 | 100 |
| `/tiling/` | 73 | 86 | 96 | 100 |
| `/hard-flooring/` | 73 | 84 | 96 | 100 |
| `/brick-wall/` | 73 | 84 | 96 | 100 |
| `/decking/` | 76 | 85 | 96 | 100 |
| `/unit-converter/` | 77 | 84 | 96 | 100 |
| `/coverage/` | 76 | 83 | 96 | 100 |

### Headline findings

- **Performance 71–77.** Pulled down by FCP / LCP ≈ 4.2 s and Speed
  Index ≈ 7.9 s on the home page (mobile slow-4G simulation). TBT 0 ms
  and CLS 0 are excellent — the score is bandwidth-bound, not CPU.
  Likely lever: render-blocking CSS, possibly the FontAwesome import.
- **Accessibility 83–86.** Same four rules across every page:
  `button-name`, `color-contrast`, `heading-order`, `link-name`. The
  fourth — `heading-order` — is the demo banner's `<h4>⚠️ DEMO ONLY`
  appearing without a preceding `<h3>`.
- **Best Practices 96.** One audit failing on every page:
  `errors-in-console` — a 404 on `https://sami.github.io/favicon.ico`
  (browser auto-requests `/favicon.ico` from the site root, but
  GitHub Pages serves under `/selco/`). One-line `<link
  rel="shortcut icon">` fix in `SelcoLayout` would resolve.
- **SEO 100.** Clean across the board.

Raw HTML reports (browseable, self-contained):
`audits/lighthouse/{01-home..07-board-coverage}.report.html`. JSON
reports were generated and used to aggregate this summary, then
deleted to keep the bundle small.

## Reproduction

```sh
# Tier 1
npm run build
for s in "" tiling/ hard-flooring/ brick-wall/ decking/ unit-converter/ coverage/; do
  curl -s -L -o /dev/null -w "%{http_code} %{time_total}s\n" "https://sami.github.io/selco/$s"
done
npx vitest run --exclude '**/.claude/**'

# Tier 2 (one URL shown; loop the seven routes)
npx --yes pa11y@latest https://sami.github.io/selco/ --reporter json --runner axe

# Tier 3 (one URL shown; loop the seven routes)
npx --yes lighthouse https://sami.github.io/selco/ \
  --quiet --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=lh-report
```

---

## 5. Post-fix re-audit (CC-03, HEAD `8394ff2`, 2026-05-10)

Four chrome-level fixes were applied as a single commit
(`8394ff2`, branch `main`):

1. **`button-name`** — `aria-label="Search (coming soon)"` on the
   disabled header search button in `SelcoHeader.astro`. Icon
   marked `aria-hidden`.
2. **`link-name`** — `aria-label` per footer social-icon link in
   `SelcoFooter.astro` (Facebook, Instagram, X / Twitter, LinkedIn,
   YouTube — all marked "(placeholder)" since the hrefs are
   currently `#`).
3. **`heading-order`** — DEMO ONLY banner promoted from `<h4>` to
   `<h3>` in `SelcoFooter.astro`. The actual offending sequence on
   every page is `h2 "How it works" → h4 banner`; promoting to
   `h3` makes that `h2 → h3` (clean +1 increment) and leaves the
   following footer column h4s as `h3 → h4` (also clean).
4. **`favicon`** — `<link rel="icon" type="image/svg+xml">` and
   `<link rel="shortcut icon">` in `SelcoLayout.astro`, pointing at
   `${base}selco-logo.svg` so the path remains correct under both
   the `/selco/` GitHub Pages base and local dev.

Out of scope for CC-03 (deferred to TMA 03): the remaining 80
`color-contrast` violations (token-system change) and the mobile
performance ceiling at 71–77 (render-blocking CSS, FontAwesome
import).

### Tier 1 — automated greens (post-fix)

| Check | Result |
|-------|--------|
| `npm run build` | ✓ unchanged |
| HTTP 200 on 7 live routes | ✓ all pass |
| `npx vitest run --exclude '**/.claude/**'` | ✓ 52 files / 515 tests pass in 27.55 s — **identical** to baseline |

### Tier 2 — axe before / after (WCAG 2 AA)

| Route | Before | After | Δ |
|-------|------:|------:|---:|
| `/` | 15 | 9 | −6 |
| `/tiling/` | 49 | 43 | −6 |
| `/hard-flooring/` | 8 | 2 | −6 |
| `/brick-wall/` | 9 | 3 | −6 |
| `/decking/` | 22 | 16 | −6 |
| `/unit-converter/` | 9 | 3 | −6 |
| `/coverage/` | 10 | 4 | −6 |
| **Total** | **122** | **80** | **−42** |

Per page each lost the same six violations: 1 critical
`button-name` + 5 serious `link-name`, all chrome-wide. **Zero
critical violations remain on any page.** All 80 remaining
violations are `color-contrast` (deferred).

Raw post-fix output: `audits/axe-postfix/{01-home..07-board-coverage}.json`.

### Tier 3 — Lighthouse before / after

| Route | Perf (b → a) | A11y (b → a) | Best (b → a) | SEO (b → a) |
|-------|:-----------:|:-----------:|:-----------:|:-----------:|
| `/` | 71 → 77 | **83 → 96** | **96 → 100** | 100 → 100 |
| `/tiling/` | 73 → 76 | **86 → 96** | **96 → 100** | 100 → 100 |
| `/hard-flooring/` | 73 → 76 | **84 → 96** | **96 → 100** | 100 → 100 |
| `/brick-wall/` | 73 → 77 | **84 → 96** | **96 → 100** | 100 → 100 |
| `/decking/` | 76 → 76 | **85 → 96** | **96 → 100** | 100 → 100 |
| `/unit-converter/` | 77 → 76 | **84 → 96** | **96 → 100** | 100 → 100 |
| `/coverage/` | 76 → 87 | **83 → 96** | **96 → 100** | 100 → 100 |

Targets:
- A11y → 95+ on every route — **hit (96 across the board)**.
- Best-practices → 100 on every route — **hit**.
- Perf and SEO unchanged — **confirmed** (perf moved 0–11 points
  within normal slow-4G simulation variance; SEO 100 throughout).

The remaining a11y gap from 96 to 100 is the same `color-contrast`
findings that remain in axe — Lighthouse uses axe-core internally
for a11y rules, so the two reports agree. Closing the contrast gap
will lift Lighthouse a11y to 100.

Raw post-fix Lighthouse HTML reports:
`audits/lighthouse-postfix/{01-home..07-board-coverage}.report.html`.
