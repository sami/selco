# Grout Page SEO Content

Use this content **verbatim** when building `src/pages/calculators/grout/index.astro`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Grout Calculator | How Much Grout Do I Need? | SELCO Calculator
- `<meta name="description">`: Free grout calculator for tradespeople. Enter your tiling area, tile size, joint width and tile depth to estimate how much grout you need in kg and bags. Instant results.
- Canonical URL: `https://sami.github.io/selco/calculators/grout/`
- Open Graph and Twitter card tags mirroring title and description
- Add `FAQPage` JSON-LD structured data using the FAQ section below

## H1

"Grout Calculator: Work Out How Much Grout You Need"

## Intro (p)

"Enter your tiling area, tile size, joint width and tile depth to calculate how much grout you need in kilograms and bags. The calculator uses the standard grout volume formula so you can order the right amount before starting your job."

## Disclaimer callout (yellow)

"All calculations are estimates. Actual grout usage depends on joint consistency, tile edge profile, application technique and waste. Always check the manufacturer's coverage rate on the bag before ordering."

## Guidance Section -- H2: "How Much Grout Do You Need?"

Three subsections (H3):

1. **What Grout Does** -- "Grout fills the joints between tiles. It keeps moisture, dirt and debris out of the gaps and gives the finished surface a clean, uniform look. Without grout, tiles shift over time and edges chip."
2. **How Joint Width Affects Usage** -- "Wider joints use more grout per square metre. A 2 mm joint on a 300 x 300 mm tile uses roughly 0.3 kg/m². A 5 mm joint on the same tile uses around 0.8 kg/m². Always match your spacer size to your intended joint width."
3. **Wall Grout vs Floor Grout** -- "Wall grout is typically unsanded and fine-textured, suitable for joints up to 3 mm. Floor grout is sanded for strength and suits joints from 3 mm to 15 mm. Using the wrong type leads to cracking or poor adhesion. Some products are rated for both walls and floors -- check the label."

Joint width guide table:

| Joint Width | Typical Use | Spacer Size |
| --- | --- | --- |
| 2 mm | Rectified (precision-cut) tiles, minimal joint look | 2 mm |
| 3 mm | Standard wall tiles, metro tiles | 3 mm |
| 5 mm | Standard floor tiles, natural stone | 5 mm |
| 10 mm | Handmade tiles, rustic stone, quarry tiles | 10 mm |

## H2: "The Grout Formula"

Paragraph: "Grout consumption depends on four variables: tile length, tile width, joint width and tile depth (thickness). The formula calculates the total volume of grout joints per square metre, then converts to weight using a standard grout density of 1.6 kg per litre."

Formula (render as code or equation block):

`Grout (kg/m²) = ((tile length + tile width) / (tile length x tile width)) x joint width x tile depth x 1.6`

Paragraph: "All dimensions in millimetres. The result is in kg per m². Multiply by your total tiling area to get the total grout needed. Add 10% for waste."

## [React Island: GroutCalculator with client:load]

## Tips Section -- H2: "Grouting Tips"

Four subsections (H3):

1. **Wait for the Adhesive to Set** -- "Do not grout until the adhesive has fully cured. Standard adhesive needs 12-24 hours. Rapid-set adhesive needs 3-6 hours. Grouting too early can disturb the tiles."
2. **Work in Small Sections** -- "Spread grout over 1-2 m² at a time using a grout float held at 45 degrees. Push grout firmly into the joints. Wipe off excess with a damp sponge before it dries."
3. **Clean as You Go** -- "Grout haze forms quickly. Wipe tiles with a damp sponge within 10-15 minutes of application. Once grout haze dries fully, it is much harder to remove."
4. **Seal Porous Grout** -- "Unsanded and cement-based grout is porous. Apply a grout sealer after the grout has cured (usually 24-72 hours) to protect against staining and moisture absorption, especially in wet areas."

## Related Calculators -- H2: "Related Calculators"

Link cards: Tile Quantity (`/calculators/tiles/`), Adhesive (`/calculators/adhesive/`), Spacers (`/calculators/spacers/`), Unit Conversions (`/calculators/conversions/`)

## FAQ -- H2: "Frequently Asked Questions"

Render as toggle blocks. Include in `FAQPage` JSON-LD.

1. **How much grout do I need per square metre?** -- "It depends on tile size, joint width and tile depth. For 300 x 300 mm tiles with a 3 mm joint and 8 mm depth, expect around 0.5 kg/m². For 100 x 100 mm mosaic tiles with a 2 mm joint, expect around 1.3 kg/m²."
2. **What is the difference between sanded and unsanded grout?** -- "Unsanded grout is smooth and suits joints up to 3 mm (typically wall tiles). Sanded grout contains fine aggregate for strength and suits joints from 3 mm to 15 mm (typically floor tiles). Using unsanded grout in wide joints causes cracking."
3. **How long does grout take to dry?** -- "Grout is firm enough to walk on after 24 hours. Full cure takes 48-72 hours depending on temperature and humidity. Do not expose freshly grouted joints to water for at least 24 hours."
4. **Do I need to seal grout?** -- "Yes, for cement-based grout in kitchens, bathrooms and wet areas. A grout sealer protects against staining and moisture penetration. Epoxy grout does not need sealing."
5. **Can I grout wall and floor tiles with the same product?** -- "Some grouts are rated for both walls and floors. Check the product label. Floor grout must be sanded if joints exceed 3 mm. Wall grout is typically unsanded and fine."

## Sources & Further Reading -- H2: "Sources & Further Reading"

Short paragraph: "The grout formula uses the standard joint volume method. Grout density of 1.6 kg/litre is a typical value for cement-based grout."

Links list:

- Mapei -- Keracolor grout technical data sheet (coverage rates by tile and joint size)
- BAL -- Grout selection guide (sanded vs unsanded, wall vs floor)
- TTA -- BS 5385 tiling standards summary (joint width recommendations by tile type)

## Breadcrumbs

Home > Calculators > Grout
