# Project History — Trade Materials Calculator

**Module:** TM470 Computing and IT Project (TM470-26B), The Open University
**Student:** Sami Bashraheel (Y4347284)
**Tutor:** Ms JA Tope (Ju)
**Repository:** github.com/sami/selco
**Deploy:** https://sami.github.io/selco/
**This document covers:** Initial commit (`3b384d9`, 2026-02-09) → HEAD on `main` (`f91ee5a`, 2026-05-08).

---

## 1. Reading this document

This is a factual history of the codebase built from the git log, the audit
documents in `docs/audit/`, and the design refresh report in `docs/`. Where a
claim is non-obvious, the originating commit is cited as `(<short-sha>)`.

A note on terminology before anything else: the brief that scoped this report
referred to `@calc/*` packages and a Vite-to-Astro migration. **Neither
exists in the repository.** The project has been an Astro 5 + React 19
single-package app since the second commit (`9109d11`, 2026-02-09), and
calculator logic lives in `src/calculators/*.ts`, not in workspace packages.
The three-layer architecture the brief describes does exist, but as folder
conventions inside `src/`, not as separate npm packages. Section 3 covers
this in detail.

---

## 2. Repo timeline

The 209 user commits on `main` (plus two stash entries on the active worktree
branch, `145e886` and `d8ab5a2`, which are noise and can be ignored) cluster
into six distinct eras. The repo has two idle periods — a 23-day post-TMA 01
gap and a 35-day post-rebuild gap — bracketing the heaviest sustained work.

| Era | Dates | Calendar days | Commits | Headline |
|-----|-------|---------------|---------|----------|
| 1 — TMA 01 prototype | 2026-02-09 → 2026-02-11 | 3 | ~40 | Astro scaffold to first submission |
| 2 — Post-submission build-out | 2026-02-12 → 2026-02-22 | 11 | ~65 | Masonry, mobile redesign, dashboard, board coverage |
| 3 — Idle gap | 2026-02-23 → 2026-03-17 | 23 | 0 | Ramadan; awaiting tutor feedback |
| 4 — TMA 02 audit and rebuild | 2026-03-18 → 2026-03-26 | 9 | ~99 | Audit, design tokens, TDD rebuild, Layer 2 wizards, shared UI |
| 4.5 — Uncommitted decking sprint | 2026-03-27 → 2026-03-29 | 3 | 0 (uncommitted) | Decking calculator built but not committed |
| 5 — Dormancy | 2026-03-30 → 2026-05-02 | 34 | 0 | No file activity — day-job commitments at SELCO and general life |
| 6 — TMA 02 recovery sprint | 2026-05-03 → ongoing | 6+ | 7+ | Project audit, decking integration, cleanup pass |

### Era 1 — TMA 01 prototype (2026-02-09 → 2026-02-11)

Three days of work that took the project from an empty folder to a deployed
TMA 01 submission.

The very first user commit (`3b384d9`) was an empty initial; the second
(`9109d11`) scaffolded the Astro app with React, Tailwind, the SELCO
layout, and skeleton pages — establishing the framework choice that has held
for the rest of the project. Day one (Feb 9) closed with the homepage, hero,
how-it-works, and JSON-LD structured data wired up (`800f89a`,
`365e0ba`) and the gh-pages deploy unblocked (`b6d0cff` fixed the workflow
yaml; `818dc7a` set the Astro `site` and `base` for the `/selco` subpath).

Day two (Feb 10) was a UI-and-logic push: the calculators index, projects
page, and reusable calculator template (`636c3ce`, `f832c1b`, `e5aa2f2`),
followed by the first calculator logic modules — adhesive (`8d1c934`)
and then grout, spacers, and conversions in a single commit
(`83a07de`) that also fixed a floating-point issue. The TDD red phase
landed alongside (`87c33ac`).

Day three (Feb 11) rebuilt the four standalone tiling calculators with
SEO content and pack-size support (`b3796c6`, `b284bb9`, `9255703`,
`5898b69`); shipped the `TilingWizard` multi-step component
(`1a00636`, `6c1fe31`); rebranded the product from "Selco Calculator" to
"Trade Materials Calculator" (`53a5da7`); and finished with
`4b06513` "chore: final verification and submission readiness" — the
TMA 01 cut-off.

**Live calculators at TMA 01:** Tiles, Adhesive, Grout, Spacers, Conversions,
and the Tiling project wizard. (Coverage and Masonry came later.)

### Era 2 — Post-submission build-out (2026-02-12 → 2026-02-22)

The TMA submission did not stop development. The next 11 days delivered three
separate strands:

1. **First-pass masonry calculator (Feb 12–13).** Types, page, component, and
   12 logic commits (`b676d8d` through `c0238a5`) implementing
   `calculateBricks`, `calculateBlocks`, `calculateMortar`, `calculateWallTies`,
   `calculateLintels`, `calculateDPC`, plus `calculateWallArea` and the
   `calculateMasonry` orchestrator. `46d96cc` then split the monolithic
   calculator into Bricks/Blocks/Mortar tools and renamed "Tools" to
   "Calculators" site-wide. Three days later (`3c2049f`, Feb 16) the
   Masonry and Concrete homepage links were disabled — masonry was built but
   not considered ready to ship.

2. **Sidebar / Project Lists redesign (Feb 13).** `f2237d7`, `11abecd`,
   and `35efe23` migrated the app from a tabbed top-nav to a sidebar
   layout, with mobile adapted and copy reworked. Save-to-project language
   was deliberately removed (`97329c7`, `c6f49f1`) to align with the
   stateless calculator model.

