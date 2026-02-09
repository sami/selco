# Coding Standards

## General
- **Language**: British English spelling (e.g. `colour`, `behaviour`, `optimise`) is MANDATORY for all variable names, comments, and documentation.
- **Indentation**: 2 spaces.
- **Line Length**: 80-100 characters.
- **Quotes**: Single quotes for string literals (unless avoiding escaping).
- **Semicolons**: Always use semicolons.

## Naming Conventions
- **Files**:
    - Components: `PascalCase.tsx`
    - Hooks: `useCamelCase.ts`
    - Utilities: `camelCase.ts` or `kebab-case.ts`
- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## Comments
- Use JSDoc/TSDoc for public functions and components.
- Explain *why* complex logic exists, not just *what* it does.

## Error Handling
- Use `try...catch` blocks for async operations.
- Return unified result types (e.g. `Result<T, E>`) for complex logic if possible, or throw Typed Errors.
