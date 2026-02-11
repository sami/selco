# Tiling Project Wizard — SEO Content

Use this content **verbatim** when building `src/pages/projects/tiling/index.astro` and `src/components/TilingWizard.tsx`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Tiling Calculator | Everything You Need for a Tiling Project | SELCO Calculator
- `<meta name="description">`: Free tiling project calculator. Work out how many tiles, how much adhesive, grout, and spacers you need in one go. Includes wastage, pack sizes, and a full materials list.
- Canonical URL: `https://sami.github.io/selco/projects/tiling/`
- Open Graph and Twitter card tags mirroring title and description
- Add `HowTo` JSON-LD + `FAQPage` JSON-LD structured data

---

## H1

"Everything You Need for a Tiling Project"

## Intro (opening paragraphs)

"Tiling a floor or wall involves more than just tiles. You need adhesive to bond them, grout to fill the joints, and spacers to keep them even. Getting the quantities right avoids waste and return trips."

"This wizard walks you through every material step by step — from measuring your area to a complete shopping list. Each step includes guidance on choosing the right product and how much you need."

## "What you'll calculate" summary

Numbered list previewing the 6 steps:

1. **Measure your area** — Enter your room dimensions to calculate the total coverage area.
2. **Choose your tiles** — Select a tile size and laying pattern. The calculator adds waste for cuts and breakages.
3. **Calculate adhesive** — Pick your adhesive product and application type. Coverage rates come from manufacturer data sheets.
4. **Calculate grout** — Set your joint width and tile thickness to work out grout quantity.
5. **Calculate spacers** — Choose your layout pattern to get the right number of spacers and packs.
6. **Review your materials list** — See everything you need in one place, plus suggestions for tools and accessories.

## "Before you start" checklist

Before you begin, make sure you have:

- Your room measurements (length and width in metres)
- Whether it's a floor or wall (this affects adhesive choice)
- Your substrate type (concrete, plasterboard, existing tiles, timber)
- Your chosen tile size and laying pattern
- Whether the area is dry or wet (bathrooms, showers, kitchens)

---

## Disclaimer callout (yellow)

"These calculations are estimates only. Actual quantities depend on site conditions, tile breakage, cutting accuracy and substrate type. Always confirm requirements with the manufacturer before ordering."

---

## Step 1 — Your Area

### Guidance content (H2)

**H2:** "Measuring Your Tiling Area"

Measure the length and width of your room in metres. Multiply them to get the total area in square metres (m²).

For L-shaped rooms, split the space into two rectangles, measure each one separately, and add the areas together. The same applies to rooms with alcoves or bay windows — break them down into simple shapes.

**Common mistake:** Measuring in feet and entering the numbers as metres. If your tape measure reads in feet and inches, use our unit converter to convert before entering values here.

**Tip:** Always measure the full area to the walls, not just the visible floor. Tiles need to run under bath panels, behind toilets, and into door thresholds. BS 5385-3:2015 (Code of practice for the design and installation of ceramic and mosaic floor tiling) recommends measuring the total area to be tiled including margins.

---

## Step 2 — Choose Your Tiles

### Guidance content (H2)

**H2:** "Choosing the Right Tiles"

**Floor vs wall tiles**

Floor tiles must be rated for floor use — they are thicker, denser, and slip-rated. Wall tiles are thinner and lighter. Using wall tiles on floors risks cracking under foot traffic. BS 5385-3:2015 specifies that floor tiles must meet slip resistance requirements.

**Tile sizes and layout**

Common UK sizes include 300 x 300 mm, 600 x 300 mm, 600 x 600 mm, and 900 x 450 mm. Larger tiles cover faster but need a flatter substrate and generate more waste on cuts.

**Wastage explained**

Industry standard is 10% for straight lay and 15% for diagonal or herringbone patterns (BS 5385-1:2009). Wastage accounts for cuts at edges, breakages, and future replacements. Never buy exact quantities.

**Porcelain vs ceramic**

Porcelain is denser, with porosity below 0.5% water absorption per BS EN ISO 10545-3, making it better for wet areas and outdoors. Ceramic is easier to cut, cheaper, and fine for dry interior walls.

---

## Step 3 — Adhesive

### Guidance content (H2)

**H2:** "How Much Tile Adhesive Do You Need?"

**What adhesive does:** Bonds the tile to the substrate. The right adhesive depends on tile type, substrate, and location (floor, wall, wet area, exterior).

**Choosing adhesive type:**

