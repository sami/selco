# Phase 5 — Integration & Verification



**Goal:** Wire new React island components into Astro pages, update the calculator registry, run responsive/accessibility checks, verify the full build, and write the completion report.

**Architecture:** Astro pages import React islands with `client:load` for interactive hydration. The calculator registry (`src/projects/registry.ts`) drives the homepage grid and navigation. New pages follow the existing pattern (SelcoLayout + SelcoSidebar + calculator island + disclaimer).

**Tech Stack:** Astro 4, React 18, TypeScript, Vitest

**Branch:** `wt/pedantic-hypatia`

---

### Task 1: Replace MasonryCalculator with MasonryProjectWizard on brick-wall page

**Files:**
- Modify: `src/pages/brick-wall/index.astro`

**Step 1: Update the import**

Change line 5:
```astro
// OLD:
import MasonryCalculator from '../../components/MasonryCalculator.tsx';

// NEW:
import MasonryProjectWizard from '../../components/MasonryProjectWizard.tsx';
```

**Step 2: Update the component usage**

Change line 75:
```astro
// OLD:
<MasonryCalculator client:load />

// NEW:
<MasonryProjectWizard client:load />
```

**Step 3: Commit**

```bash
git add src/pages/brick-wall/index.astro
git commit -m "feat(pages): replace MasonryCalculator with MasonryProjectWizard on brick-wall page"
```

---

### Task 2: Create flooring Astro page and update registry

**Files:**
- Create: `src/pages/hard-flooring/index.astro`
- Modify: `src/projects/registry.ts`

**Step 1: Create the flooring page**

Follow the brick-wall page pattern. Create `src/pages/hard-flooring/index.astro`:

```astro
---
import SelcoLayout from '../../layouts/SelcoLayout.astro';
import Disclaimer from '../../components/Disclaimer.astro';
import SelcoSidebar from '../../components/selco/SelcoSidebar.astro';
import FlooringProjectWizard from '../../components/FlooringProjectWizard.tsx';

const BASE_URL = import.meta.env.BASE_URL;
const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

const breadcrumbs = [
  { label: 'Home', href: `${base}` },
  { label: 'Hard Flooring' }
];

const title = 'Hard Flooring Calculator — Laminate, Engineered Wood, Vinyl & Solid Wood';
const description = 'Calculate packs of flooring, underlay, scotia beading, threshold strips, and adhesive for any room. Supports L-shaped rooms and all common laying patterns.';

const faqs = [
  {
    question: 'How do I work out how many packs of flooring I need?',
    answer: 'Measure your room length and width in metres, multiply to get the area in m², then divide by the coverage per pack (printed on the box). Add 5–15% for wastage depending on laying pattern. This calculator does all of that for you.'
  },
  {
    question: 'What wastage percentage should I allow?',
    answer: 'Straight laying: 5%. Brick bond (staggered): 10%. Diagonal or herringbone: 15%. These are industry-standard allowances from the Flooring Industry Training Association (FITA).'
  },
  {
    question: 'Do I need underlay?',
    answer: 'Yes for laminate, engineered wood, and solid wood floating installations. LVT (vinyl click) typically does not need underlay — check the manufacturer instructions. This calculator includes underlay by default for wood-type floors.'
  },
  {
    question: 'What is scotia beading?',
    answer: 'Scotia is a small moulding that covers the expansion gap between floating flooring and the skirting board. It runs around the room perimeter. Standard lengths are 2.4 metres.'
  },
  {
    question: 'What about L-shaped rooms?',
    answer: 'Tick the L-shaped room checkbox and enter the extension dimensions. The calculator adds the extension area to the main room area for an accurate total.'
  }
];
---

<SelcoLayout
  title={title}
  description={description}
  pageTitle="Trade Materials Calculators"
  breadcrumbs={breadcrumbs}
  showSidebar
>
  <SelcoSidebar />

  <main class="w-full">
    <div class="space-y-6">
      <section class="space-y-6">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-surface-foreground">Hard Flooring Calculator</h2>
          <p class="text-muted-foreground mt-3 max-w-3xl">
            Calculate flooring packs, underlay, scotia beading, threshold strips, and adhesive for any room.
            Supports laminate, engineered wood, solid wood, and luxury vinyl tile (LVT).
          </p>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <FlooringProjectWizard client:load />
        </div>
      </section>

      <section class="space-y-6 max-w-4xl mt-12">
        <h2 class="text-2xl md:text-3xl font-bold text-surface-foreground">Frequently Asked Questions</h2>
        <div class="space-y-4">
          {faqs.map((faq) => (
            <div class="rounded-xl border border-border bg-surface p-5">
              <h3 class="font-semibold text-surface-foreground">{faq.question}</h3>
              <p class="text-sm text-muted-foreground mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="space-y-6 max-w-4xl mt-12">
        <h2 class="text-2xl md:text-3xl font-bold text-surface-foreground">Related Calculators</h2>
        <div class="flex flex-wrap gap-3">
          <a href={base} class="inline-flex items-center px-4 py-2 rounded-lg bg-surface border border-border hover:border-brand-blue transition-colors text-sm font-medium">
            ← Back to Homepage
          </a>
          <a href={`${base}tiling/`} class="inline-flex items-center px-4 py-2 rounded-lg bg-surface border border-border hover:border-brand-blue transition-colors text-sm font-medium">
            Tiling Project
          </a>
          <a href={`${base}brick-wall/`} class="inline-flex items-center px-4 py-2 rounded-lg bg-surface border border-border hover:border-brand-blue transition-colors text-sm font-medium">
            Brick & Block Wall
          </a>
        </div>
      </section>

      <div class="mt-16 flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-xl border-2 border-brand-blue bg-gradient-to-br from-brand-blue/5 to-transparent shadow-sm">
        <div class="flex-1 w-full text-left">
          <Disclaimer text="Calculations are estimates only. Always verify product coverage and site conditions before ordering." />
        </div>
        <a
          href="https://madebysami.notion.site/2fe361401cd480fc9fcfdf4871d199b1?pvs=105"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-blue text-white font-bold text-sm uppercase tracking-wide hover:bg-brand-yellow hover:text-brand-navy transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md flex-shrink-0 w-full sm:w-auto text-center"
        >
          Share feedback
        </a>
      </div>
    </div>
  </main>
</SelcoLayout>
```

