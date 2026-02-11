export interface TilingSuggestion {
    item: string;
    description: string;
}

export const TILING_SUGGESTIONS: TilingSuggestion[] = [
    { item: 'Tile cutter (manual or electric)', description: 'Manual scores for straight cuts on ceramics. Electric wet cutter for porcelain, curves, and L-cuts.' },
    { item: 'Spirit level', description: 'Check substrate is flat before tiling. BS 5385-3:2015 specifies max 3 mm deviation over 2 m for floors.' },
    { item: 'Notched trowel', description: 'Applies adhesive at consistent depth. Notch size must match tile size (see adhesive step).' },
    { item: 'Grout float', description: 'Rubber float pushes grout into joints at 45-degree angle.' },
    { item: 'Sponge and bucket', description: 'Clean excess grout within 15–20 minutes before it hardens.' },
    { item: 'Knee pads', description: 'Essential for floor tiling — you will be kneeling for hours.' },
    { item: 'Tile primer', description: 'Required on dusty, porous, or painted substrates to ensure adhesive bonds. Dunlop and Mapei both recommend priming plasterboard.' },
    { item: 'Waterproofing membrane', description: 'Tanking kit for shower enclosures, wet rooms, behind baths. Prevents water reaching the substrate.' },
    { item: 'Silicone sealant', description: 'Flexible seal at perimeter joints (wall-to-floor, wall-to-bath). Movement joints must not be grouted — BS 5385-1:2009.' },
    { item: 'Tile trim / edging strips', description: 'Finished edge where tiles meet walls, worktops, or change in flooring. Chrome, brushed steel, or PVC.' },
];