- **Ready-mixed** — Convenience for small wall jobs. Not suitable for floors or wet areas.
- **Flexible powder** — Standard choice for most jobs. Accommodates slight substrate movement. Required for underfloor heating.
- **Rapid-set** — Sets in 3–6 hours instead of 24. Useful when time is tight but less forgiving on positioning.
- **S1/S2 rated (deformable)** — BS EN 12004 classification. S1 adhesives accommodate substrate movement up to 2.5 mm; S2 up to 5 mm. Required for underfloor heating and timber substrates.

**Coverage rates**

Coverage varies by tile size because larger tiles need a larger trowel notch to achieve even bed thickness:

- Small tiles (up to 300 x 300): 6 mm notch — approx. 5 kg/m²
- Medium tiles (300 x 600): 8 mm notch — approx. 6 kg/m²
- Large tiles (600 x 600+): 10–12 mm notch — approx. 7–8 kg/m²

Reference: Mapei technical data sheets specify coverage per kg at different notch sizes. BAL technical guides provide similar data.

**Common mistake:** Using the wrong trowel size. BS 5385-3:2015 recommends minimum 3 mm bed thickness for floors. Insufficient adhesive causes hollow spots ("drummy tiles") that crack under load.

---

## Step 4 — Grout

### Guidance content (H2)

**H2:** "How Much Grout Do You Need?"

**What grout does:** Fills the joints between tiles, preventing water ingress and giving a finished look. Joint width affects both the amount of grout needed and the visual style.

**Joint width guidance:**

- **2 mm joints** — Minimal, modern look. Only suitable for rectified (precision-cut) tiles with perfectly straight edges.
- **3 mm joints** — Standard for most wall tiles.
- **5 mm joints** — Standard for floor tiles. Wider joints accommodate slight size variation between tiles. BS 5385-3:2015 recommends minimum 3 mm joints for floor tiles to allow for manufacturing tolerance.
- **10 mm+ joints** — Rustic or handmade tiles with irregular edges.

**Grout types:**

- **Cementitious** — Standard. Needs sealing in wet areas.
- **Epoxy** — Waterproof, stain-resistant, required for commercial kitchens and swimming pools. Harder to apply.

**Coverage formula:** Based on tile dimensions, joint width, tile thickness, and grout specific gravity (SG 1.6 industry standard). The calculator uses the standard formula: `(tile length + tile width) / (tile length x tile width) x joint width x tile thickness x SG x area`.

**Common mistake:** Grouting too soon. Adhesive must be fully cured first (24 hours for standard, 3–6 hours for rapid-set). Grouting over uncured adhesive traps moisture and weakens the bond.

---

## Step 5 — Spacers

### Guidance content (H2)

**H2:** "How Many Tile Spacers Do You Need?"

**What spacers do:** Maintain consistent joint widths between tiles during installation. Removed (or left in place with some types) before grouting.

**Layout patterns and spacer count:**

- **Grid layout (cross pattern):** 4 spacers per tile at each corner where four tiles meet.
- **Brick bond (offset/staggered):** 3 spacers per tile because the offset means each tile meets 3 neighbours on one axis.

**Spacer sizes:** Match your chosen joint width. Common sizes: 1 mm, 2 mm, 3 mm, 5 mm. Wedge spacers offer adjustment for uneven substrates.

**Tip:** Buy more than the calculated quantity. Spacers are cheap and some will break or get stuck in adhesive. A 10% buffer is sensible.

Reference: BS 5385-1:2009 specifies minimum joint widths by tile type and application, which determines the correct spacer size.

---

## Step 6 — Results Summary

### Content (H2)

**H2:** "Your Complete Tiling Materials List"

Full card grid showing each material with quantity, product size, and number of packs/bags to buy.

### "You might also need" suggestions table

| Item | Why you might need it |
| --- | --- |
| Tile cutter (manual or electric) | Manual scores for straight cuts on ceramics. Electric wet cutter for porcelain, curves, and L-cuts. |
| Spirit level | Check substrate is flat before tiling. BS 5385-3:2015 specifies max 3 mm deviation over 2 m for floors. |
| Notched trowel | Applies adhesive at consistent depth. Notch size must match tile size (see adhesive step). |
| Grout float | Rubber float pushes grout into joints at 45-degree angle. |
| Sponge and bucket | Clean excess grout within 15–20 minutes before it hardens. |
| Knee pads | Essential for floor tiling — you will be kneeling for hours. |
| Tile primer | Required on dusty, porous, or painted substrates to ensure adhesive bonds. BAL and Mapei both recommend priming plasterboard. |
| Waterproofing membrane | Tanking kit for shower enclosures, wet rooms, behind baths. Prevents water reaching the substrate. |
| Silicone sealant | Flexible seal at perimeter joints (wall-to-floor, wall-to-bath). Movement joints must not be grouted — BS 5385-1:2009. |
| Tile trim / edging strips | Finished edge where tiles meet walls, worktops, or change in flooring. Chrome, brushed steel, or PVC. |

