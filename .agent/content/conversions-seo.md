# Conversions Page SEO Content

Use this content **verbatim** when building `src/pages/calculators/conversions/index.astro`.

---

## SEO Head (frontmatter -> BaseLayout props)

- `<title>`: Unit Conversion Calculator | Metric and Imperial Conversions | SELCO Calculator
- `<meta name="description">`: Free unit conversion calculator for tradespeople. Convert between metres, feet, inches, square metres, cubic metres, litres, kg and more. Fast and accurate results.
- Canonical URL: `https://sami.github.io/selco/calculators/conversions/`
- Open Graph and Twitter card tags mirroring title and description
- Add `FAQPage` JSON-LD structured data using the FAQ section below

## H1

"Unit Conversion Calculator: Convert Between Metric and Imperial Units"

## Intro (p)

"Convert lengths, areas, volumes, weights and temperatures in seconds. Enter a value, select your units, and get an instant result. Built for trade professionals who need quick, reliable conversions on site or in branch."

## Disclaimer callout (yellow)

"All conversions use standard conversion factors. For material-specific density conversions (e.g. concrete volume to weight), results are based on typical densities. Always confirm with the manufacturer for exact product specifications."

## Guidance Section -- H2: "Why Conversions Matter in Building"

Three paragraphs:

1. "Building products are sold in different units depending on the supplier, country of origin and material type. Timber is quoted in metres. Plumbing fittings are listed in inches. Concrete is ordered by the cubic metre but weighed in tonnes. If you mix up your units, you order the wrong quantity."
2. "The most common mistakes on site involve confusing square metres (m²) with cubic metres (m³), or mixing metric and imperial measurements on the same job. A room that is 12 m² in floor area is not 12 m³ in volume -- that would require multiplying by the height as well."
3. "This calculator removes the guesswork. Select a category, type in your value, and get an accurate conversion instantly. No mental arithmetic, no rounding errors."

## How to Use -- H2: "How to Use This Calculator"

Three steps:

1. **Choose a Category** -- "Select the type of unit you need to convert: Length, Area, Volume, Weight, Temperature or Density."
2. **Enter Your Value** -- "Type the number you want to convert. The calculator accepts whole numbers and decimals."
3. **Select Your Units** -- "Choose the unit you are converting from and the unit you are converting to. The result updates instantly."

## [React Island: ConversionCalculator with client:load]

## Reference Tables -- H2: "Conversion Reference Tables"

Render 6 small reference tables (one per category) with From / To / Factor columns:

- **Length:** m<->ft (3.281 / 0.3048), in<->mm (25.4 / 0.03937), m<->yd (1.0936 / 0.9144)
- **Area:** m²<->ft² (10.764 / 0.0929), m²<->yd² (1.196 / 0.8361)
- **Volume:** m³<->litres (1000 / 0.001), m³<->ft³ (35.315 / 0.02832), UK gallons<->litres (4.546 / 0.22)
- **Weight:** kg<->lb (2.205 / 0.4536), tonnes<->kg (1000), oz<->g (28.35)
- **Temperature:** C->F formula: (C x 9/5) + 32, F->C formula: (F - 32) x 5/9
- **Density:** Concrete 2.4 t/m³, Hardcore/MOT Type 1 2.1 t/m³, Sand 1.6 t/m³, Gravel 1.8 t/m³, Ballast 1.8 t/m³

## Quick Reference -- H2: "Common Trade Conversions"

Table with two columns (Need to know / Answer):

| Need to know | Answer |
| --- | --- |
| How many feet in a metre? | 3.281 feet |
| How many mm in an inch? | 25.4 mm |
| How many square feet in a square metre? | 10.764 sq ft |
| How many litres in a cubic metre? | 1,000 litres |
| How many litres in a UK gallon? | 4.546 litres |
| How many kg in a tonne? | 1,000 kg |
| How many pounds in a kg? | 2.205 lb |

## Context Section -- H2: "When You Need These Conversions"

Four short subsections (H3):

1. **Ordering Materials** -- "Product specifications often mix metric and imperial. A timber merchant quotes in metres. A plumbing supplier lists pipe lengths in feet. Use the length converter to switch before ordering."
2. **Reading Plans and Drawings** -- "Older building plans use imperial. Newer plans use metric. The area and volume converters help you cross-reference without manual arithmetic."
3. **Checking Product Coverage** -- "Paint tins show coverage in m²/litre. Adhesive bags show kg/m². Match product labels to your measured area."
4. **Working With Concrete and Aggregates** -- "Concrete and aggregate are sold by volume (m³) or weight (tonnes). Use the density converter to move between the two."

## Related Calculators -- H2: "Related Calculators"

Link cards: Tile Quantity (`/calculators/tiles/`), Adhesive (`/calculators/adhesive/`), Grout (`/calculators/grout/`), Spacers (`/calculators/spacers/`)

## FAQ -- H2: "Frequently Asked Questions"

Render as toggle blocks. Include in `FAQPage` JSON-LD.

1. **What units does this calculator support?** -- "Length (mm, cm, m, ft, in, yd), area (m², ft², yd²), volume (m³, litres, ft³, yd³, UK gallons), weight (g, kg, tonnes, lb, oz), temperature (C, F), and density conversions for concrete, hardcore, sand, gravel and ballast."
2. **Are UK or US gallons used?** -- "UK gallons. One UK gallon equals 4.546 litres. One US gallon equals 3.785 litres."
3. **How do I convert cubic metres of concrete to tonnes?** -- "Multiply the volume in cubic metres by the density of the material. Standard mixed concrete has a density of approximately 2.4 tonnes per cubic metre. For example, 3 m³ of concrete weighs roughly 7.2 tonnes."
4. **How many square metres is a 4 m x 3 m room?** -- "Multiply length by width: 4 x 3 = 12 m². Use this figure when ordering tiles, flooring, paint or adhesive."
5. **How do I convert feet and inches to metres?** -- "Convert everything to inches first (feet x 12 + inches), then multiply by 0.0254 to get metres. Or enter your value into the length converter above."

## Sources & Further Reading -- H2: "Sources & Further Reading"

Short paragraph: "Conversion factors use standard ISO and imperial equivalents. Aggregate and concrete densities are based on typical UK bulk material weights."

Links list:

- WRAP -- Aggregate density and weight tables
- BS EN 206 -- Concrete specification (standard mixed concrete density reference)
- Jewson -- Aggregate weight calculator (practical volume-to-weight guide)

## Breadcrumbs

Home > Calculators > Unit Conversions
