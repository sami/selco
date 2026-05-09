# Audit summary — 2026-05-09

Audit run on the live deploy at `https://sami.github.io/selco/` (HEAD
`280b6bc`). Three tiers: automated greens, axe-core accessibility,
Lighthouse audit.

## Tier 1 — automated greens

| Check | Result |
|-------|--------|
| `npm run build` | ✓ 10 pages built in 7.66 s |
| HTTP 200 on 7 live routes | ✓ all pass, 119–137 ms |
| `npx vitest run --exclude '**/.worktrees/**'` | ✓ 52 files / 515 tests pass in 27.72 s |

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
npx vitest run --exclude '**/.worktrees/**'

# Tier 2 (one URL shown; loop the seven routes)
npx --yes pa11y@latest https://sami.github.io/selco/ --reporter json --runner axe

# Tier 3 (one URL shown; loop the seven routes)
npx --yes lighthouse https://sami.github.io/selco/ \
  --quiet --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=lh-report
```
