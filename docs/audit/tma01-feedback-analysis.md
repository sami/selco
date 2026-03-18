# TMA 01 Feedback Analysis
**Sami Bashraheel · Y4347284 · TM470-26B**
**Tutor: Ms JA Tope (Ju) · Score: 57/100 · Date: 17 March 2026**

---

## Overall Verdict (Ju)

> "A good start but superficial in many areas. I still only have a vague idea of how your app will work. Need to rearrange order of descriptions, evidence etc., do not use appendices so much."
> "Much of the mark loss will be due to not making much headway with your actual project work."

---

## Checklist Findings

### ✅ 1 — Re-read Ju's comments: "superficial", "vague idea of how your app will work"

**What "superficial" means in practice — per-LO analysis:**

| LO | Score | Marks lost | Ju's exact note |
|----|-------|-----------|-----------------|
| LO1 Technical Concepts | 12/20 | 8 | "No section for work done/proposed. Too much important stuff buried in appendices." |
| LO11 Solving practical problem | 12/20 | 8 | Same as LO1 |
| LO7 Communication | 4/8 | 4 | "Overuse of appendices for evidence. Revisit structure." |
| LO9 Planning | 3/7 | 4 | "Plan too high level. Does not follow lifecycle. Needed better idea of activities from MoSCoW." |
| LO3 Resources/Skills/Risks | 3/7 | 4 | "Is 2.4 resources? Not clear. Skills all product/platform. Risks need to address all resources / skills / personal." |
| LO2 Project Goals | 3/6 | 3 | "2.2 needs to be in section 1. Scope doesn't fully address functionality stages. Do a MoSCoW." |
| LO4 Evaluating sources | 2/6 | 4 | "Sources described but not evaluated individually. Do a PROMPT of all sources cited." |
| LO8 Reflection | 3/6 | 3 | "No reference to log extracts." |
| LO6 Using information | 3/6 | 3 | "Needs to be more thorough." |

**LO1 + LO11 together = 16 marks lost out of a possible 40.** These two LOs are the primary reason for the 57% score.

**"Vague idea of how your app works" — why:**

A reader relying only on the main body (Sections 1–7) gets:
- *What it will do* — objectives and scope in Section 1
- *What technologies* — one paragraph in Section 2.4
- *A meta summary* — one paragraph in Section 6 ("three calculator types across 105 commits")

A reader cannot see from the main body:
- What any screen looks like
- What inputs/outputs the calculators have
- How the wizard steps are sequenced
- How calculations are validated against real products
- Any evidence that the prototype actually works

---

### ✅ 2 — Identify which parts of the prototype fail to make the solution concrete

**The prototype itself is solid** — three working calculators, correct maths, deployed on GitHub Pages. The gap is entirely between the prototype's existence and how the report represents it.

| What the prototype does | How it's represented in TMA01 |
|------------------------|-------------------------------|
| 10-step tiling wizard (tiles, adhesive, grout, spacers, primer, backer board, tanking, SLC, summary) | One sentence in Section 6: "The tiling calculator (a multi-material project wizard)" |
| Board Coverage Calculator with 6 UK board size presets | "three calculator types" — no feature description |
| Unit Converter covering Length, Area, Volume, Weight | "Unit converter" — no description of conversion families or UX decisions |
| SELCO-branded layout with sidebar navigation | "Began redesigning the front-end to match SELCO's website branding" in progress log (Appendix 2, Week 3) |
| Calculation formulas validated against manufacturer TDS | All in Appendix 6 — not referenced from the main body |
| 105 commits, test suite, CI/CD via GitHub Actions | Mentioned numerically; no evidence shown |

**The prototype makes the solution concrete. The report doesn't surface that evidence.**

---

### ✅ 3 — Note what evidence was missing from the main body (buried in appendices)

| Evidence | Where it is | Where it should be | LOs it addresses |
|----------|------------|-------------------|-----------------|
| Application screenshots showing all 3 calculators | Appendix 7 | "Work Done" section in main body | LO1, LO11 |
| Competitor research comparison table with pros/cons | Appendix 5 | Section 2.2 (Existing Solutions) | LO2, LO6 |
| Calculation formulas (tiles, adhesive, grout, spacers) | Appendix 6 | Summary table in main body under Work Done | LO1, LO11 |
| Weekly progress log with skills development reflections | Appendix 2 | Referenced from Section 6 (specific log extract callouts) | LO8 |
| MoSCoW prioritisation | Missing entirely | Section 1.2 (Scope) | LO2, LO9 |
| PROMPT evaluation of sources | Missing entirely | Section 2.3 (Academic Literature) | LO4 |
| Soft skills in skills assessment | Missing from Section 5.2 | Section 5.2 (Skills Assessment) | LO3 |
| Personal risks (Ramadan, solo working, time management) | Mentioned in Appendix 2, Week 4 | Section 5.6 (Risk Assessment) | LO3 |
| Lifecycle comparison (≥4 models) | Only 3 mentioned in text | Section 4.1 (Lifecycle Model) | LO9 |
| Evaluation criteria linked to MoSCoW | Missing entirely | After scope/MoSCoW section | LO2 |

