---
name: react-development
description: Building React interactive island components for calculators, forms, and dynamic UI within Astro pages.
---

# React Development

## Role in This Project

React is used **only for interactive islands** — calculator forms, dynamic UI, and anything that needs client-side state. All static content is rendered by Astro.

## Component Pattern

```tsx
interface TileCalculatorProps {
  baseUrl?: string;
}

export default function TileCalculator({ baseUrl = '' }: TileCalculatorProps) {
  // component logic
  return (/* JSX */);
}
```

**Do NOT use `FC` type.** Use regular function declarations with typed props.

## Rules

- **Functional components only.** No class components.
- **Export as default** from calculator component files (required for Astro island imports).
- **No business logic in components.** Import calculator functions from `src/calculators/`. Components handle state and UI only.
- **Use controlled form inputs** with `useState` for calculator forms.

## State Management

- **Local state**: `useState` for component-scoped state (form inputs, results).
- **Cross-island state**: Use [Nanostores](https://github.com/nanostores/nanostores) if multiple islands need shared state. Nanostores works with both Astro and React.
- **Do NOT use Zustand, Redux, or Context** — Nanostores is the standard for Astro multi-framework islands.

## Calculator Component Structure

```tsx
import { useState } from 'react';
import { calculateTiles } from '../../calculators/tiles';
import type { TileInput, TileResult } from '../../calculators/tiles';

export default function TileCalculator() {
  const [input, setInput] = useState<TileInput>(defaultInput);
  const [result, setResult] = useState<TileResult | null>(null);

  const handleCalculate = () => {
    setResult(calculateTiles(input));
  };

  return (
    <div>
      {/* Input form */}
      {/* Calculate button */}
      {/* Results display (conditional on result !== null) */}
    </div>
  );
}
```

## Performance

- Use `useMemo` for expensive derived calculations.
- Use `useCallback` only when passing callbacks to memoised children.
- Do NOT premature-optimise — profile first.
