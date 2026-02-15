# Architecture

The codebase follows a **three-layer separation of concerns**:

## Layer 1 — Pure Calculation Logic

- Self-contained modules with defined inputs and outputs
- **Zero UI dependencies** — pure functions only
- Each module is independently testable
- Reusable across standalone calculator pages and wizard flows
- Example: `calculateTiles(width, height, tileWidth, tileHeight, wastage) → { tilesNeeded, boxesNeeded }`

## Layer 2 — Project Orchestration Configs

- Defines which calculators belong to each project type
- Manages the step-by-step wizard flow sequences
- Handles bundling patterns (e.g. tiling project = tiles + adhesive + grout + spacers)

## Layer 3 — Astro Page Routes

- Static pages generated at build time
- React islands hydrated only where interactivity is needed
- SEO-optimised with JSON-LD structured data (HowTo, FAQPage schemas)
- Handy calculators have standalone pages; calculation modules exist only within project flows
