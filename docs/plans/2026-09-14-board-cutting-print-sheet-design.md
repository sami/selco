# Board cutting optimiser: printable, signable cutting sheet

**Date:** 14 September 2026
**Status:** Approved design, implemented on branch feat/board-cutting-print-sheet

## Goal

Rebuild the board cutting optimiser in `src/` so a trade sales assistant (TSA)
can plan a customer's cuts, go through the terms with them on screen, then
print a cutting sheet the customer signs before any board is cut. The wording
protects the TSA on tolerance, cut edges, pieces the saw can't cut to size,
and returns.

Only the cutting optimiser gets print support in this pass. Other calculators
are unchanged.

## Decisions

| Topic | Decision |
|---|---|
| Approach | Rebuild in `src/`, test-first, porting the engine from `200e7f4` (`src/calculators/v2/board-cutting.ts`) |
| Tolerance | Fixed at ±3 mm, printed on every sheet |
| Returns | Cut boards and offcuts are non-returnable; the sheet says only that, and the TSA handles any further conversation |
| Sheet details | Customer signature, plus date and time (printed timestamp and a handwritten signed date and time) |
| Not included | Customer name, phone, order or receipt number, TSA name or signature |
| Terms on screen | Yes, above the print button, from the same source as the printed terms |
| Frozen page | `/board-cutting/` stays reachable by URL; the catalogue card points to the rebuilt page |

The sheet has no order or receipt number, which makes a signed sheet harder
to tie to a sale later. This was a deliberate choice and can be revisited.

The wording is plain English, not legal advice. It should be checked against
the employer's own terms of sale before customers sign it.

**Changes the user approved after the final review:** the cut list size column
names its order ("Width × height (mm)" for sheets, "Depth × length (mm)" for
worktops), the below-minimum note gives the in-store cut size, and term 10 says
"Board counts" rather than "Sheet counts". Sections 1 and 2 below include them.

**Removed after release:** the "Board choice" term, which asked the customer to
confirm they had seen the boards staff chose. Some orders are taken over the
phone, so the customer may never see the boards before they're cut. The
Returns term was also shortened to "Cut boards and offcuts can't be returned
or refunded.", dropping the faulty-board sentence, with no link to external
terms; the TSA handles any further conversation.

## 1. Engine: `src/calculators/board-cutting.ts`

Ported from the pre-reset engine, keeping:

- Two sheet profiles:
  - Standard sheet, 2440 × 1220 mm (ply, MDF, OSB, hardboard), cut both ways
  - Worktop, 3000 × 600 × 38 mm, cross-cut to length only
- Shelf packing (first-fit decreasing height) for sheets, and 1D first-fit
  decreasing packing for worktops
- Panel saw limits: 3 mm kerf, 500 × 230 mm minimum workpiece, 3100 ×
  1644 mm maximum, 60 mm maximum depth. Neighbouring parts are packed
  `GAP_MM` = 6 mm apart (the 3 mm blade plus the 3 mm tolerance), with no gap
  at a board edge (changed after release, see section 4)
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
- Each `CutListEntry` also carries the in-store cut size in the direction
  entered (`cutWMm`/`cutHMm`): oversize for pieces below the saw minimum, the
  full 600 mm width for worktops, and the finished size for pieces that don't
  fit. It matches the size each placed piece is packed at, allowing for
  rotation. (Approved after the final review.)
- For worktops, width is the depth across the worktop (up to 600 mm) and
  height is the length along it (up to 3000 mm). The two are never swapped.
- Sizes must be whole millimetres.
- New constant `TOLERANCE_MM = 3`.

## 2. Printed sheet wording

Black and white, A4. "We" means the store doing the cutting.

