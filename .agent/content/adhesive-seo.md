# Adhesive Page SEO Content

Use this content **verbatim** when building `src/pages/calculators/adhesive/index.astro`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Tile Adhesive Calculator | How Much Adhesive Do I Need? | SELCO Calculator
- `<meta name="description">`: Free tile adhesive calculator. Enter your tiling area, tile size and substrate type to estimate how many kg and bags of adhesive you need. Covers standard, flexible and rapid-set adhesives.
- Canonical URL: `https://sami.github.io/selco/calculators/adhesive/`
- Open Graph and Twitter card tags mirroring title and description
- Add `FAQPage` JSON-LD structured data using the FAQ section below

## H1

"Tile Adhesive Calculator: Work Out How Much Adhesive You Need"

## Intro (p)

"Enter your tiling area, tile size and substrate type to calculate how much tile adhesive you need in kilograms and bags. The calculator adjusts for bed thickness, tile format and substrate condition so you get an accurate estimate before ordering."

## Disclaimer callout (yellow)

"All calculations are estimates based on typical coverage rates from leading UK adhesive manufacturers. Actual usage depends on substrate flatness, trowel technique, tile type and site conditions. Always check the manufacturer's data sheet before ordering."

## Guidance Section -- H2: "Choosing the Right Tile Adhesive"

Three subsections (H3):

1. **Standard Adhesive** -- "Suitable for ceramic wall and floor tiles on even, prepared substrates. Coverage is typically 3-5 kg/m² with a 6 mm notched trowel. This is the most economical option for straightforward tiling jobs on cement render, plaster or concrete."
2. **Flexible Adhesive** -- "Required for porcelain tiles, large-format tiles (any dimension over 450 mm), underfloor heating, wooden subfloors and any substrate that may expand or contract. Flexible adhesives absorb movement without cracking. Coverage is similar to standard adhesive but costs more per bag."
3. **Rapid-Set Adhesive** -- "Sets in 3-6 hours instead of 12-24 hours. Use when you need to grout the same day or in time-critical installations. Rapid-set adhesives are available in both standard and flexible formulas. Working time is shorter, so mix smaller batches."

## H2: "How Bed Thickness Affects Adhesive Use"

Paragraph: "The amount of adhesive you need depends on the bed thickness, which is determined by your tile size and trowel notch. Larger tiles need a thicker bed to ensure full contact between the tile and substrate."

Bed thickness table:

| Tile Size (largest dimension) | Recommended Trowel | Bed Thickness | Approx. Coverage |
| --- | --- | --- | --- |
| Small (under 300 mm) | 6 mm notched | 3 mm | ~4 kg/m² |
| Medium (300-450 mm) | 8 mm notched | 6 mm | ~7 kg/m² |
| Large (over 450 mm) | 10-12 mm notched | 10 mm | ~10 kg/m² |

Paragraph: "For uneven substrates, add 20% to the estimated coverage. Back-buttering porcelain tiles (applying a thin layer to the back of the tile as well as the substrate) increases usage by roughly 50%."

## H2: "Adhesive Coverage Rates — Selco Products"

Paragraph: "The calculator uses coverage rates taken directly from the manufacturer's Technical Data Sheets (TDS) for products stocked at Selco. Select a product below to see accurate bag estimates for your job."

Product coverage table:

| Product | Size | Dry Walls (kg/m²) | Floors & Wet Areas (kg/m²) | Coverage per unit (dry / wet) |
| --- | --- | --- | --- | --- |
| Dunlop RX-3000 | 15 kg tub | 2 | 3 | 7.5 m² / 5 m² |
| Dunlop CX-24 Essential | 20 kg bag | 2 | 3.5 | 10 m² / 5.7 m² |
| Dunlop CF-03 Flexible Fast Set | 20 kg bag | 2 | 4 | 10 m² / 5 m² |
| Mapei Standard Set Plus | 20 kg bag | 2 | 4 | 10 m² / 5 m² |

Paragraph: "Rates are per square metre of coverage. Choose 'Dry Walls' for tiling onto even, prepared plaster or render. Choose 'Floors & Wet Areas' for floor tiles, bathrooms, showers and any area requiring a solid bed."

## [React Island: AdhesiveCalculator with client:load]

## Tips Section -- H2: "Adhesive Tips"

Four subsections (H3):

1. **Check Your Substrate** -- "Adhesive bonds best to clean, flat, dust-free surfaces. Prime porous substrates like plaster or concrete with an SBR primer before tiling. Use tile backer board on wooden subfloors."
2. **Mix the Right Amount** -- "Only mix what you can use within the pot life (typically 30-60 minutes for standard, 15-30 minutes for rapid-set). Adhesive that has started to set in the bucket cannot be re-mixed with water."
3. **Use Full Bed Coverage** -- "For floor tiles and any tile larger than 300 mm, aim for full bed coverage -- no voids under the tile. Voids weaken the bond and can cause cracking under load."
4. **Store Bags Properly** -- "Keep adhesive bags off the ground and in a dry area. Damp bags harden and become unusable. Check the use-by date on each bag."

## Related Calculators -- H2: "Related Calculators"

Link cards: Tile Quantity (`/calculators/tiles/`), Grout (`/calculators/grout/`), Spacers (`/calculators/spacers/`), Unit Conversions (`/calculators/conversions/`)

## FAQ -- H2: "Frequently Asked Questions"

Render as toggle blocks. Include in `FAQPage` JSON-LD.

1. **How much tile adhesive do I need per square metre?** -- "It depends on tile size and trowel notch. For small ceramic tiles with a 6 mm trowel, expect around 4 kg/m². For large porcelain tiles with a 10-12 mm trowel, expect around 10 kg/m²."
2. **What is the difference between standard and flexible adhesive?** -- "Standard adhesive is for ceramic tiles on rigid substrates. Flexible adhesive is required for porcelain, large-format tiles, underfloor heating and wooden subfloors. Flexible adhesive absorbs substrate movement without cracking."
3. **Do I need to back-butter porcelain tiles?** -- "Yes, if the tile has any dimension over 600 mm or if you are tiling onto an uneven surface. Back-buttering ensures full contact and prevents voids. It increases adhesive usage by approximately 50%."
4. **How many square metres does a 20 kg bag cover?** -- "With a 6 mm notched trowel, a 20 kg bag covers roughly 5 m². With a 10 mm trowel, coverage drops to around 2 m². Always check the manufacturer's coverage rate on the bag."
5. **Can I use wall adhesive on floors?** -- "Some adhesives are rated for both walls and floors. Check the product label. Floor adhesive must be rated for compressive loads. Using a wall-only adhesive on a floor can lead to tile cracking and debonding."

## Sources & Further Reading -- H2: "Sources & Further Reading"

Short paragraph: "Coverage rates are based on manufacturer technical data sheets from leading UK adhesive brands."

Links list:

- Mapei -- Keraflex Maxi technical data sheet (coverage rates, bed thickness, substrate guidelines)
- BAL -- Adhesive selection guide (which adhesive for which tile and substrate)
- Dunlop -- Adhesive coverage calculator (bag coverage by trowel size)

## Breadcrumbs

Home > Calculators > Adhesive
