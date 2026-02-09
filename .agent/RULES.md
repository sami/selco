# Project Rules

> **Apply this single file to every prompt.**

## Imports
@.agent/skills/frontend/react.md
@.agent/skills/frontend/astro.md
@.agent/skills/frontend/tailwind.md
@.agent/skills/testing/vitest.md
@.agent/rules/coding-standards.md
@.agent/workflows/deploy-gh-pages.md

## Core Directives

### 1. Code Quality
- **Language**: British English spelling (e.g. `colour`, `optimise`) in code and documentation.
- **Type Safety**: strict TypeScript everywhere.
- **Testing**: Test-Driven Development (TDD) mandatory. Red -> Green -> Refactor.
- **Styling**: Tailwind CSS for all styling.
- **Framework**: Astro + React.

### 2. Architecture
- **Islands Architecture**: Use Astro for static content, React for interactive islands.
- **Component Structure**: `src/components`, `src/layouts`, `src/pages`.

### 3. Git Workflow
- Conventional Commits.
- Feature branches.

