# Test count comparison — TMA 01 → TMA 02

This document compares the size and shape of the Vitest suite at the
TMA 01 submission cut-off against the suite at TMA 02 HEAD. It is
intended to be cited from Section "Project Work" (LO1, LO11) of the
TMA 02 report as evidence of test growth and TDD discipline.

## Headline numbers

| Snapshot | Date | Test files | Test cases | Source |
|----------|------|-----------:|-----------:|--------|
| TMA 01 submission | 2026-02-11 | ~5 | ~46 | `docs/audit/tma01-feedback-analysis.md` ("Vitest output showing 46 passing tests") |
| End of Era 4 (post-rebuild) | 2026-03-26 | 47 | 479 | git log + manual count |
| Era 4.5 (decking, uncommitted) | 2026-03-29 | +4 | +21 | file mtimes pre-integration |
| TMA 02 HEAD (post-decking integration) | 2026-05-08 | **52** | **515** | `npx vitest run` (this run) |

The HEAD figure includes 51 test files under `src/` plus
`scripts/lint-css-tokens.test.mjs` — the unit tests for the CI lint
guard introduced by `df1d1ac` on 2026-03-19.

## Growth factor

- Test files: ~5 → 52 — **roughly tenfold**.
- Test cases: ~46 → 515 — **roughly elevenfold**.
- 469 net new test cases added in 86 calendar days, concentrated in
  the 9-day Era 4 sprint and the 1-day Era 6 decking integration.

## Where the growth came from

Counting test cases per file at HEAD, by area:

| Area | Files | Notes |
|------|------:|-------|
| Tiling stack (tiles, adhesive, grout, spacers, primer, backer-board, tanking, slc, conversions) | 9 | Rebuilt under TDD on 2026-03-20 |
| Masonry stack (bricks, blocks, mortar, sand, cement, wall-ties, dpc, air-bricks, lintels, padstones, cavity-closers, cavity-trays, masonry-project, masonry, registry) | 15 | RED-then-GREEN single-day sprint on 2026-03-21 |
| Flooring stack (flooring, flooring-room, flooring-ancillary) | 3 | Added with the 2026-03-24 reorganisation (`76c61cb`) |
| Decking stack (decking, decking-fixings, decking-substructure, decking-project) | 4 | Authored 2026-03-29; integrated 2026-05-08 (`83d209d`) |
| Board coverage (legacy + `__tests__/`) | 2 | Era 2 origin, retained both locations |
| Layer 1 primitives (`primitives.ts`) | 1 | Shared rounding helpers |
| Layer 2 (`tiling-suggestions`) | 1 | Substrate / tile / context suggestion logic |
| Component / UI library (`FormField`, `NumberInput`, `MaterialsList`, `ResultCard`, `ProductSelector`, `WizardShell`, `CoverageCalculator`) | 7 | Added when shared `ui/` library was introduced (`4cf937e`) |
| Legacy components (`AdhesiveCalculator`, `ConversionsCalculator`, `FlooringProjectWizard`, `GroutCalculator`, `MasonryCalculator`, `MasonryProjectWizard`, `SpacersCalculator`, `TileCalculator`) | 8 | Kept while transitioning to wizard pattern |
| Smoke (`homepage-search`) | 1 | Era 1 |
| Scripts (`lint-css-tokens`) | 1 | CI guard tests |
| **Total** | **52** | |

## TDD discipline as evidence

Every Layer 1 calculator added in Eras 4 and 6 landed with a paired
`test(...): TC1–TCn (RED)` commit immediately followed by a
`feat(...): implement (TDD GREEN)` commit. The masonry rebuild on
2026-03-21 is the canonical example — thirteen RED→GREEN pairs in a
single day. This is visible in the git log filtered by the
`(RED)` / `(TDD GREEN)` markers.

```
$ git log --oneline --all | grep -E '\(RED\)|\(TDD GREEN\)' | wc -l
```

## Coverage

V8 coverage at HEAD over the same source set:

- **All files:** 68.74% statements, 59.4% branches, 56.09% functions, 70.3% lines.
- **`src/calculators/`:** > 95% statements on the live calculators (tiles, adhesive, grout, spacers, conversions, primer, backer-board, tanking, slc, flooring, masonry, masonry-project, decking, decking-project, all masonry sub-calculators).
- **`src/components/ui/`:** 100% statements (the shared primitives library).
- **`src/projects/`:** 100% statements.
- **`src/data/decking-products.ts`** and other product catalogues: 100%.
- **`src/components/calculators/CoverageCalculator.tsx`:** 72.7% — the
  one Layer 3 calculator not yet migrated to the wizard pattern.
- **Legacy `src/components/*Calculator.tsx`:** 24%–52%. These are
  retained for backward compatibility while the wizard migration
  completes; their underlying logic is fully covered at Layer 1.

Full coverage report (HTML, browseable) at
[`coverage-html/index.html`](coverage-html/index.html); raw text
summary at [`coverage-summary.txt`](coverage-summary.txt).

## Reproducing these numbers

From the repo root:

```sh
# Test count and pass/fail
npx vitest run --exclude '**/.worktrees/**'

# Coverage report (HTML in coverage/, summary on stdout)
npx vitest run --coverage --exclude '**/.worktrees/**'

# Verbose test names (one line per test)
npx vitest run --reporter=verbose --exclude '**/.worktrees/**'
```

The `--exclude '**/.worktrees/**'` flag scopes discovery to project
sources and prevents Vitest from picking up duplicate test copies
inside the local git worktrees under `.worktrees/`. This
scoping limitation is logged as gap §10.11 in `PROJECT_HISTORY.md`
and is a candidate for a `vitest.config.ts` fix in a future task.
