# Spacers Page SEO Content

Use this content **verbatim** when building `src/pages/calculators/spacers/index.astro`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Tile Spacer Calculator | How Many Spacers Do I Need? | SELCO Calculator
- `<meta name="description">`: Free tile spacer calculator. Enter your tiling area, tile size and layout pattern to find out how many spacers you need. Covers cross and T-junction layouts with pack size estimates.
- Canonical URL: `https://sami.github.io/selco/calculators/spacers/`
- Open Graph and Twitter card tags mirroring title and description
- Add `FAQPage` JSON-LD structured data using the FAQ section below

## H1

"Tile Spacer Calculator: Work Out How Many Spacers You Need"

## Intro (p)

"Enter your tiling area, tile size and layout pattern to calculate how many tile spacers you need. The calculator estimates quantities for both cross-joint and T-junction layouts and tells you how many packs to buy."

## Disclaimer callout (yellow)

"All calculations are estimates. Spacer counts depend on layout pattern, tile size and cutting. Buy a few extra packs -- spacers are inexpensive and breakages are common."

## Guidance Section -- H2: "Tile Spacers: Which Size and How Many?"

Three subsections (H3):

1. **What Spacers Do** -- "Tile spacers sit between tiles during installation to create even, consistent joints. They ensure straight grout lines and prevent tiles from shifting before the adhesive sets. Remove them before grouting."
2. **Spacer Size Equals Joint Width** -- "The spacer size you choose determines your joint width. A 2 mm spacer creates a 2 mm joint. A 5 mm spacer creates a 5 mm joint. Match your spacer size to the look you want and the grout type you plan to use."
3. **Cross Layout vs T-Junction** -- "In a cross layout (straight grid), four spacers meet at each tile corner -- one per side. In a T-junction layout (brick bond or offset), three spacers meet at each junction because tiles are staggered. Cross layouts use roughly 4 spacers per tile. T-junction layouts use roughly 3 spacers per tile."

Spacer size guide table:

| Spacer Size | Joint Width | Best For |
| --- | --- | --- |
| 1 mm | 1 mm | Rectified porcelain, minimal joint look |
| 1.5 mm | 1.5 mm | Rectified tiles, modern aesthetic |
| 2 mm | 2 mm | Standard wall tiles, metro tiles |
| 3 mm | 3 mm | Standard floor tiles, most common size |
| 4 mm | 4 mm | Larger floor tiles, natural stone |
| 5 mm | 5 mm | Rustic tiles, handmade tiles, outdoor paving |

## H2: "How the Calculation Works"

Two paragraphs:

1. "The calculator first works out the number of tiles for your area (using tile width and height). It then multiplies the tile count by 4 for cross layouts or 3 for T-junction layouts. A 10% buffer is added for broken or lost spacers."
2. "Spacers are sold in packs of 100 or 250. The calculator rounds up to the nearest full pack so you know exactly how many to buy."

## [React Island: SpacerCalculator with client:load]

## Tips Section -- H2: "Spacer Tips"

Four subsections (H3):

1. **Buy More Than You Need** -- "Spacers are cheap. Buy at least one extra pack. They snap easily, and you will lose a few on every job."
2. **Remove Before Grouting** -- "Pull spacers out before the adhesive fully cures (within 20-30 minutes of placing each section). If left in, they create weak spots in the grout line."
3. **Use Levelling Clips for Large Tiles** -- "For tiles larger than 600 x 600 mm, consider tile levelling clips instead of standard spacers. Clips hold tiles flat and level while the adhesive sets, preventing lippage (uneven tile edges)."
4. **Keep Spacers Consistent** -- "Use the same spacer size across the entire surface. Mixing sizes creates uneven joints that are difficult to grout neatly."

## Related Calculators -- H2: "Related Calculators"

Link cards: Tile Quantity (`/calculators/tiles/`), Adhesive (`/calculators/adhesive/`), Grout (`/calculators/grout/`), Unit Conversions (`/calculators/conversions/`)

## FAQ -- H2: "Frequently Asked Questions"

Render as toggle blocks. Include in `FAQPage` JSON-LD.

1. **How many spacers do I need per tile?** -- "For a cross (grid) layout, use 4 spacers per tile. For a T-junction (brick bond or offset) layout, use 3 spacers per tile. Add 10% for breakages."
2. **What size spacers should I use for floor tiles?** -- "3 mm is the most common size for standard floor tiles. Use 5 mm for rustic or handmade tiles. Use 1-2 mm for rectified porcelain tiles where you want a minimal joint."
3. **What size spacers should I use for wall tiles?** -- "2 mm is standard for most wall tiles. Use 1-1.5 mm for rectified porcelain wall tiles. Use 3 mm for metro tiles if you want a more traditional look."
4. **Can I leave spacers in and grout over them?** -- "No. Always remove spacers before grouting. Spacers left in the joint create weak points and may show through the grout as discoloured spots."
5. **What is the difference between spacers and levelling clips?** -- "Standard spacers only control joint width. Levelling clips control both joint width and tile height, preventing lippage on large-format tiles. Use levelling clips for any tile with a dimension over 600 mm."

## Sources & Further Reading -- H2: "Sources & Further Reading"

Short paragraph: "Spacer-per-tile ratios are based on standard cross-joint and T-junction geometry."

Links list:

- TTA -- Spacer and joint width guidance (recommended joint widths by tile type)
- Tile Mountain -- Spacer size guide (practical guide with photos of each layout)
- Rubi Tools -- Tile levelling systems explained (when to use levelling clips vs standard spacers)

## Breadcrumbs

Home > Calculators > Spacers