3. **Lean dashboard and Coverage Calculator (Feb 22).** `7b17d80`
   converted inline styles to Tailwind; `7dc4ff2` introduced the lean
   dashboard and the universal calculators concept; `c4f3723` added a
   coming-soon visual state; `c61e48f` added multi-unit support to the
   Coverage Calculator; `3b12e76` refactored the generic coverage tool
   into a dedicated Board Coverage tool; `1bbc25a` added the 2400×600
   flooring board preset.

Era 2 ended with the codebase in a workable but inconsistent state: three
competing token systems, twelve undefined CSS custom properties, and masonry
hidden behind a coming-soon flag. These problems are documented in
`docs/audit/audit-report.html`.

### Era 3 — Idle gap (2026-02-23 → 2026-03-17)

23 calendar days with zero commits. The TMA 01 feedback analysis
(`docs/audit/tma01-feedback-analysis.md`) records Ramadan and tutor-feedback
turnaround as the cause. Ju's feedback returned on 17 March — TMA 01 scored
57/100, with the largest mark losses on LO1 and LO11 (8 marks each, 16
combined) for "superficial" treatment of the project work itself.

### Era 4 — TMA 02 audit and rebuild (2026-03-18 → 2026-03-26)

Nine days, ~99 commits, four sub-phases:

**4a. Audit and wireframes (Mar 18–19).** `5b0fcf6` and `9312287`
imported the prototype audit and UX evaluation reports; `db635ef` and
`fce4464` added the TMA 02 wireframes, SVG hero images, and the design
refresh report.

**4b. Design tokens and CI guard (Mar 19).** `a938c5d` introduced the
canonical `@theme` palette and fixed eleven phantom CSS tokens; `4eae20e`
aliased `SelcoLayout :root` to the canonical tokens; `2aabb61` removed
the old prototype hex values. `d6bfa0d` defined the three canonical button
variants from the redesign decisions (V-2, V-4, V-5). `db19a73` completed
the type scale and card/panel/input classes. `df1d1ac` then added a CSS
token lint guard as a CI step so undefined custom-property references
cannot regress.

**4c. TDD rebuild of tiling and ancillaries (Mar 20).** A coordinated
rebuild that replaced ad-hoc inputs with product-ID lookups across the
tiling stack: tiles and adhesive (`589ba25`), grout (`84deef9`),
spacers (`b288046`), backer board (`eadd5f8`), conversions
(`aba713d`). New product types and catalogue data for primer, tanking,
SLC, and grout/spacer products were added (`6087ef9`, `354da37`).
Wizards gained a primer step descriptor (`bf19f74`), grout and SLC
product selectors (`97b809b`, `54ed36a`), and walls-only product
hiding on floor contexts.

**4d. Masonry rebuild (Mar 21).** A single-day TDD push that re-implemented
the masonry stack module-by-module with a strict RED → GREEN cadence
visible in the commit log: bricks, blocks, mortar, sand, cement, wall-ties,
DPC, air-bricks, lintels, padstones, cavity-closers, cavity-trays, plus the
`calculateMasonryProject` cross-reference orchestrator. 38 masonry products
across 11 types were catalogued (`9226ddd`). `985ee46` removed the
coming-soon flag from the brick-wall card — masonry shipped for the first
time, more than a month after it was first built.

**4e. Flooring and Layer 2 wizards (Mar 24–26).** `76c61cb` introduced
flooring, tanking, SLC, and board-presets calculators and reorganised tests
into a dedicated `__tests__/` directory. `4cf937e` (Mar 25) introduced
the shared component library — `FormField`, `NumberInput`, `MaterialsList`,
`ResultCard`, `ProductSelector`, `WizardShell`. The tiling, masonry, and
flooring wizards were then refactored to use it (`b19d369`, `3fc1911`,
`f8bfd8a`), and `922281d` and `8b87316` added the Layer 2
orchestration configs (`src/projects/masonry.ts`, `flooring.ts`) that
let `WizardShell` derive its steps declaratively. `9813a36` and
`8f0e8b5` wired the new wizards into routes; `f351866` flipped the
hard-flooring homepage card to live. `831f6d2` is the merge that brought
the design-system phases (1–5) onto `main`.

### Era 4.5 — Uncommitted decking sprint (2026-03-27 → 2026-03-29)

Three days of work that never reached a commit. File mtimes on the parent
worktree show a complete decking calculator stack added on 2026-03-29
(10:09–12:57): the engine extension, the `calculateDeckingFixings` and
`calculateDeckingSubstructure` sub-engines, the `calculateDeckingProject`
cross-reference orchestrator, four test suites mirroring the masonry
RED-then-GREEN convention, the `DeckingProjectWizard` built on
`WizardShell`, the Layer 2 step descriptor in `src/projects/decking.ts`,
the public `/decking/` route, and the `decking-products` catalogue. Roughly
1,478 LOC of new code plus a 121-line modification to `decking.ts`.

None of it was staged at the time. The work sat in the parent repo's
working tree as untracked files and a modified `decking.ts` until Era 6.
The six plan documents in `docs/plans/2026-03-25-*` are dated four days
earlier and describe the same sequence of work.

### Era 5 — Dormancy (2026-03-30 → 2026-05-02)

34 calendar days with no file activity in the working tree. No commits, no
mtimes after 2026-03-29 12:57. The honest cause is a combination of
day-job commitments at SELCO Builders Warehouse — where shifts ramped up
into May — and general life pulling away from the project after the
intensive nine-day rebuild and the three further days of decking work
that closed Era 4.5.

