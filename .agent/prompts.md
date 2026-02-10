# AI Prompts

Prompts for the Antigravity coding agent. Copy and paste one at a time.

---

## Prompt 1 — Design System & Layout Foundation

> Redesign the BaseLayout and global styles for SELCO Calculator — a web-based trade materials calculator app. The current design is too generic and template-like. Create a friendly, approachable, and warm design that feels like a helpful tool rather than a corporate marketing site.
>
> **Brand colours:** Blue `#003087`, Yellow `#FFD100`. Use these as anchors but soften the overall palette — add warm greys, soft blue tints for backgrounds, and use yellow sparingly for CTAs and highlights only. The page background should NOT be plain white — use a very subtle warm grey or light blue-grey.
>
> **Design language:**
> - Rounded corners (12–16px on cards, 8px on buttons and inputs)
> - Soft, layered shadows (not harsh drop-shadows)
> - Generous whitespace and padding — the UI should breathe
> - Friendly, readable typography — system sans-serif stack, with clear size hierarchy (not oversized hero text)
> - Icons from Lucide (`https://lucide.dev/`) — use them consistently for navigation, calculator categories, and UI affordances. No emojis anywhere.
>
> **Sticky header:**
> - White or very light background with a subtle bottom border (not solid blue)
> - SELCO logo/wordmark in brand blue on the left
> - Navigation links: Home, Calculators, My Projects — in a clean horizontal row
> - Active page indicator: a subtle pill-shaped highlight or underline in brand yellow
> - Mobile: hamburger menu icon (Lucide `Menu`) that opens a slide-down panel
> - The header should feel lightweight, not heavy
>
> **Footer:**
> - Minimal — disclaimer text, feedback link, copyright
> - Light background, small text, not visually heavy
>
> **Overall feel:** Think of apps like Notion, Linear, or Raycast — clean, functional, friendly, with personality in the details. Not a landing page template. This is a tool people use, not a brochure.
>
> Use Tailwind CSS utility classes. Use Lucide icons via inline SVG or the `lucide` npm package. Keep the existing Astro + React architecture — this is styling only.

---

## Prompt 2 — Home Page

> Redesign the home page for SELCO Calculator. The current page has a generic hero section, a cliché "how it works" 1-2-3 section, a card grid, and a marketing banner. Replace all of it.
>
> **Page structure (top to bottom):**
>
> 1. **Welcome section** (not a "hero") — short, warm heading like "What are you working on today?" with a brief subtitle. No giant text. Keep it conversational. Below the text, show a search/filter input (placeholder: "Search calculators...") with a subtle border and a Lucide `Search` icon. This lets users jump straight to what they need.
>
> 2. **Calculator quick-access grid** — the main feature of the page. Show all available calculators in a 2-column (mobile) / 3-column (desktop) grid of cards. Each card has:
>    - A Lucide icon (e.g. `Grid3x3` for tiles, `Droplets` for adhesive, `Sparkles` for grout, `Ruler` for spacers, `ArrowLeftRight` for conversions)
>    - Calculator name (bold)
>    - One-line description
>    - Subtle hover effect (lift + border colour change to brand blue)
>    - Cards should feel clickable and inviting — rounded, with soft shadow
>
> 3. **Tiling project spotlight** — a single, friendly callout card (not a full-width marketing banner). Use a warm gradient or soft brand blue background. Lucide `Layers` icon. Heading: "Planning a tiling project?" Description: "Calculate tiles, adhesive, grout, and spacers in one go." CTA button in brand yellow. Keep it compact — not a billboard.
>
> 4. **Recently used / Quick tip** — (optional, can be placeholder for now) a small section for "Pick up where you left off" or a helpful tip. Keeps the page feeling alive and useful.
>
> **What to avoid:**
> - No "how it works" step sections
> - No oversized hero text
> - No emoji icons
> - No "View all →" links that feel like filler
> - No full-width colour block sections
>
> Use Tailwind CSS. Use Lucide icons. Keep British English in all copy.

---

## Prompt 3 — Calculators Index Page

