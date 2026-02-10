---
name: tailwind-css
description: Styling components with Tailwind CSS v4, using the project design tokens and utility classes.
---

# Tailwind CSS

## Version

This project uses **Tailwind CSS v4** with the Vite plugin (`@tailwindcss/vite`). Configuration is CSS-first, NOT via `tailwind.config.mjs`.

## Theme Configuration

All design tokens are defined in `src/styles/global.css` using the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  --color-brand-blue: #003087;
  --color-brand-yellow: #FFD100;
  --color-primary: var(--color-brand-blue);
  --color-primary-foreground: #ffffff;
  --color-accent: var(--color-brand-yellow);
  --color-accent-foreground: #003087;
  --color-surface: #ffffff;
  --color-surface-foreground: #1f2937;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-destructive: #dc2626;
  --color-destructive-foreground: #ffffff;
  --color-success: #16a34a;
  --color-success-foreground: #ffffff;
}
```

## Design Token Usage

| Token | Utility Class | Use For |
|-------|--------------|---------|
| `brand-blue` | `bg-brand-blue`, `text-brand-blue` | Header, primary headings |
| `brand-yellow` | `bg-brand-yellow`, `text-brand-yellow` | CTAs, accent highlights |
| `primary` | `bg-primary`, `text-primary` | Primary UI elements |
| `accent` | `bg-accent`, `text-accent` | Secondary actions, highlights |
| `surface` | `bg-surface`, `text-surface-foreground` | Card backgrounds, main content |
| `muted` | `bg-muted`, `text-muted-foreground` | Subtle backgrounds, secondary text |
| `destructive` | `bg-destructive` | Error states |
| `success` | `bg-success` | Success states, valid results |

## Custom Utilities

```css
@utility focus-ring {
  outline: none;
  @apply ring-2 ring-offset-2 ring-primary;
}
```

Use `focus-ring` on all focusable interactive elements for consistent focus styling.

## Rules

- **Utility-first**: Apply classes directly in `className` / `class`.
- **No `@apply` in components**: Use utility classes. Reserve `@apply` for `global.css` custom utilities only.
- **Responsive**: Mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.
- **No dark mode**: The project does not use dark mode.
- **No `tailwind.config.mjs` for new tokens**: Add all new tokens to `global.css` `@theme` block.

## Class Order Convention

Follow this order for readability:
1. Layout (`flex`, `grid`, `block`)
2. Positioning (`relative`, `absolute`, `z-*`)
3. Spacing (`p-*`, `m-*`, `gap-*`)
4. Sizing (`w-*`, `h-*`, `max-w-*`)
5. Typography (`text-*`, `font-*`)
6. Visual (`bg-*`, `border-*`, `rounded-*`, `shadow-*`)
7. Interactive (`hover:*`, `focus:*`, `transition-*`)