The consequences are real and worth naming: three days of finished
decking work sat uncommitted, no fortnightly tutor update went out
during the gap, and the TMA 02 write-up window was compressed from a
projected six weeks down to roughly one. The recovery measures live in
Era 6 and in the gaps list at §10 below — the cherry-pick of the
dormant decking work was the single highest-leverage item, lifting the
shipped calculator count from five to six and turning unshipped effort
into marker-visible evidence.

### Era 6 — TMA 02 recovery sprint (2026-05-03 → ongoing)

A multi-phase audit and integration push. So far:

- **2026-05-03 → -07:** project-side audit work (Notion, plan pages, task
  tracker corrections — out of scope for this codebase document).
- **2026-05-08 (today):** repository archaeology resulting in this
  document, then Phase 0.5 — rescue of the uncommitted decking work.
  Seven commits on a `feat/decking-integration` branch (chunks: product
  catalogue + sub-engines `77c5f62`; engine + orchestrator
  `f38bcbd`; TDD test suite `83d209d`; wizard + route + Layer 2
  + registry description `4c02171`; plan documents `c742bc9`;
  evidence + TDS PDFs `af7d590`; mark live `37b2351`). Full Vitest
  suite scoped to `src/` runs green at 51 files / 500 cases.
  Merged into `main` via `--no-ff` as `f91ee5a`.
- **Ahead:** Phase 1 cleanup (delete `GEMINI.md`, gitignore tightening,
  duplicate-route removal, package rename), Phase 2 coverage capture, and
  Phase 3 deploy.

---

## 3. Architectural evolution

The architecture has been **constant in framework and progressive in
discipline**. Astro 5 + React 19 + Tailwind CSS 4 was set in commit two
(`9109d11`) and has not changed; what has changed is the rigour with
which the layers are separated.

### 3.1 The three layers (as they exist today at HEAD)

Both the original layout and the README describe a "three-layer separation
of concerns". Inspecting the source confirms the convention:

- **Layer 1 — Pure logic** (`src/calculators/*.ts`). No React imports.
  One module per material or quantity (e.g. `tiles.ts`, `mortar.ts`,
  `wall-ties.ts`). Each module exports a `calculate*` function and the
  input/output type definitions; tests live in `src/calculators/__tests__/`.
- **Layer 2 — Project orchestration** (`src/projects/*.ts` and
  `src/projects/*.json`). Declarative step descriptors that sequence Layer 1
  calculators into multi-step project flows. `tiling.json`, `masonry.ts`,
  and `flooring.ts` each describe step ordering, optional-step rules,
  and which inputs are shared between steps. Layer 2 contains no
  arithmetic.
- **Layer 3 — Presentation** (`src/components/`, `src/pages/`,
  `src/layouts/`). Astro pages and layouts handle routing and static
  shells; React components hydrate as islands. Within Layer 3, a shared
  primitives library lives in `src/components/ui/` and project-specific
  wizards in `src/components/calculators/` and the per-page wizard files.

The strong form of this separation only crystallised in Era 4. Era 1
already kept calculator logic in `src/calculators/`, but step ordering
lived inside the `TilingWizard` React component (`1a00636`). The
explicit Layer 2 emerged on 2026-03-25 with the masonry and flooring
orchestration configs (`922281d`, `8b87316`) and the WizardShell
extension that derives steps from those configs (`d3f18ee`,
`e7c8400`).

### 3.2 What stayed across the four eras

- Astro 5 + React 19 islands.
- Tailwind CSS for styling (Tailwind v3 in Era 1, migrated to Tailwind v4
  with `@theme` tokens in Era 4).
- Vitest for tests, with React Testing Library for component tests.
- GitHub Pages deploy on a `/selco` base path.
- The folder convention `src/calculators/` for pure logic.

### 3.3 What was scrapped

- **First-pass masonry calculator UI** (`a5b6e3a`, Feb 13). Replaced by
  `MasonryProjectWizard` (`3fc1911`, Mar 25) on the `brick-wall` page
  (`9813a36`).
- **Bespoke wizard navigation** in the original `TilingWizard`. Replaced
  by `WizardShell` (`c5272eb`).
- **Bespoke `FormInput` / `FormSelect` / `ResultsPanel`** in
  `CalculatorLayout`. Removed in `6eb82ff`; their callers migrated to the
  `ui/` library in `b19d369`, `4fa9e4b`, `a4bbec4`, `a5c5483`,
  `3b05f99`, `0f43173`.
- **Three competing token systems** (root vars, prototype hex values,
  inline styles). Consolidated to `global.css @theme` as the single source
  of truth in `a938c5d` and `2aabb61`.
- **Per-calculator `index.astro` routes** under `src/pages/calculators/*`.
  Replaced by the project-route layout (`/tiling`, `/brick-wall`,
  `/hard-flooring`, `/coverage`, `/unit-converter`) that hosts wizards
  rather than single-input forms.
- **Tracked `dist/` directory** (`62d1d6e`) and **tracked
  `tailwind.config.mjs`** (removed when Tailwind v4 made it redundant).
- **`major-mercury/` scaffold leftover** — the default Astro project name
  was removed in commit two (`38aa768`); the package is still called
  `major-mercury` in `package.json`, which is a known cosmetic gap.

---

## 4. Module inventory

### 4.1 Layer 1 — pure calculator modules (HEAD)