---

### ✅ 4 — Specific improvements that address each piece of feedback

---

#### 4.1 Add a "Work Done" section (Ju explicitly asked for this)

**Ju's action:** "Include a work done section" (against LO1 and LO11)

What to include in a new Section 6: Work Done (pushing current Section 6 to Section 7):
- **Architecture diagram** showing the three-layer separation (pure logic → project configs → Astro pages)
- **3–4 annotated screenshots** of the running prototype: homepage, wizard step 1, wizard summary, coverage calculator with results
- **Feature summary table**: calculator name | key inputs | key outputs | wizard step | test coverage
- **Brief formula summary**: one worked example per calculator module (e.g., tile quantity formula with a 4.5 × 3.2m sample) with reference to Appendix 6 for full derivations
- **Test coverage evidence**: screenshot of Vitest output showing 46 passing tests with coverage %
- **GitHub Pages deployment**: URL + commit count as evidence of continuous delivery

This addresses LO1 and LO11 and recovers the 16 marks (8 + 8) — the largest single improvement available.

---

#### 4.2 Add a MoSCoW table (Ju explicitly asked for this)

**Ju's action:** "Do a MoSCoW" (against LO2, LO9)

Restructure Section 1.2 (Scope) to include:

```
MUST (MVP — TMA02):
  M1: Tiling project wizard (tiles, adhesive, grout, spacers)
  M2: Unit Converter (Length, Area, Volume, Weight)
  M3: Coverage Calculator (board sizes)
  M4: SELCO-branded mobile-first layout
  M5: 90%+ unit test coverage for all calculation logic

SHOULD (TMA02–TMA03):
  S1: Masonry calculator (bricks, blocks, mortar)
  S2: Concrete/hardcore calculator
  S3: Primer/backer board/tanking wizard steps
  S4: SLC and self-levelling compound steps

COULD (TMA03–EMA):
  C1: Paint calculator
  C2: Loft insulation calculator
  C3: Product range mapping (bag sizes → purchase units)

WON'T (this version):
  W1: Real-time stock and pricing data
  W2: User accounts or saved projects
  W3: Backend or payment integration
```

This also feeds directly into the Plan (LO9) — the plan becomes traceable to MoSCoW items rather than vague phases.

---

#### 4.3 Move Existing Solutions comparison into main body (Section 2.2)

**Ju's action:** "Subsection 2.2 needs to be in section 1" + "Do a full comparison"

