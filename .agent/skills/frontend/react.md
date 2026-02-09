---
name: React Development
description: Best practices for React development in this project.
---

# React Development Skills

## Core Principles
1.  **Functional Components Only**: No class components.
2.  **Hooks**: Use built-in hooks (`useState`, `useEffect`, etc.) and custom hooks for logic reuse.
3.  **Strict Mode**: Always enabled.

## Component Structure
```tsx
import type { FC } from 'react';

interface ComponentProps {
  label: string;
}

export const Component: FC<ComponentProps> = ({ label }) => {
  return <div>{label}</div>;
};
```

## State Management
- Use `useState` for local state.
- Use libraries like Zustand or Nanostores for global state if needed (prefer Nanostores for Astro interop).

## Performance
- Memoize expensive calculations with `useMemo`.
- Memoize callbacks with `useCallback` when passing to children.