The table below lists every `src/calculators/*.ts` module, when it was
introduced, when it was last meaningfully touched, and whether it has tests.
LOC counts are wholesale for the file.

| Module | Introduced | Last touched | LOC | Tests |
|--------|------------|--------------|----:|:-----:|
| `tiles.ts` | 2026-02-10 (`83a07de`) | 2026-03-20 (`589ba25`) | — | yes |
| `adhesive.ts` | 2026-02-10 (`8d1c934`) | 2026-03-20 (`589ba25`) | — | yes |
| `grout.ts` | 2026-02-10 (`83a07de`) | 2026-03-20 (`84deef9`) | — | yes |
| `spacers.ts` | 2026-02-10 (`83a07de`) | 2026-03-20 (`b288046`) | — | yes |
| `conversions.ts` | 2026-02-10 (`83a07de`) | 2026-03-20 (`aba713d`) | — | yes |
| `primer.ts` | 2026-03-20 (`354da37`) | 2026-03-20 | — | yes |
| `backer-board.ts` | 2026-03-20 (`354da37`) | 2026-03-20 (`eadd5f8`) | — | yes |
| `tanking.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `slc.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `bricks.ts` | 2026-02-13 → 2026-03-21 (`fe8fe9c`, then TDD-rebuilt `615785c`) | 2026-03-21 | — | yes |
| `blocks.ts` | 2026-02-13 → 2026-03-21 (TDD-rebuilt `0dd6e71`) | 2026-03-21 | — | yes |
| `mortar.ts` | 2026-02-13 → 2026-03-21 (TDD-rebuilt `1aa63a9`) | 2026-03-21 | — | yes |
| `sand.ts` | 2026-03-21 (`56e46d7`) | 2026-03-21 | — | yes |
| `cement.ts` | 2026-03-21 (`30499b8`) | 2026-03-21 | — | yes |
| `wall-ties.ts` | 2026-02-13 → 2026-03-21 (TDD-rebuilt `135cc76`) | 2026-03-21 | — | yes |
| `dpc.ts` | 2026-02-13 → 2026-03-21 (TDD-rebuilt `93ebb14`) | 2026-03-21 | — | yes |
| `air-bricks.ts` | 2026-03-21 (`20d7d42`) | 2026-03-21 | — | yes |
| `lintels.ts` | 2026-02-13 → 2026-03-21 (TDD-rebuilt `7617892`) | 2026-03-21 | — | yes |
| `padstones.ts` | 2026-03-21 (`9285553`) | 2026-03-21 | — | yes |
| `cavity-closers.ts` | 2026-03-21 (`c54ac33`) | 2026-03-21 | — | yes |
| `cavity-trays.ts` | 2026-03-21 (`1e43dc9`) | 2026-03-21 | — | yes |
| `masonry.ts` | 2026-02-13 (`c0238a5`) | 2026-03-21 (`a3988ce`) | — | yes (`masonry.test.ts`) |
| `masonry-project.ts` | 2026-03-21 (`baa312b`) | 2026-03-21 | — | yes |
| `flooring.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `flooring-room.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `flooring-ancillary.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `flooring-config.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | no (config) |
| `flooring-constants.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | no (constants) |
| `board-coverage.ts` | 2026-02-22 (`3b12e76`) | 2026-02-22 | 56 | yes (two test files: legacy `board-coverage.test.ts` next to source, plus `__tests__/board-coverage.test.ts`) |
| `board-presets.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | 65 | no |
| `board-cutting.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | 110 | **no — stub** |
| `decking.ts` | 2026-03-24 (`76c61cb`) | 2026-05-08 (`f38bcbd`, Era 6 integration of Era 4.5 work) | 187 | yes (`__tests__/decking.test.ts`) |
| `decking-fixings.ts` | 2026-05-08 (`77c5f62`, integrated from Era 4.5) | 2026-05-08 | 112 | yes |
| `decking-substructure.ts` | 2026-05-08 (`77c5f62`, integrated from Era 4.5) | 2026-05-08 | 124 | yes |
| `decking-project.ts` | 2026-05-08 (`f38bcbd`, integrated from Era 4.5) | 2026-05-08 | 147 | yes |
| `cladding.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | 69 | **no — stub** |
| `primitives.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | yes |
| `registry.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | 26 | yes |
| `constants.ts` | 2026-03-24 (`76c61cb`) | 2026-03-24 | — | n/a (data) |
| `types.ts` | 2026-02-12 (`85e1981`) | 2026-03-21 (`28aa276`, `99d123c`, `de5b99b`) | — | n/a |
| `index.ts` | 2026-02-10 | 2026-03-21 (`8d35f72`) | — | n/a (barrel) |

`registry.ts` is a re-export shim that points at `src/projects/registry.ts`,
which is the actual single source of truth for the calculator catalogue.

### 4.2 Layer 2 — project orchestration (HEAD)

| File | Introduced | Purpose |
|------|------------|---------|
| `src/projects/registry.ts` | 2026-03-25 (predecessor: `src/data/projects.ts` from Era 1) | Canonical calculator catalogue (8 entries; **6 live, 2 coming-soon** at HEAD) |
| `src/projects/tiling.json` | 2026-02-11 (`ea75678` was the suggestions data; current schema established Era 4) | Tiling wizard step descriptor |
| `src/projects/masonry.ts` | 2026-03-25 (`922281d`) | Masonry wizard step descriptor and wall-type rules |
| `src/projects/flooring.ts` | 2026-03-25 (`8b87316`) | Flooring wizard step descriptor |
| `src/projects/decking.ts` | 2026-05-08 (`4c02171`, integrated from Era 4.5) | Decking wizard step descriptor and substrate / fixing rules |
| `src/projects/conversions.json` | Era 1 | Unit converter category data |
| `src/projects/tiling-suggestions.ts` (+ test) | 2026-02-11 (`ea75678`) | Substrate / tile / context suggestion logic |

