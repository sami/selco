# Coding Standards

## Language
- **British English** spelling is MANDATORY in all code, comments, UI copy, and documentation (e.g. `colour`, `behaviour`, `optimise`, `centre`, `metre`).

## Formatting
- **Indentation**: 2 spaces.
- **Line length**: 80–100 characters.
- **Quotes**: Single quotes (unless avoiding escaping).
- **Semicolons**: Always.
- **Trailing commas**: Always in multiline structures.

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| React components | `PascalCase.tsx` | `TileCalculator.tsx` |
| Astro components | `PascalCase.astro` | `BaseLayout.astro` |
| Hooks | `useCamelCase.ts` | `useCalculator.ts` |
| Calculator modules | `camelCase.ts` | `tiles.ts` |
| Test files | `[name].test.ts(x)` | `tiles.test.ts` |
| Types/Interfaces | `PascalCase` | `TileInput` |
| Variables/functions | `camelCase` | `calculateTiles` |
| Constants | `UPPER_SNAKE_CASE` | `DEFAULT_WASTAGE` |

## Import Order

Group imports in this order, separated by blank lines:

1. External libraries (`react`, `astro`, etc.)
2. Internal modules (`../../calculators/tiles`)
3. Types (using `import type`)

## Comments
- Explain *why*, not *what*.
- Use JSDoc/TSDoc for exported functions and components.
- Do not add comments to obvious code.

## Error Handling
- Calculator functions should validate inputs and return descriptive errors.
- Use `Result<T, E>` pattern or throw typed errors for calculator logic.
- React components should catch errors and display user-friendly messages.