> Redesign the calculators listing page. Currently it's a placeholder with "coming soon." Make it a proper browsing page.
>
> **Layout:**
> - Page heading: "Calculators" with a brief subtitle like "Estimate materials for your next project."
> - Below the heading: a filter/search bar (same style as home page) — lets users type to filter calculators.
> - Calculator grid: same card style as home page but slightly larger cards with more description. Each card shows:
>   - Lucide icon
>   - Calculator name
>   - 2-line description of what it calculates
>   - A subtle tag/badge showing category (e.g. "Tiling", "General")
> - Group calculators by category if there are enough (e.g. "Tiling" group contains Tiles, Adhesive, Grout, Spacers; "General" contains Conversions)
>
> **Calculators to list:**
> - Conversions (Lucide `ArrowLeftRight`) — Convert between metric and imperial measurements
> - Tiles (Lucide `Grid3x3`) — Calculate how many tiles you need for walls and floors
> - Adhesive (Lucide `Droplets`) — Estimate adhesive coverage and bags required
> - Grout (Lucide `Sparkles`) — Work out how much grout you need
> - Spacers (Lucide `Ruler`) — Calculate the number of spacers for your tiling job
>
> Use Tailwind CSS. Lucide icons. British English.

---

## Prompt 4 — Calculator Page Template

> Design a reusable calculator page layout. This is the page users will spend the most time on — it must be clear, easy to use, and not overwhelming.
>
> **Layout (two-column on desktop, stacked on mobile):**
>
> **Left column — Input form:**
> - Page title with Lucide icon (e.g. "Tile Calculator" with `Grid3x3`)
> - Brief description of what this calculator does
> - Form fields in a clean vertical stack:
>   - Each input has a visible `<label>` above it
>   - Inputs are large enough to tap easily on mobile (min 44px height)
>   - Use appropriate input types (`number`, with `step`, `min`, `max` where relevant)
>   - Group related inputs with subtle fieldset borders or section labels (e.g. "Room dimensions", "Tile size", "Options")
>   - Include unit labels inside or next to inputs (e.g. "metres", "mm", "%")
> - "Calculate" button — prominent, brand yellow background, full-width on mobile
> - Below the button: a "Reset" text link (not a button — secondary action)
>
> **Right column — Results panel:**
> - Initially shows a friendly empty state: "Enter your measurements to see results" with a Lucide `Calculator` icon
> - After calculation, shows results in a clean card:
>   - Primary result large and bold (e.g. "93 tiles needed")
>   - Secondary details below (e.g. "Coverage area: 7.2 m²", "Including 10% wastage")
>   - Each result line has a Lucide icon
> - Results card has a subtle success-tinted border (green) when populated
> - Optional: "Save to project" button below results (for future feature)
>
> **Below both columns:**
> - Disclaimer component (already exists)
>
> **Design notes:**
> - The form should NOT look like a boring government form — soft borders, good spacing, rounded inputs
> - Results should feel rewarding — the transition from empty to populated should feel like progress
> - On mobile, inputs come first, results below
>
> Use Tailwind CSS. Lucide icons. British English. This is a React component (interactive island) embedded in an Astro page.

---

## Prompt 5 — My Projects Page

> Design the "My Projects" page. This is where users will save and revisit their calculator estimates. For now, it just needs an empty state since the feature isn't built yet.
>
> **Empty state (current):**
> - Centred on the page, vertically offset (not dead centre — slightly above middle)
> - Lucide `FolderOpen` icon, large but not oversized (48px), in muted grey
> - Heading: "No saved projects yet"
> - Description: "When you save calculator results to a project, they'll appear here."
> - CTA button: "Browse calculators" — links to /calculators, brand yellow button
>
> **Future state (design for this but implement as placeholder):**
> - Project cards in a grid, each showing:
>   - Project name (user-defined)
>   - Date created
>   - List of calculators used (with Lucide icons)
>   - "Open" and "Delete" actions
>
> Use Tailwind CSS. Lucide icons. British English.

---

## Prompt 6 — Fix Header: Logo Padding & Nav Spacing

> Fix two issues in the Header component (`src/components/Header.astro`):
>
> 1. **Logo needs padding** — The logo link (the "S" icon + "SELCO Calculator" text) has no breathing room. Add `p-1.5` or `p-2` to the `<a>` wrapper so the focus ring and hover state don't sit flush against the content.
>
> 2. **Navigation links are too crowded** — The desktop nav currently uses `gap-1` between links. Increase to `gap-2` so the pill-shaped links don't feel jammed together. The overall header should feel spacious, not packed.
>
> Only touch the Header component. Don't change anything else.