### 4.3 Layer 3 — UI components

| File | Introduced | Notes |
|------|------------|-------|
| `src/components/ui/FormField.tsx` | 2026-03-25 (`4cf937e`) | Label + input wrapper with error state |
| `src/components/ui/NumberInput.tsx` | 2026-03-25 (`4cf937e`) | Aligned to `(value: string)` convention in `2f3417c` |
| `src/components/ui/ProductSelector.tsx` | 2026-03-25 (`4cf937e`) | Grouped radio cards with brand traceability |
| `src/components/ui/MaterialsList.tsx` | 2026-03-25 (`4cf937e`) | Bill-of-materials renderer |
| `src/components/ui/ResultCard.tsx` | 2026-03-25 (`4cf937e`) | Structured result panel with `MaterialQuantity[]` slot |
| `src/components/ui/WizardShell.tsx` | 2026-03-25 (`4cf937e`, extended `d3f18ee`) | Generic wizard chrome with progress bar, optional steps, skip, start-over |
| `src/components/calculators/CoverageCalculator.tsx` | 2026-02-22 (`7dc4ff2`) | The only React calculator that has not yet migrated to a wizard pattern |
| `src/components/DeckingProjectWizard.tsx` | 2026-05-08 (`4c02171`, integrated from Era 4.5) | Decking wizard built on `WizardShell`; consumes `src/projects/decking.ts` step config |

The merge in `831f6d2` brought "Design system React components (Phases 1–5)"
onto `main` — that label refers to this `ui/` library and the
WizardShell-driven refactors of the three project wizards.

---

## 5. Calculator-by-calculator narrative

### 5.1 Tiling (live since TMA 01)

The flagship project. First-pass implementations of tiles, adhesive, grout,
and spacers landed on Feb 10–11 (`83a07de`, `8d1c934`, `b284bb9`,
`9255703`, `5898b69`). The `TilingWizard` React component
(`1a00636`) wired them into a multi-step flow with substrate suggestions
(`ea75678`).

In Era 4 the four core modules were rebuilt under TDD with product-ID
lookups against catalogue data: tiles and adhesive (`589ba25`), grout
(`84deef9`), and spacers (`b288046`). New ancillary modules — primer
(`354da37`), backer board (`eadd5f8`), tanking, and self-levelling
compound (`76c61cb`) — extended the wizard to a 10-step project flow.
Finally, the wizard chrome was replaced by `WizardShell` (`c5272eb`)
and step ordering moved to `tiling.json` (`bf19f74`, `e7c8400`).

The grout module (`grout.ts`) is the most-tested individual module after
conversions, with the BS 5385 formula and warning rules covered explicitly
(`84deef9`). Source citations to BS 5385 and manufacturer TDS are present
in `docs/audit/audit-report.html`.

### 5.2 Unit conversions (live since TMA 01)

`conversions.ts` was added on Feb 10 (`83a07de`) covering length, area,
volume, weight, and temperature. `0826eb1` (Feb 15) added a material
densities section with BS-aligned constants. `42998aa` extended the
public surface with a `UNITS` export and differentiated sand/gravel
densities.

The Era 4 rebuild (`aba713d`, Mar 20) gave it a unified `convert()` API
and exposed factor tables publicly. Identity tests for same-unit
conversion were added in `6477286` and a TypeScript-unreachable default
branch was annotated rather than tested. With 52 cases, this is the
densest test file in the repo.

### 5.3 Flooring (live since 2026-03-25)

The newest live calculator. Introduced wholesale in `76c61cb` as a set
of four cooperating modules: `flooring.ts` (per-room board calculation),
`flooring-room.ts` (room-shape primitive), `flooring-ancillary.ts`
(underlay, threshold strips, beading), `flooring-config.ts` and
`flooring-constants.ts`. The `FlooringProjectWizard` was built on
`WizardShell` directly (`f8bfd8a`); the Layer 2 step descriptor in
`src/projects/flooring.ts` (`8b87316`) drives step ordering;
`8f0e8b5` created the `/hard-flooring` route and marked the calculator
live; `f351866` flipped the homepage card.

### 5.4 Masonry (built Era 2, hidden, rebuilt Era 4, live since 2026-03-21)

Has the most interesting trajectory in the codebase. First implemented
across Feb 12–13 in eleven commits (`b676d8d` → `c0238a5`) and split
into per-material tools by `46d96cc`. The Masonry homepage link was then
deliberately disabled three days later (`3c2049f`, Feb 16) — the maths
worked but was not considered shippable.

The Era 4 rebuild on 2026-03-21 was a single-day TDD push: thirteen
RED → GREEN pairs covering bricks, blocks, mortar, sand, cement, wall ties,
DPC, air bricks, lintels, padstones, cavity closers, cavity trays, and the
`calculateMasonryProject` cross-reference orchestrator (`baa312b`). 38
masonry products in 11 types were added (`9226ddd`). The legacy
`MasonryCalculator` UI was replaced by `MasonryProjectWizard`
(`3fc1911`, `9813a36`); the Layer 2 step descriptor in
`src/projects/masonry.ts` (`922281d`) drives step ordering; the wall
starters and cavity insulation result rows came in `ddbb51f`. The
homepage flag was flipped to live in `985ee46` (Mar 21).