**Step 2: Update the registry to mark flooring as live**

In `src/projects/registry.ts`, find the flooring entry and change:
```ts
// OLD:
status: 'coming-soon',
comingSoon: true,

// NEW:
status: 'live',
```

Remove the `comingSoon: true` line.

**Step 3: Commit**

```bash
git add src/pages/hard-flooring/index.astro src/projects/registry.ts
git commit -m "feat(pages): create hard-flooring page with FlooringProjectWizard, mark live in registry"
```

---

### Task 3: Full build verification

**Files:** None (verification only)

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: all tests pass

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: no new errors

**Step 3: Run Astro build**

Run: `npx astro build`
Expected: clean build, no errors. All pages generate including the new `/hard-flooring/` route.

**Step 4: Commit any build fixes if needed**

---

### Task 4: Write completion report to Notion

**Target:** https://www.notion.so/madebysami/TMA-02-Build-React-island-components-with-design-system-94de9f8eb4a4468da477f8dc3559e889

**Content to write:**

The report should cover:
1. **What was built** — summary of all 5 phases
2. **Component inventory** — list of all ui/ components with their props
3. **Calculator inventory** — list of all calculator islands and which ui/ components they use
4. **Test results** — final test count, all passing
5. **Build results** — astro build clean
6. **Commit history** — total commits on the branch
7. **Architecture** — the three-layer model, how configs drive wizards
8. **Design decisions** — key choices (NumberInput API alignment, CalculatorLayout kept as shell, WizardShell extended for optional steps, etc.)

---

## Summary

| File | Action | Notes |
|------|--------|-------|
| `src/pages/brick-wall/index.astro` | Modify | Replace MasonryCalculator → MasonryProjectWizard |
| `src/pages/hard-flooring/index.astro` | Create | New page with FlooringProjectWizard |
| `src/projects/registry.ts` | Modify | Mark flooring as live |