**Header:** "Board cutting sheet", then a job summary (board type, "Boards
needed", whether pieces may be turned) and "Printed on" with the date and time.

**Cutting plan:** drawing of each sheet with every piece labelled by letter.

**Cut list:** columns Ref, "Width × height (mm)" for sheets or "Depth ×
length (mm)" for worktops, Qty, Notes. Notes cover "May be turned to fit",
"Below saw minimum: cut at W × H, trim at home" (W × H is the in-store cut
size), and for worktops "Cut to length only: trim to width at home". The
column names and the below-minimum note were approved after the final review.

**Please read before signing**

1. **Sizes.** We cut to the sizes in the cut list above. Check every line before you sign, because we can't change a size once it's been cut.
2. **Tolerance.** Each cut piece can be up to 3 mm over or under the size listed. The plan leaves room for this. Allow for this in your fitting, for example with a small gap or by scribing to fit.
3. **Blade width.** The saw removes about 3 mm with every cut. The plan already allows for it, so leftover pieces will be slightly smaller than they look on paper.
4. **Cut edges.** Coated boards such as melamine or laminate can chip along a cut. Cut edges aren't finished and may need edging tape or a light sand.
5. **Grain and pattern.**
   - Rotation on: "Pieces may be turned on the sheet to save board. If grain or pattern direction matters, tell us before signing."
   - Rotation off: "Pieces are cut in the direction shown on the plan."
6. **Pieces we can't cut to size.** Only when needed.
   - Below minimum: "Pieces C are below the saw's 500 × 230 mm minimum. We'll cut them oversize and you'll need to trim them yourself." (letters listed)
   - Worktops narrower than 600 mm: equivalent line saying they're cut to length only and need trimming to width at home.
7. **Once cut.** Boards can move slightly with changes in temperature and humidity, so store cut pieces flat and dry.
8. **Returns.** Cut boards and offcuts can't be returned or refunded.
9. **Estimate.** Board counts and layouts are worked out from the sizes given and are an estimate. Board sizes can vary slightly between batches. (Wording approved after the final review.)

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

## 4. Saw operator plan (added after release)

**Approved:** 15 September 2026, on branch feat/saw-operator-plan. The plan
the TSA prints is now one the saw operator can work from, and the packing
leaves room for the cutting tolerance.

**Gap.** `GAP_MM = PANEL_SAW.kerfMm + TOLERANCE_MM`, 6 mm, is kept between
neighbouring pieces on a strip, between strips and between worktop cuts, so a
piece that comes out up to 3 mm over never runs the board out. The operator
still cuts each piece to its size. There is no gap at a board edge, so a full
1220 × 2440 piece still fits one sheet.

**Strips, steps and offcuts.** Each `SheetLayout` now also carries:

- `strips` (sheets only, `[]` for worktops): each strip's y position, height
  and pieces in x order, numbered from 1 in the order they're cut.
- `cuts`: the numbered steps, 1, 2, 3… per board.
  - Sheets, per strip: cut the strip across the full width at its height,
    unless it ends at the board edge; then cross-cut each piece at its width,
    with a trim to the piece's height when it's shorter than the strip. A
    piece that ends flush with the board edge and needs no trim gets no step.
  - Worktops: cut each piece to length in order along the worktop, skipping a
    piece that ends flush with the worktop end.
- `offcuts`, at their smallest size once the gap is allowed for, listed per
  strip (above each trimmed piece in x order, then the strip's right
  remainder), then below the last strip. A worktop has a single end offcut.

Pieces below the saw minimum use their in-store cut size and placed
(possibly turned) dimensions throughout; the trim down to the finished size
at home is covered by the cut list note, not a saw step.

**`MIN_OFFCUT_MM` = 10.** Offcuts under 10 mm in either direction are dust and
aren't listed.

**Step wording** (`src/components/board-cutting/saw-steps.ts`):

- Strip: "Cut strip 1 across the full 1220 mm width at 600 mm"
- Piece: "From strip 1, cut A at 800 mm", adding ", then trim to 400 mm"
  when trimmed
- Worktop: "Cut A at 1500 mm"
- Offcuts line: "Offcuts, at least: 1220 × 1834, 414 × 600", or "No usable
  offcuts."; a board with no steps shows "No cuts needed for this board."

**Drawing and tick boxes.** `SawPlan` replaces the old plan drawing on screen
and on the printed sheet. Each board is one block that isn't split across
pages: a caption ("Sheet 1 of 2, 57% of board used"), then the drawing beside
the numbered steps on wide screens and in print, stacked on narrow screens.
Pieces are labelled with their letter and, when there's room, their cut size;
offcuts are shaded lighter with a dashed outline and labelled "Offcut W × H"
when there's room. Every step starts with an empty square the operator ticks
on paper. The result card reads "N pieces planned with a 3 mm blade and 3 mm
tolerance allowance between cuts".

**Wording note.** The Blade width term still says leftover pieces "will be
slightly smaller than they look on paper", while the plan now labels offcuts
with their minimum size. The term was left unchanged; it can be revisited.

## Testing

Test-first, with RED and GREEN commits as for Masonry and Flooring.

- **Engine:** parts never overlap and stay inside the sheet; at least the
  6 mm blade and tolerance gap between neighbouring parts; offcuts stay inside
  the board, clear of every part by the gap; exact steps and offcuts for
  sheets, trimmed pieces, pieces below the saw minimum and worktops; worktop parts always take the full 600 mm
  width and narrower ones are flagged; rotation off never rotates; below
  minimum and unplaceable parts flagged; one letter assigned per row;
  invalid input throws.
- **Terms:** up to nine terms in order; rotation wording follows the setting;
  term 6 appears only when needed and names the right letters; ±3 mm always
  present; no term asks the customer to confirm boards they may not have seen.
- **Components:** add and remove rows; an oversized part flags its row and
  disables printing; rotation checkbox hidden for worktops; print button calls
  `window.print`; timestamp set on `beforeprint`; screen terms match printed
  terms; the sheet includes cut list letters, terms and the signature line.
- **Print check:** print the built page to PDF with headless Chrome and
  review the A4 layout, page breaks, and that no screen-only controls appear.