### 5.5 Board coverage (live since 2026-02-22)

Born in Era 2 as a generic Coverage Calculator (`7dc4ff2`) and refactored
into a dedicated board coverage tool the same day (`3b12e76`). The
`CoverageCalculator.tsx` React component (the only Layer 3 calculator
that has not migrated to a wizard pattern) sits alongside it. It received
the new `NumberInput` and `ResultCard` ui/ components in `11e387f`.

### 5.6 Decking (live since 2026-05-08)

The most recent live calculator. The board-level engine (`decking.ts`)
was introduced as a 66-line stub on 2026-03-24 (`76c61cb`) but the real
work happened over three uncommitted days during Era 4.5 (Mar 27–29):
the engine was extended from 66 to 187 LOC, two sub-engines
(`decking-fixings.ts` for screws-or-hidden-clips counting,
`decking-substructure.ts` for joists and concrete deck blocks) and a
cross-reference orchestrator (`decking-project.ts`) were added, four
test suites were written, the `DeckingProjectWizard` was built on
`WizardShell`, and the Layer 2 step descriptor in
`src/projects/decking.ts` was authored alongside the catalogue at
`src/data/decking-products.ts`. None of it was committed at the time;
the work then sat dormant for 34 days through Era 5.

Era 6 integrated all of it across seven commits on
`feat/decking-integration` (`77c5f62`, `f38bcbd`, `83d209d`,
`4c02171`, `c742bc9`, `af7d590`, `37b2351`), merged into `main`
as `f91ee5a` once the full Vitest suite ran green at 51 files / 500
cases. The homepage card was flipped live in `37b2351`, mirroring the
hard-flooring enable in `f351866`.

### 5.7 Cladding and board-cutting (coming-soon at HEAD)

Two modules introduced in `76c61cb` on 2026-03-24 with logic in place
but no test files. `cladding.ts` (69 LOC) and `board-cutting.ts`
(110 LOC) remain registered as `coming-soon`. They are the remaining
known gap; Phase 1 will decide whether to flesh them out with tests or
remove the placeholders.

---

## 6. Test growth

The test suite has grown roughly elevenfold from TMA 01 to HEAD.

| Snapshot | Date | Test files (`src/`) | Test cases (`src/`) |
|----------|------|--------------------:|--------------------:|
| TMA 01 submission | 2026-02-11 | ~5 | ~46 (per `tma01-feedback-analysis.md`, "Vitest output showing 46 passing tests") |
| End of Era 2 | 2026-02-22 | ~7 | ~80 (estimate; masonry plus board coverage tests) |
| End of Era 4 | 2026-03-26 | 47 | 479 |
| HEAD (post-decking integration) | 2026-05-08 | 51 | 500 |

A discrepancy worth noting: running `npx vitest run` from the repo root
currently reports **187 test files / 2,003 cases** because vitest's
default discovery picks up the test files inside the local git worktrees
under `.claude/worktrees/{kind-driscoll, pedantic-hypatia,
crazy-rubin-d08be7}`. The src/-only run (`npx vitest run --root src`)
reports the accurate 51 / 500. Phase 1 will scope discovery via
`vitest.config.ts` so the unscoped run also reports honest numbers.

The Era 4 explosion came from two practices: (a) every new calculator was
introduced via a RED → GREEN commit pair, visible in the log as paired
`test(...): TC1–TCn (RED)` and `feat(...): implement (TDD GREEN)` entries;
(b) the test reorganisation in `76c61cb` consolidated tests under
`src/calculators/__tests__/` while preserving the original locations as
working test files (the legacy `masonry.test.ts`, `board-coverage.test.ts`,
and `registry.test.ts` are still in `src/calculators/` — a known minor
inconsistency).

Coverage history is not recoverable from git alone because no coverage
report has been committed; it can be generated from HEAD with
`npx vitest run --coverage` (Phase 2).

---

## 7. Decisions log

The most consequential decisions, mined from commit messages, the audit
documents, and the design refresh report.

1. **Astro + React islands over SPA, day one** (`9109d11`, 2026-02-09).
   Established the framework and has held throughout. No runtime React on
   pages that don't need it; static-first deploy to GitHub Pages.

2. **Pure-logic calculators in `src/calculators/`** (`8d1c934`,
   2026-02-10). Set the Layer 1 convention; tests can target plain
   functions without DOM setup.

3. **Stateless calculators — no save/revisit** (`97329c7`, `c6f49f1`,
   2026-02-13). Removed save-to-project language to align with a stateless
   model. Reduces UX scope but keeps the deploy simple.

4. **Sidebar-led "Project Lists" navigation** (`f2237d7`, 2026-02-13).
   Changed the entire IA from tabbed top-nav to a two-group sidebar.

5. **Disable masonry rather than ship it half-done** (`3c2049f`,
   2026-02-16). Recognised that v1 masonry was incomplete; held it back
   until the Era 4 TDD rebuild let it ship cleanly five weeks later.

6. **TDD as the default after TMA 01** (visible across Era 4). Every new
   masonry, flooring, and ancillary calculator landed RED-then-GREEN; this
   is also encoded as a project rule in `GEMINI.md` ("TDD mandatory").

7. **Single canonical token system via `global.css @theme`**
   (`a938c5d`, `2aabb61`, 2026-03-19). Replaced three competing token
   systems and fixed eleven phantom CSS custom properties. Enforced by
   CI lint guard (`df1d1ac`).

