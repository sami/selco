# Functional Requirements

## 4.0 Layout & Navigation

The site uses a **shared layout** inspired by http://selcobw.com. Navigation is a **secondary concern** — the layout and structure already exist.

### Secondary navigation structure

Header nav (horizontal on desktop, hamburger on mobile):

- **Home** — `/`
- **Handy Calculators** (dropdown) — utility tools
  - Unit Converter
  - *(Future: Coverage Calculator, Sheet Material Cutting Planner)*
- **Project Calculators** (dropdown) — the primary product
  - Tiling Project
  - Masonry Project
  - Concrete & Groundworks Project

### Shared layout (all pages)

- Consistent header with site name/logo and nav links (Handy Calculators, Project Calculators)
- Mobile hamburger menu; horizontal nav with dropdowns on desktop
- Consistent footer with flat list of all handy calculator and project wizard links, plus a feedback link
- Breadcrumb trail on all pages (e.g. Home → Tiling Project)
- Layout follows the existing design based on http://selcobw.com — no new design work needed

## 4.1 Homepage

The landing page at the site root acts as the **main entry point** for all project calculators and handy tools.

### Layout & structure

- Hero section: headline, short intro paragraph explaining the tool and who it's for
- **Search bar** — a simple text filter at the top of the page. Filters visible calculator and project cards by name/keyword as the user types. Client-side only (no server). Helps users find the right tool quickly as the list grows.
- **Handy Calculators section** — small utility tools (Unit Converter, etc.) displayed first
- **Project Calculators section** — prominent CTAs for each project wizard (e.g. "Start a Tiling Project"). Cards with title, one-line description, and colour-coded category label — **no decorative icons**
- Mobile-first card layout — single column on mobile, multi-column grid on tablet/desktop
- Each card links to the corresponding handy calculator or project wizard page
- Static Astro page (zero JavaScript) — no interactive components needed

### Homepage content (SEO-focused)

- **H1:** Page title (e.g. "Trade Projects Calculator — Free Building Material Estimators")
- **Intro section:** 2–3 paragraphs introducing the project calculators, who they help (tradespeople), and the value proposition (multi-material guided flows, accurate estimates)
- **Handy Calculators section (H2):** Brief overview of utility tools (Unit Converter, plus future scope items)
- **Project Calculators section (H2):** Overview of each project wizard with a short description and link
- **How it works section (H2):** 3–4 step explanation of the project wizard flow (select project → enter dimensions → get materials list)
- **FAQ section (H2):** 5–8 questions covering common queries (e.g. "How accurate are the estimates?", "What is wastage?", "Can I calculate multiple materials at once?", "Do I need to create an account?", "What units are supported?")
- Meta title, meta description, and JSON-LD structured data (WebSite, FAQPage schemas)
- Internal links to every handy calculator and project wizard page for SEO link equity

## 4.2 Handy Calculators

Small, standalone utility tools. These do not have their own project flows.

| **#** | **Calculator** | **Description** | **Priority** |
| --- | --- | --- | --- |
| 1 | Unit Converter | Convert between metric and imperial units (length, area, volume, weight). Supports metres, feet, inches, yards, stones, kg, etc. | P0 |

### Future scope handy calculators

- Coverage Calculator — generic "I have X area, the product covers Y per unit, how many units?" tool
- Sheet Material Cutting Planner — minimise waste when cutting standard sheets (e.g. 2400x1200mm plasterboard) to fit a room

Each handy calculator must:

- Accept clearly defined inputs with sensible defaults and placeholder values
- Apply validated formulas
- Return calculated quantities in clear, useful units
- Handle floating-point precision correctly (IEEE 754 rounding)
- Be covered by unit tests (90%+ coverage target)

## 4.3 Calculation Modules (Layer 1)

The pure calculation logic that powers the project wizards. These are **not standalone pages** — they are reusable modules consumed by project flows.

| **Module** | **Description** | **Used by** |
| --- | --- | --- |
| Tiling | Calculate tiles, adhesive, grout, and spacers for a given area. Accounts for tile size, gap width, wastage, and laying pattern. | Tiling Project |
| Self-Levelling Compound | Calculate SLC volume for a given area and depth. | Tiling Project |
| Masonry Wall | Calculate blocks/bricks, sand, cement, and wall ties. Support cavity and single-skin walls. | Masonry Project |
| Concrete | Calculate cement, sand, and aggregate volumes for slabs and foundations. | Concrete & Groundworks Project |
| Hardcore | Calculate sub-base quantity for a given area and depth. | Concrete & Groundworks Project |

Each calculation module must:

- Accept clearly defined inputs with sensible defaults
- Apply validated formulas referenced from manufacturer data sheets and industry standards
- Apply a configurable wastage percentage
- Return calculated quantities in clear, useful units
- Include ancillary material calculations where applicable (e.g. tiling → adhesive, grout, spacers)
- Handle floating-point precision correctly (IEEE 754 rounding)
- Be covered by unit tests (90%+ coverage target)

## 4.4 Project Calculators

The **primary product**. Multi-material, step-by-step wizards that chain related calculation modules into a single guided flow.

MVP project types (minimum 3):