Replace the current single-paragraph Section 2.2 with:
- A **comparison table**: competitor | calculator types | mobile-first? | multi-material wizard? | products mapped? | notes
- At least Bradfords, Builder Depot, Wickes, Toolstation as named comparators
- The **4 design decisions** derived explicitly: multi-material wizard, pattern-aware wastage, mobile-first layout, well-maintained as advantage
- Keep Appendix 5 for the raw screenshots (that's appropriate appendix use)

---

#### 4.4 Add PROMPT evaluation of all sources (Ju explicitly asked for this)

**Ju's action:** "Do a PROMPT of all sources cited" (against LO4)

Add a PROMPT table in Section 2.3. Example structure:

| Source | Presentation | Relevance | Objectivity | Method | Provenance | Timeliness |
|--------|-------------|-----------|------------|--------|-----------|-----------|
| Wroblewski (2011) | Book, clear argument | High — survey confirmed on-site phone use | Author is advocate for mobile-first; one perspective | Practitioner experience + case studies | A Book Apart, respected UX publisher | 2011 — pre-smartphone dominance, but principles endure |
| Nielsen (1994) | Book | High — wizard pattern directly applied | Foundational, widely validated | Empirical usability studies | Morgan Kaufmann, academic publisher | 1994 — principles still standard in HCI |
| ... | | | | | | |

Apply to: Wroblewski (2011), Nielsen (1994), Krug (2014), BS 5385-1:2018, Braun & Clarke (2006), Gibbs (1988), manufacturer TDS sources.

---

#### 4.5 Expand the Skills Assessment to include soft skills and personal risks

**Ju's action:** "Skills all product/platform related. What about soft skills? Risks need to address all resources / skills / personal aspects."

Add to Section 5.2 (Skills Assessment):
| Skill | Current Level | Gap | Development Strategy |
|-------|--------------|-----|---------------------|
| Academic report writing | New to TM470 format | Structure, citations, avoiding narrative style | Apply Ju's feedback tips from TMA01 PT3 |
| Project management (solo) | Moderate — informal | TMA-aligned planning; writing vs development balance | Fixed writing blocks each iteration |
| Primary UX research | New — first survey | Structured evaluation methods | Post-implementation feedback form with TSAs |

Add personal risks to Section 5.6:
| Risk | Type | L/I | Mitigation |
|------|------|-----|-----------|
| Ramadan reduces available energy and working hours | Personal | M/M | Front-load development tasks before Ramadan; keep smaller sessions during |
| Development momentum outpacing TMA writing | Personal | H/H | Allocate fixed writing blocks; treat TMA draft as a deliverable alongside code |
| Solo developer — no peer review | Personal | M/M | Use test suite as quality gate; schedule TSA reviews at each milestone |

---

#### 4.6 Fix the reflection to reference log extracts

**Ju's action:** "No reference to log extracts" (against LO8)

In Section 6 (Progress Review / Reflection), add explicit callouts to the progress log:
- "The IEEE 754 floating-point bug caught in Week 2 (Appendix 2, Week 2: Reflections) reinforced…"
- "The product pivot to remove state persistence in Week 3 (Appendix 2, Week 3) demonstrates the iterative lifecycle…"
- "The Ramadan period during Week 4 (Appendix 2, Week 4) required adapting working patterns…"

Ju reads appendices only when explicitly referenced from the main body. If Section 6 doesn't say "see Appendix 2, Week X", she won't read it.

---

#### 4.7 Fix the Gantt chart

**Ju's action:** "This is unreadable – no black screens please"

Replace the current Gantt (presumably a dark-mode screenshot) with either:
- A **white-background Word table** using Ju's recommended landscape page orientation
- Or a **proper project management image** exported with a white/light background

---

#### 4.8 Restructure to follow Ju's "Tips for good layout"

Ju provided a detailed recommended structure in the feedback form (embedded in the PT3 document). The TMA01 structure does not follow it. For TMA02, adopt this structure:

```
1. Title page
2. Tables of: contents, appendices, figures, tables
3. Glossary
4. Description / problem + aim + objectives (LO2)
5. Existing solutions comparison (LO2)
6. Requirements + MoSCoW (LO2)
7. Evaluation criteria (LO2)
8. LSEPI/EDI (LO10)
9. Literature review (LO4, LO6)
10. Platform choices — options, pros/cons, justified decision (LO3)
11. Resources — table (LO3)
12. Skills — table (LO3)
13. Risks — table (LO3/LO9)
14. Lifecycle comparison — ≥4 models (LO9)
15. Lifecycle choice — justified with diagram (LO9)
16. Current plan (LO9)
17. **Work Done** — analysis, design, implementation, testing, evaluation with screenshots (LO1, LO11, LO3, LO9, LO6)
18. Reflection — Gibbs' cycle on all key aspects (LO5, LO8)
19. References
20. Appendices
```

---

## Summary: Marks Recovery Potential

| Action | LOs recovered | Est. marks recoverable |
|--------|-------------|----------------------|
| Add Work Done section with screenshots and architecture | LO1, LO11 | ~10–12 marks |
| Add MoSCoW + evaluation criteria | LO2, LO9 | ~5–6 marks |
| Add PROMPT evaluations for all sources | LO4 | ~3–4 marks |
| Move competitor comparison into main body | LO2, LO6 | ~3 marks |
| Add soft skills + personal risks | LO3 | ~2–3 marks |
| Reference log extracts from reflection | LO8 | ~2 marks |
| Fix Gantt, restructure per Ju's tips | LO7, LO9 | ~2–3 marks |
| **Total** | | **~27–33 marks** |

A score in the **80–90 range** is achievable for TMA02 if these structural issues are addressed. The underlying project work (prototype quality, research rigour, formula validation) is already strong — the problem is entirely presentation and structure.

---

## Key Principle

> The prototype makes the solution concrete. The TMA01 report did not surface that concreteness into the main body.

For TMA02: **every significant piece of work done must appear in the main body**, with appendices reserved only for supplementary detail (raw data, full formula derivations, consent forms, log extracts referenced from the main body).
