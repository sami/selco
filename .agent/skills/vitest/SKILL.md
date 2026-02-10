---
name: vitest-testing
description: Writing and running unit tests and component tests with Vitest and Testing Library.
---

# Vitest Testing

## Setup

- **Config**: `vitest.config.ts` uses Astro's `getViteConfig` wrapper.
- **Environment**: jsdom.
- **Globals**: `true` — `describe`, `it`, `expect`, `vi` are available without imports.
- **Matchers**: `@testing-library/jest-dom` is loaded via `src/test/setup.ts`.
- **Cleanup**: `@testing-library/react` cleanup runs after each test automatically.

## TDD Workflow (Mandatory)

1. **Red**: Write a failing test that describes the expected behaviour.
2. **Green**: Write the minimum code to make it pass.
3. **Refactor**: Clean up while keeping tests green.

## File Placement

Tests live **next to the code they test**:

```
src/calculators/tiles.ts
src/calculators/tiles.test.ts
src/components/calculators/TileCalculator.tsx
src/components/calculators/TileCalculator.test.tsx
```

## Calculator Logic Tests (Pure Functions)

```typescript
describe('calculateTiles', () => {
  it('calculates correct tile count for a simple area', () => {
    const result = calculateTiles({
      areaWidth: 3,
      areaHeight: 2.4,
      tileWidth: 300,
      tileHeight: 300,
      gapSize: 3,
      wastage: 10,
    });

    expect(result.tilesNeeded).toBe(/* expected value */);
  });

  it('includes wastage in the calculation', () => {
    // ...
  });

  it('handles zero dimensions', () => {
    // ...
  });
});
```

## React Component Tests

Use `@testing-library/react` — test user behaviour, not implementation.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TileCalculator from './TileCalculator';

describe('TileCalculator', () => {
  it('renders the input form', () => {
    render(<TileCalculator />);
    expect(screen.getByLabelText(/area width/i)).toBeInTheDocument();
  });

  it('displays results after calculation', async () => {
    const user = userEvent.setup();
    render(<TileCalculator />);

    await user.type(screen.getByLabelText(/area width/i), '3');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/tiles needed/i)).toBeInTheDocument();
  });
});
```

## Rules

- **No snapshot tests** unless explicitly requested.
- **Test behaviour, not implementation.** Don't test internal state.
- **Use `screen` queries** — prefer `getByRole`, `getByLabelText`, `getByText` (in that order).
- **No mocking calculator functions** in component tests — test the integration.
- **Mock only external dependencies** (APIs, browser APIs, etc.).

## Running Tests

```bash
npm test              # Run all tests
npx vitest run        # Run once (CI mode)
npx vitest --watch    # Watch mode
npx vitest tiles      # Run tests matching "tiles"
```

> **Note**: `package.json` does not have a `test` script yet. Add `"test": "vitest"` when implementing the first test.
