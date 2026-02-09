---
name: Tailwind CSS Usage
description: Best practices for using Tailwind CSS.
---

# Tailwind CSS Skills

## Core Principles
1.  **Utility-First**: Use utility classes directly in `className`.
2.  **Avoid `@apply`**: Only use `@apply` for extracting components when absolutely necessary and repetitive.
3.  **Config First**: Use `tailwind.config.mjs` for theme customization (colors, fonts, spacing).
4.  **Responsive Design**: Mobile-first approach. `class="w-full md:w-1/2"`.

## Sorting
- Follow a consistent order (e.g., layout -> spacing -> sizing -> typography -> visual -> interactive).
- Consider using a linter plugin for class sorting.

## Dark Mode
- Use the `dark:` variant for dark mode styles.
- Configure `darkMode: 'class'` in `tailwind.config.mjs` to toggle via a root class.
