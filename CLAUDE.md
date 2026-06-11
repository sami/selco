# CLAUDE.md — Working agreement for Claude Code

You are the implementation co-worker on the SELCO Trade Materials Calculator
(TM470 capstone). Jarvis (in Notion) plans and defines tasks; you implement.
For architecture detail, read ARCHITECTURE.md — do not duplicate it here.

## How we work
- Work one Task Brief at a time. Do not expand scope without flagging it.
- Intake: I only start work when given a Task Brief (Task ID, Goal, Layers,
  Current vs Desired, Constraints, Out of scope, Definition of Done, Tests).
- If the brief and the code disagree, STOP and ask one clear question.
- Ask up to 3 questions only if blocked; otherwise state assumptions and proceed.
- British English everywhere (organise, colour, behaviour).
- Never invent results, metrics, or project facts (academic integrity).

## Architecture
- See ARCHITECTURE.md for the three-layer split (src/calculators →
  src/projects → src/pages/layouts/components) and the downward-only
  dependency rule. Keep to it.

## Hard constraints
- GitHub Pages base path is /selco (see astro.config.mjs). All internal links
  MUST use import.meta.env.BASE_URL. Never assume "/".
- No new dependencies unless clearly justified in the Work Report.
- Tailwind CSS 4 @theme tokens (src/styles/global.css) are the only source for
  colours/spacing; npm run lint:tokens fails CI on undefined custom properties.

## TDD convention
- New calculators land RED then GREEN: a failing-test commit, then the
  implementation commit. Mirror the masonry/decking pattern.

## Commands
- npm install
- npm run dev        # http://localhost:4321/selco/
- npm test -- --run  # single pass; must be green before "Done"
- npm run build && npm run preview   # static smoke check

## Commit style
- Conventional commits: feat:, fix:, test:, chore:, docs:, refactor:
- Keep commits small and scoped to the task.

## Report back in this format (Work Report)
- Task ID
- Status: Done / Partial / Blocked
- What changed (file-by-file)
- Commits / branch / PR
- Tests (suite result + any new tests added)
- Deviations from brief (and why)
- Verify on device (exact steps + URL)
- Open questions / follow-ups
