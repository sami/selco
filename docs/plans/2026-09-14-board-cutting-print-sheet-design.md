# Board cutting optimiser: printable, signable cutting sheet

**Date:** 14 September 2026
**Status:** Approved design, implemented on branch feat/board-cutting-print-sheet

## Goal

Rebuild the board cutting optimiser in `src/` so a trade sales assistant (TSA)
can plan a customer's cuts, go through the terms with them on screen, then
print a cutting sheet the customer signs before any board is cut. The wording
protects the TSA on tolerance, board choice, cut edges, pieces the saw can't
cut to size, and returns.

Only the cutting optimiser gets print support in this pass. Other calculators
are unchanged.

## Decisions

| Topic | Decision |
|---|---|
| Approach | Rebuild in `src/`, test-first, porting the engine from `200e7f4` (`src/calculators/v2/board-cutting.ts`) |
| Tolerance | Fixed at ±3 mm, printed on every sheet |
| Returns | Cut boards and offcuts are non-returnable, except where a board is faulty |
| Board choice | The TSA picks the boards; the customer confirms they've seen them and accepts their condition |
| Sheet details | Customer signature, plus date and time (printed timestamp and a handwritten signed date and time) |
| Not included | Customer name, phone, order or receipt number, TSA name or signature |
| Terms on screen | Yes, above the print button, from the same source as the printed terms |
| Frozen page | `/board-cutting/` stays reachable by URL; the catalogue card points to the rebuilt page |

The sheet has no order or receipt number, which makes a signed sheet harder
to tie to a sale later. This was a deliberate choice and can be revisited.

The wording is plain English, not legal advice. It should be checked against
the employer's own terms of sale before customers sign it.

## 1. Engine: `src/calculators/board-cutting.ts`

Ported from the pre-reset engine, keeping:

- Two sheet profiles:
  - Standard sheet, 2440 × 1220 mm (ply, MDF, OSB, hardboard), cut both ways
  - Worktop, 3000 × 600 × 38 mm, cross-cut to length only
- Shelf packing (first-fit decreasing height) for sheets, and 1D first-fit
  decreasing packing for worktops
- Panel saw limits: 3 mm kerf between every part, 500 × 230 mm minimum
  workpiece, 3100 × 1644 mm maximum, 60 mm maximum depth
- An allow-rotation option (off keeps grain or face direction)

Changes from the old engine:

- Returns a structured plan: sheets, placed parts with coordinates, flags and
  unplaceable parts. No customer-voice notes or tools checklist in the engine.
- Each row gets its own reference letter (A, B, C…), so two rows with the
  same size get two letters. The letters are used by the drawing, the cut
  list and the signed sheet.
- Invalid input throws rather than being skipped: zero or negative sizes,
  quantities that aren't whole numbers from 1 to 50, and unknown sheet ids
  (no silent fallback to the first profile).
- Parts too big for the chosen sheet are reported as unplaceable. The UI
  flags the row and blocks printing until they're fixed or removed.
- Parts below the saw minimum stay in the plan, flagged "cut oversize, trim
  at home", and are named by letter on the sheet.
- The below-minimum rule is the same for both profiles (the old worktop path
  only compared length with the 230 mm figure).
- Parts below the saw minimum are packed at their in-store cut size (long side
  at least 500 mm, short side at least 230 mm; worktop lengths at least
  230 mm), so the drawing and the number of boards match what the saw cuts.
  The cut list still shows the finished size the customer asked for.
- For worktops, width is the depth across the worktop (up to 600 mm) and
  height is the length along it (up to 3000 mm). The two are never swapped.
- Sizes must be whole millimetres.
- New constant `TOLERANCE_MM = 3`.

## 2. Printed sheet wording

Black and white, A4. "We" means the store doing the cutting.

