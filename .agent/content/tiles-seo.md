# Tiles Page SEO Content

Use this content **verbatim** when building `src/pages/calculators/tiles/index.astro`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Tile Calculator | How Many Tiles Do I Need? | SELCO Calculator
- `<meta name="description">`: Free tile calculator for tradespeople. Enter your room dimensions and tile size to find out how many tiles you need. Includes waste allowance for straight, brick bond, diagonal and herringbone patterns.
- Canonical URL: `https://sami.github.io/selco/calculators/tiles/`
- Open Graph and Twitter card tags mirroring title and description
- Add `FAQPage` JSON-LD structured data using the FAQ section below

## H1

"Tile Calculator: Work Out How Many Tiles You Need"

## Intro (p)

"Enter your room dimensions and tile size to calculate the number of tiles you need for any floor or wall. The calculator adds a waste allowance based on your chosen lay pattern so you order enough first time."

## Disclaimer callout (yellow)

"These calculations are estimates only. Actual quantities depend on site conditions, tile breakage, cutting accuracy and substrate type. Always confirm requirements with the manufacturer before ordering."

## Guidance Section -- H2: "How to Calculate Tiles"

Three subsections (H3):

1. **Measure Your Area** -- "Measure the length and width of the surface you plan to tile, in metres. For walls, measure the height and width of each section separately. Multiply length by width to get the area in square metres. For example, a 3 m x 4 m floor is 12 m²."
2. **Choose Your Tile Size** -- "Common UK tile sizes include 300 x 300 mm (standard floor), 600 x 300 mm (rectangular floor), 200 x 100 mm (metro wall) and 600 x 600 mm (large format). Larger tiles cover more area per piece but may need more cuts around edges."
3. **Understand Waste Allowance** -- "Every tiling job produces waste from cuts, breakages and pattern alignment. Add at least 10% for a straight grid layout. Brick bond (offset) patterns need around 12%. Diagonal and herringbone layouts need 15% because of the extra angled cuts at every edge."

Waste allowance table:

| Lay Pattern | Waste Allowance | Best For |
| --- | --- | --- |
| Straight (grid) | 10% | Simple rooms, beginners |
| Brick bond (offset) | 12% | Rectangular tiles, kitchens |
| Diagonal (diamond) | 15% | Small rooms (creates sense of space) |
| Herringbone | 15% | Feature floors, hallways |

Paragraph after table: "Need adhesive, grout and spacers too? Use the full [Tiling a Bathroom project](/projects/tiling/) to estimate every material in one go."

## [React Island: TileCalculator with client:load]

## Tips Section -- H2: "Tiling Tips"

Four subsections (H3):

1. **Measure Twice, Buy Once** -- "Always double-check your room measurements before ordering. Small errors add up across large areas."
2. **Buy Extra Tiles** -- "Order 10 to 15% more tiles than the calculator suggests. Tiles from different production batches often have slight colour variations. Keeping spares from the same batch helps with future repairs."
3. **Check Your Surface** -- "Tiling onto an uneven surface causes problems. Use a spirit level and straight edge to check for dips. Fill low spots with self-levelling compound before starting."
4. **Choose the Right Adhesive** -- "Use flexible adhesive for underfloor heating or wooden subfloors. Use rapid-set adhesive when you need to grout the same day. See our [adhesive calculator](/calculators/adhesive/) for quantities."

## Related Calculators -- H2: "Related Calculators"

Link cards: Adhesive (`/calculators/adhesive/`), Grout (`/calculators/grout/`), Spacers (`/calculators/spacers/`), Unit Conversions (`/calculators/conversions/`)

## FAQ -- H2: "Frequently Asked Questions"

Render as toggle blocks. Include in `FAQPage` JSON-LD.

1. **How many tiles do I need per square metre?** -- "It depends on tile size. For 300 x 300 mm tiles, you need roughly 11 per m². For 600 x 300 mm, about 6 per m². For 600 x 600 mm, about 3 per m²."
2. **Should I add waste when ordering tiles?** -- "Yes. Always add a waste allowance. Use 10% for straight layouts and up to 15% for diagonal or herringbone patterns."
3. **What if my room is not a simple rectangle?** -- "Break the room into rectangular sections, calculate each area separately, and add them together. Enter the total area into the calculator."
4. **Do I need different tiles for walls and floors?** -- "Floor tiles must be rated for floor use -- they are thicker and more durable. Wall tiles are thinner and lighter. Check the product specification before buying."
5. **How do I account for doors and windows?** -- "Measure the area of each opening and subtract it from your total wall area. For small openings like windows, some tilers skip the deduction and use the extra tiles as spares."

## Sources & Further Reading -- H2: "Sources & Further Reading"

Short paragraph: "Waste percentages are based on industry guidance for UK tiling patterns. Tile sizes reference common UK product ranges."

Links list:

- British Ceramic Tile -- Tile size guide (standard UK tile dimensions and coverage)
- TTA / Tile Association -- Tiling best practice and BS 5385 guidance on laying patterns and waste
- Topps Tiles -- How to measure for tiles (practical guide with diagrams)

## Breadcrumbs

Home > Calculators > Tile Quantity