8. **Three canonical button variants only** (`d6bfa0d`, 2026-03-19).
   Resolved seven inconsistent button patterns into Decision V-2/V-4/V-5
   from the redesign decisions document.

9. **Product-ID lookups instead of free-form inputs** (`589ba25`,
   `84deef9`, `b288046`, etc., 2026-03-20). All calculators now resolve
   to specific catalogue items with brand traceability — the foundation
   for SEO content claiming "estimates from real SELCO products".

10. **Two-category taxonomy: Project vs Handy calculators** (Era 4
    registry shape; `src/projects/registry.ts`). Project calculators are
    multi-step wizards; Handy calculators are single-input tools. The
    homepage grid, sidebar, and breadcrumbs all derive from this.

11. **Layer 2 declarative step descriptors** (`922281d`, `8b87316`,
    `e7c8400`, `3d49dc8`, `70aa8fe`, 2026-03-25). Wizard step
    ordering moved out of React components into JSON / TS configs. New
    project calculators no longer require new wizard components.

12. **Shared `ui/` primitive library** (`4cf937e`, 2026-03-25). Six
    primitives — `FormField`, `NumberInput`, `MaterialsList`, `ResultCard`,
    `ProductSelector`, `WizardShell` — replaced ad-hoc per-calculator
    components and removed the deprecated `FormInput`/`FormSelect`/
    `ResultsPanel` (`6eb82ff`).

13. **Cherry-pick the dormant decking work rather than defer it**
    (Era 6, 2026-05-08, merge `f91ee5a`). 1,478 LOC of finished work had
    been sitting uncommitted for 40 days. Integrating it as seven logical
    chunks on `feat/decking-integration`, validating against the full
    Vitest suite, and only flipping the live flag once tests passed —
    rather than re-doing the work or shipping coming-soon — preserved
    three days of effort and lifted the live calculator count from five
    to six.

---

## 8. Files removed or renamed of significance

- `tailwind.config.mjs` — removed when migrating to Tailwind v4 `@theme`
  tokens (Era 4).
- `dist/` — old tracked build artefacts removed (`62d1d6e`, 2026-02-10);
  added to `.gitignore` in the same commit. `.worktrees/` was added later
  (`508b2c7`, 2026-03-21).
- `src/components/FeedbackFooter.astro` — superseded by inline footer
  links during the sidebar redesign.
- `src/pages/_template.astro` — calculator template page deleted when
  per-calculator routes were removed.
- All `src/pages/calculators/{adhesive,blocks,bricks,conversions,grout,
  mortar,spacers,tiles,index}/index.astro` — replaced by project routes
  hosting wizards (`/tiling`, `/brick-wall`, `/hard-flooring`, etc.).
- `src/pages/info/help/project-lists.astro` — orphan help page removed
  with the save-to-project language.
- `src/pages/projects/{masonry,tiling}/index.astro` — predecessors of the
  current `/tiling` and `/brick-wall` routes.
- `src/components/calculators/MasonryCalculator.tsx` — deleted in the
  Era 4 rebuild; replaced by `MasonryProjectWizard` (`9813a36`).
- `.agent/RULES.md`, `.agent/skills/*`, `.agent/workflows/*` — early agent
  prompt scaffolding, removed.
- `major-mercury/` — leftover Astro init directory removed in commit two
  (`38aa768`). The package name `major-mercury` in `package.json` is the
  remaining trace.
- `src/calculators/{adhesive,grout,spacers,tiles,conversions}.test.ts` —
  not deleted but superseded by the `__tests__/` versions in `76c61cb`.
  `masonry.test.ts`, `board-coverage.test.ts`, and `registry.test.ts`
  were not migrated and still live in the parent folder; this is the
  known minor inconsistency mentioned in §6.
- `src/pages/calculators/unit-converter/index.astro` — duplicate route
  alongside the live `/unit-converter` route. It was re-rooted on
  2026-02-16 (`9dcbfb3`) but the legacy path still resolves; this is a
  tidy-up candidate for Phase 1.

---

## 9. Current state at HEAD (`f91ee5a`, 2026-05-08)

- **Package shape:** single npm package (`major-mercury`, version
  `0.0.1`) — not a monorepo, no workspaces.
- **Source size:** ~20,500 LOC across `*.ts`, `*.tsx`, `*.astro`
  (excluding `node_modules`, generated `.astro/`, `package-lock.json`,
  binary PDFs in `docs/tds/`).
- **Test suite (`src/`):** 51 test files, 500 test cases (Vitest 4 +
  React Testing Library + jsdom). Unscoped vitest discovery currently
  also picks up tests inside the local `.claude/worktrees/*` folders;
  see §6 and §10.
- **Live calculators (6):** Tiling project, Hard flooring, Brick & block
  wall, Decking, Unit converter, Board coverage.
- **Coming-soon calculators (2):** Cladding, Board cutting optimiser.
- **Last 5 commits on `main`** (most recent first):
  1. `f91ee5a` — Merge branch 'feat/decking-integration' — Decking
     project calculator (sixth live calculator)
  2. `37b2351` — feat(homepage): enable decking calculator link
  3. `af7d590` — docs(evidence): add design-tokens, masonry-engine
     evidence and TDS source documents
  4. `c742bc9` — docs(plans): add 25 March phase 2 planning artefacts
  5. `4c02171` — feat(decking): add wizard, route, and Layer 2 config;
     refine registry description