1. **Tiling Project** — Tiles → Adhesive → Grout → Spacers → Self-levelling compound
2. **Masonry Project** — Blocks/Bricks → Sand → Cement → Wall ties
3. **Concrete & Groundworks Project** — Concrete → Hardcore

Project calculator requirements:

- User selects a project type, then is guided through each material step sequentially
- Each step reuses the pure calculation logic from Layer 1 (no duplication)
- Users can skip optional steps
- A summary page at the end shows all materials and quantities
- Users can go back and adjust any step without losing data
- Each project has its own dedicated page with SEO content (see Section 4.5)

## 4.5 Page Content Requirements (SEO-Focused)

Every page must include **helpful, SEO-focused content** structured with H2 headings. Content is written for humans first, optimised for search second.

### Standard content structure per handy calculator page

- **H1:** Calculator title (e.g. "Unit Converter for Builders — Metric to Imperial & Back")
- **Calculator component** — the interactive tool sits near the top of the page
- **H2: How to [Action]** — step-by-step plain-language guide
- **H2: [Calculator] Guide** — practical advice, common scenarios, tips
- **H2: Frequently Asked Questions** — 4–6 FAQs. JSON-LD FAQPage schema applied.
- Meta title, meta description, and JSON-LD structured data (HowTo, FAQPage schemas)
- Internal links to related project calculators

### Standard content structure per project calculator page

- **H1:** Project title (e.g. "Tiling Project Calculator — Estimate All Your Tiling Materials")
- **Wizard component** — the multi-step interactive flow
- **H2: What's Included in This Project Calculator** — overview of all materials covered in the wizard flow
- **H2: Step-by-Step Guide** — walkthrough of each step in the wizard with practical tips
- **H2: What You'll Need** — list of all materials involved (main + ancillary), with brief descriptions
- **H2: Frequently Asked Questions** — 4–6 FAQs specific to that project type. JSON-LD FAQPage schema applied.
- Meta title, meta description, and JSON-LD structured data (HowTo, FAQPage schemas)
- Internal links to related handy calculators and other project calculators

### Content principles

- Written in plain English with trade terminology where appropriate
- Short sentences, active voice, no jargon walls
- Every page must be genuinely helpful — not just keyword filler
- FAQs sourced from real trade experience (discovery survey themes)
- Content will be drafted in Notion and reviewed before implementation

## 5. Non-Functional Requirements

### 5.1 Mobile-First & Responsive

- Single-column layout optimised for mobile (primary use case: on-site phone use)
- Large touch targets for form inputs and buttons
- Responsive scaling to tablet and desktop
- Fast load times — target strong Core Web Vitals scores (LCP < 2.5s, CLS < 0.1)

### 5.2 Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML throughout
- High-contrast text
- Screen reader support
- Keyboard navigation for all interactive elements
- Accessibility audit to be conducted during testing phase

### 5.3 SEO

- Static HTML pages (pre-rendered at build time)
- JSON-LD structured data on calculator pages (HowTo, FAQPage schemas)
- Canonical URLs for all pages
- Meta titles and descriptions per page

### 5.4 Performance

- Zero JavaScript on non-interactive pages (Astro default)
- React hydration only on calculator components (`client:load`)
- No external API calls at runtime
- All calculations run client-side

### 5.5 Testing

- 90%+ unit test coverage for all calculation logic (Layer 1)
- Tests written alongside each module (test-driven workflow)
- CI pipeline runs full test suite on every push

### 5.6 Iconography

- **Lucide icons for functional UI only** — buttons (calculate, reset, add, submit), navigation (menu, arrows, chevrons), and form controls
- **No decorative or material-type icons** on calculator cards, headings, or category labels
- Differentiation between calculators relies on **strong typography, colour-coded category labels, and clear card titles** instead of icons

## 6. Product Data Mapping

**Deferred to future scope.** Product mapping to real SELCO stock ranges and pack sizes is not included in the current build. Calculators return raw quantities only for now.

When implemented, calculator outputs will map to real SELCO product ranges:

- Quantities rounded up to the nearest purchasable pack/bag/box size
- Product names and pack sizes sourced from SELCO stock data
- Coverage rates validated against manufacturer data sheets (Dunlop, Mapei, Dulux, Knauf, BAL)
- No real-time stock or pricing data

## 7. Out of Scope

The following are explicitly **not** included:

- Backend server or database
- User accounts or authentication
- Payment or e-commerce integration
- Real-time stock levels or pricing
- Native mobile app
- Product mapping to real SELCO stock ranges and pack sizes (future scope)
- Standalone calculator pages for individual materials (all material calculators are accessed through project flows)
- Coverage Calculator (future scope handy calculator)
- Sheet Material Cutting Planner (future scope handy calculator)
- More than 3 project wizard flows for MVP (additional flows are future work)

## 8. Deployment

- **Repository:** GitHub
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages (static site)
- **URL:** http://sami.github.io/selco
- Calculators go live incrementally as each iteration completes

## 9. Key Constraints

- **Solo developer** project (university capstone)
- Must align deliverables to TMA deadlines (see timeline below)
- TSA feedback is collected via an in-app Notion form and informs ongoing iterations
- All formulas must be validated against published industry standards and manufacturer data sheets
