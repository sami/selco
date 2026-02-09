---
name: Astro Development
description: Best practices for Astro development.
---

# Astro Development Skills

## Core Principles
1.  **Islands Architecture**: Hydrate only what is interactive. Use `client:*` directives judiciously (`client:load`, `client:visible`, `client:idle`).
2.  **Static First**: Default to static rendering.
3.  **File Structure**:
    - `src/pages`: Routes.
    - `src/layouts`: Page layouts.
    - `src/components`: UI components (Astro or React).

## Styling
- Use Tailwind CSS via `class` attributes.
- Scoped styles in `<style>` blocks are allowed but Tailwind is preferred.

## Data Fetching
- Fetch data in the frontmatter of `.astro` files.
- Pass data as props to React components.

```astro
---
const data = await fetch('...').then(r => r.json());
---
<MyReactComponent data={data} client:load />
```