**Header:** "Board cutting sheet", then a job summary (board type, "Boards
needed", whether pieces may be turned) and "Printed on" with the date and time.

**Cutting plan:** drawing of each sheet with every piece labelled by letter.

**Cut list:** columns Ref, Size (mm), Qty, Notes. Notes cover "May be turned
to fit", "Below saw minimum: cut oversize, trim at home", and for worktops
"Cut to length only: trim to width at home".

**Please read before signing**

1. **Sizes.** We cut to the sizes in the cut list above. Check every line before you sign, because we can't change a size once it's been cut.
2. **Tolerance.** Each cut piece can be up to 3 mm over or under the size listed. Allow for this in your fitting, for example with a small gap or by scribing to fit.
3. **Blade width.** The saw removes about 3 mm with every cut. The plan already allows for it, so leftover pieces will be slightly smaller than they look on paper.
4. **Board choice.** Our staff chose these boards. By signing, you confirm you've seen them and are happy they're free of damage or bowing before cutting starts.
5. **Cut edges.** Coated boards such as melamine or laminate can chip along a cut. Cut edges aren't finished and may need edging tape or a light sand.
6. **Grain and pattern.**
   - Rotation on: "Pieces may be turned on the sheet to save board. If grain or pattern direction matters, tell us before signing."
   - Rotation off: "Pieces are cut in the direction shown on the plan."
7. **Pieces we can't cut to size.** Only when needed.
   - Below minimum: "Pieces C are below the saw's 500 × 230 mm minimum. We'll cut them oversize and you'll need to trim them yourself." (letters listed)
   - Worktops narrower than 600 mm: equivalent line saying they're cut to length only and need trimming to width at home.
8. **Once cut.** Boards can move slightly with changes in temperature and humidity, so store cut pieces flat and dry.
9. **Returns.** Cut boards and offcuts can't be returned or refunded. This doesn't affect your rights if a board is faulty.
10. **Estimate.** Sheet counts and layouts are worked out from the sizes given and are an estimate. Board sizes can vary slightly between batches.

**Signature block:** "I've checked the sizes, the cutting plan and the boards,
and I agree to the terms above." Lines for customer signature, and date and
time signed.

**Footer:** "Produced with Trade Materials Calculator, an independent
estimating tool."

## 3. Screen, printing and code layout

**Route:** `src/pages/projects/board-cutting/index.astro`, using `BaseLayout`,
with a registry entry. The catalogue card in `public/index.html` points to
`/selco/projects/board-cutting/`.

**On screen** (existing colours and design):

- Board type select; "Pieces may be turned to fit" checkbox, hidden for
  worktops
- Parts list: width, height and quantity per row, a remove button, and
  "Add another piece"
- Plan redraws live as the TSA types
- Row-level errors for zero sizes, quantities outside 1 to 50, and parts too
  big for the board
- Plan drawing with reference letters, then the cut list table
- Terms panel above the print button, rendered from the same terms source as
  the printed sheet
- "Print cutting sheet" button, disabled while any row has an error or the
  list is empty, with the reason shown

**In print:**

- `@page` A4, 12 mm margins, black and white
- Site header, footer, breadcrumbs, inputs and buttons hidden
- Job summary, plan drawing, cut list, terms and signature block shown
- `break-inside: avoid` on each sheet drawing, table rows and the signature
  block; long plans continue onto further pages
- "Printed on" timestamp set on the `beforeprint` event

**Code layout:**

- `src/calculators/board-cutting.ts`: engine
- `src/components/board-cutting/cutting-terms.ts`: sheet wording and the
  conditional terms, built from a plan
- `src/components/board-cutting/`: calculator island, plan drawing, cut list,
  terms panel and printable sheet
- As built: DOM ids use `useId`, and row keys are stable per instance, so the
  server and the client render the same ids. The "Printed on" timestamp is
  stamped with `flushSync` on `beforeprint` and before the print button calls
  `window.print`, so the printed time is current. A row's input errors appear
  once both sizes are entered or focus leaves the row, and printing stays
  blocked while any row is invalid, including errors not yet shown.

## Testing

Test-first, with RED and GREEN commits as for Masonry and Flooring.

- **Engine:** parts never overlap and stay inside the sheet; at least 3 mm
  kerf between neighbouring parts; worktop parts always take the full 600 mm
  width and narrower ones are flagged; rotation off never rotates; below
  minimum and unplaceable parts flagged; one letter assigned per row;
  invalid input throws.
- **Terms:** ten terms in order; rotation wording follows the setting; term 7
  appears only when needed and names the right letters; ±3 mm always present.
- **Components:** add and remove rows; an oversized part flags its row and
  disables printing; rotation checkbox hidden for worktops; print button calls
  `window.print`; timestamp set on `beforeprint`; screen terms match printed
  terms; the sheet includes cut list letters, terms and the signature line.
- **Print check:** print the built page to PDF with headless Chrome and
  review the A4 layout, page breaks, and that no screen-only controls appear.
