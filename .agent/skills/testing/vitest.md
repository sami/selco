---
name: Vitest Testing
description: Best practices for testing with Vitest.
---

# Vitest Skills

## TDD Workflow (Mandatory)
1.  **Red**: Write a failing test for the next bit of functionality.
2.  **Green**: Write just enough code to pass the test.
3.  **Refactor**: Clean up the code while keeping tests passing.

## Core Principles
1.  **Unit Tests**: Test logic in isolation.
2.  **Component Tests**: Test components using `@testing-library/react`.
3.  **Mocking**: Use `vi.mock()` for external dependencies.
4.  **Snapshots**: Use snapshots sparingly for UI structure stability.

## File Naming
- Tests should be next to the file they test or in a `__tests__` directory.
- Format: `[filename].test.ts` or `[filename].test.tsx`.

## Example
```ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent label="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```