---

## FAQ Section

5 questions with toggle blocks and `FAQPage` JSON-LD:

1. **Q:** "How much tile adhesive do I need per square metre?"
   **A:** "It depends on tile size and trowel notch depth. For small tiles (up to 300 x 300 mm) with a 6 mm notch, allow approximately 5 kg/m². For large format tiles (600 x 600 mm and above) with a 10–12 mm notch, allow 7–8 kg/m². Our calculator uses coverage rates from Selco-stocked products including Dunlop and Mapei."

2. **Q:** "What is the difference between floor tiles and wall tiles?"
   **A:** "Floor tiles are thicker, denser, and rated for foot traffic and slip resistance per BS 5385-3:2015. Wall tiles are thinner, lighter, and not designed to bear weight. Never use wall-only tiles on floors."

3. **Q:** "What size spacers should I use?"
   **A:** "Match your spacer size to the joint width you want. Use 2 mm for rectified tiles, 3 mm for standard wall tiles, 5 mm for floor tiles, and 10 mm for rustic or handmade tiles. BS 5385-1:2009 specifies minimum joint widths by tile type."

4. **Q:** "How much wastage should I allow for tiling?"
   **A:** "Allow 10% for straight layouts and up to 15% for diagonal or herringbone patterns. This covers cuts at edges, breakages during installation, and a few spares for future repairs. BS 5385-1:2009 recommends never ordering exact quantities."

5. **Q:** "Do I need to prime before tiling?"
   **A:** "Yes, in most cases. Priming ensures the adhesive bonds properly to the substrate. It is especially important on dusty, porous, or painted surfaces. Both BAL and Mapei recommend priming plasterboard before tiling."

---

## HowTo JSON-LD Steps

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Calculate Everything You Need for a Tiling Project",
  "description": "Step-by-step guide to calculating tiles, adhesive, grout, and spacers for a floor or wall tiling project.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Measure your area",
      "text": "Measure the length and width of your room in metres and multiply to get the total area in square metres."
    },
    {
      "@type": "HowToStep",
      "name": "Choose your tiles",
      "text": "Select your tile size and laying pattern. Add 10% waste for straight lay or 15% for diagonal patterns."
    },
    {
      "@type": "HowToStep",
      "name": "Calculate adhesive",
      "text": "Choose your adhesive product and application type. Coverage rates are based on manufacturer technical data sheets."
    },
    {
      "@type": "HowToStep",
      "name": "Calculate grout",
      "text": "Set your joint width and tile thickness to work out how many kilograms of grout you need."
    },
    {
      "@type": "HowToStep",
      "name": "Calculate spacers",
      "text": "Choose your layout pattern (grid or brick bond) to calculate the number of spacers and packs needed."
    },
    {
      "@type": "HowToStep",
      "name": "Review your materials list",
      "text": "See a complete summary of all materials with quantities, pack sizes, and suggestions for tools and accessories."
    }
  ]
}
```

---

## Industry Standards Referenced

- **BS 5385-1:2009** — Wall and floor tiling. Code of practice for the design and planning of internal ceramic, natural stone, and mosaic tiling in normal conditions.
- **BS 5385-3:2015** — Wall and floor tiling. Code of practice for the design and installation of ceramic and mosaic floor tiling.
- **BS EN 12004** — Adhesives for ceramic tiles. Classification and specification (C1, C2, S1, S2 ratings).
- **BS EN ISO 10545-3** — Ceramic tiles. Determination of water absorption (porcelain vs ceramic distinction).

## Sources & Further Reading

- Mapei Technical Data Sheets — Adhesive and grout coverage rates, substrate preparation guides
- BAL Technical Guides — Adhesive selection by substrate and tile type, trowel size recommendations
- British Standards Institution (BSI) — BS 5385 series for wall and floor tiling
- Tile Association (TTA) — Trade body technical guidance