- **Branches present:** `main`, `feat/decking-integration` (merged into
  main this session, can be deleted), `claude/pedantic-hypatia`
  (previously merged), `claude/kind-driscoll` (older worktree),
  `claude/crazy-rubin-d08be7` (active audit worktree).
- **Deploy URL:** `https://sami.github.io/selco/` via GitHub Actions on
  push to `main` (workflow established `35d9435`, `818dc7a`,
  `f1477cd`). The decking integration has been merged but **not yet
  pushed** — Phase 3 will push `main` and verify the deploy.
- **Open GitHub issues:** none discoverable from the local checkout.
- **CI guards:** CSS token lint guard (`df1d1ac`) prevents undefined
  `--*` references; Pages workflow has a concurrency guard (`f1477cd`).

---

## 10. Gaps and known issues to handle in Phase 1

The following are visible from this audit and should be addressed in the
Phase 1 cleanup pass. Items marked `[resolved in Phase 0.5]` no longer
apply at HEAD.

1. **`GEMINI.md` at the repo root.** Agent-rules document explicitly
   marked for deletion in the Phase 1 brief.
2. **Two coming-soon stubs without tests:** `cladding.ts` and
   `board-cutting.ts`. Either flesh out with tests or remove. (Decking
   `[resolved in Phase 0.5]`.)
3. **Test-folder inconsistency:** `masonry.test.ts`,
   `board-coverage.test.ts`, and `registry.test.ts` still live in
   `src/calculators/` rather than `__tests__/`.
4. **Duplicate unit-converter route:** `src/pages/calculators/unit-converter/`
   coexists with the canonical `src/pages/unit-converter/`. The old path
   should be removed or redirected.
5. **Package name `major-mercury`** in `package.json` — should be the
   product name, e.g. `trade-materials-calculator`.
6. **Two stash entries on the worktree branch** (`145e886`,
   `d8ab5a2`) — git stash artefacts that should not appear in any final
   history report.
7. **README mentions only the original tiling calculators** and does not
   mention masonry, flooring, board coverage, or decking — predates the
   Era 4 / Era 6 build-out and needs a rewrite.
8. **`docs/audit/` and `docs/plans/` directories** are intentionally kept
   as evidence for the TMA report; do not delete during cleanup.
9. **No `LICENSE` file** at the repo root despite the README linking to
   one — Phase 1 will add it.
10. **No `ARCHITECTURE.md`** — Phase 1 will produce one capturing the
    Layer 1/2/3 separation described in §3.
11. **Vitest discovery picks up `.claude/worktrees/*` test files.**
    Running `npx vitest run` from the repo root reports 187 / 2,003
    rather than the accurate 51 / 500 because vitest scans the entire
    repo by default. Phase 1 should scope discovery via `vitest.config.ts`
    (`include: ['src/**/*.test.{ts,tsx}']` or set the `root` to `src`).
12. **Homepage card list and registry are duplicated.**
    `src/pages/index.astro` carries its own hardcoded `calculators` array
    with a separate `comingSoon` flag, alongside the canonical
    `src/projects/registry.ts`. The hard-flooring enable
    (`f351866`) and the decking enable (`37b2351`) had to update both.
    Phase 1 should make `index.astro` derive from the registry.
13. **Generated `.astro/settings.json` is tracked.** It should be in
    `.gitignore` like other build cache.
14. **`coverage/` is not gitignored** — currently 1.1 MB of vitest
    coverage output sits as untracked content; Phase 2 will produce a
    fresh report and Phase 1 should ignore the directory.
15. **`.DS_Store` files are not gitignored** — several lurk inside the
    working tree at the parent and `docs/` levels.
16. **TDS PDFs total ~22 MB.** Committed in `af7d590` for evidence.
    Acceptable on a TMA repo but not ideal for long-term repo size; Git
    LFS could be considered if the repo continues past TMA 02.

---

## 11. Era 5 dormancy — reflection notes for TMA 02 §6

The dormancy gap (2026-03-30 → 2026-05-02) is named honestly above in §2.
For the report's Personal Development, Review and Reflection section, the
useful framing — Gibbs cycle, applied to this period — is roughly:

- **Description.** 34 calendar days with zero commits and zero file-mtime
  activity, immediately following the most intensive nine-day sprint
  in the project. Three days of completed decking work sat uncommitted
  through the entire gap.
- **Feelings.** A natural drop-off after sustained effort, compounded
  by SELCO shift demands and life outside the module.
- **Evaluation.** Bad in the moment — fortnightly tutor updates were
  missed; the write-up window was compressed; uncommitted work risked
  being lost. Less bad on reflection — the work that *had* been done
  was substantial and integrated cleanly when picked back up; nothing
  was lost.
- **Analysis.** The dormancy was driven by external commitments rather
  than blockers in the codebase. The Era 4.5 / Era 5 boundary is
  exactly where committing the decking work would have made it visible
  to the future me; the underlying lesson is *commit-on-end-of-day*
  even for incomplete sprints, especially before any planned break.
- **Conclusion.** A six-week write-up window ought to have absorbed a
  four-week gap and still left two weeks; instead it was telescoped
  into one. The tutor-update cadence was the more obvious failure mode
  and the one most worth changing in future modules.
- **Action plan.** Era 6 captures the recovery: a deliberate audit
  pass (this document), a conditional cherry-pick of the dormant work
  with test-suite gating, a minimal cleanup pass, and a planned deploy
  + screenshot capture for marker-visible evidence in Section
  "Project Work" of TMA 02.
