# SELCO Calculator — Project Rules

> These rules apply to every interaction. No exceptions.

## Project Context

This is **SELCO Calculator** — a static web app for estimating trade building materials (tiles, adhesive, grout, spacers, conversions). It runs on **Astro 5 + React 19 + Tailwind CSS 4** and deploys to GitHub Pages at `https://sami.github.io/selco`.

All calculator logic is pure TypeScript (no React). React is only used for interactive UI islands. Astro handles routing and static content.

## References

@.agent/rules/architecture.md
@.agent/rules/coding-standards.md

## Core Directives

### 1. Code Quality
- **Language**: British English spelling (e.g. `colour`, `optimise`, `behaviour`) in all code, comments, and copy.
- **Type Safety**: Strict TypeScript everywhere. No `any`. No type assertions unless unavoidable.
- **Testing**: TDD mandatory. Write failing tests first, then implement. Tests live next to the code they test.
- **Styling**: Tailwind CSS only. No inline styles. No CSS modules.
- **Framework**: Astro for pages/layouts/static content. React for interactive components only.

### 2. Architecture
- **Islands Architecture**: Astro renders static shells. React hydrates interactive islands via `client:load` or `client:visible`.
- **Separation of concerns**: Calculator logic in `src/calculators/` (pure TS, no React imports). UI components in `src/components/`.
- **Base URL**: All internal links MUST use `import.meta.env.BASE_URL` (resolves to `/selco`). Hardcoded paths will break on GitHub Pages.
- **Shared components**: Header (`src/components/Header.astro`), Footer (`src/components/Footer.astro`), and BaseLayout (`src/layouts/BaseLayout.astro`) are shared across ALL pages. NEVER duplicate or inline their content in page files. Edit the component, not the page.

### 3. Git Workflow
- Conventional Commits (e.g. `feat:`, `fix:`, `test:`, `chore:`).
- Feature branches off `main`.
- Keep commits atomic — one logical change per commit.

### 4. Accessibility
- Semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<button>`, etc.).
- All interactive elements must be keyboard accessible.
- Use `aria-label` or `aria-labelledby` where visible text is insufficient.
- Form inputs must have associated `<label>` elements.
- Use the `focus-ring` utility class for custom focus styles.
