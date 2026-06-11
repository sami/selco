/**
 * @file src/calculators/v2/fence.ts
 *
 * Garden fencing estimator, mapped to Selco's stocked range.
 *
 * Three ways to build a fence, priced the way the yard sells them:
 *   - panels: lap or closeboard panels, 1829 mm wide, heights 3 to 6 ft
 *   - featheredge: closeboard built on site from featheredge boards on
 *     arris rails (2 rails up to 4 ft, 3 rails above), posts at 3 m bays
 *   - screening: horizontal slatted battens with a 12 mm shadow gap
 *
 * Posts: incised treated timber 75 or 100 mm, or Supreme Pro slotted
 * concrete (intermediate, end and corner counted separately). Setting:
 * Carlton Rapid Set postmix, or Powapost drive-in spikes on firm ground.
 * Post lengths round up to the nearest stocked length with 600 mm in the
 * ground (750 mm recommended for 6 ft fences on exposed runs).
 *
 * Gates: closeboard gate (1750 x 915) with tee hinges and an auto latch,
 * hung off a 100 mm post.
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export type FenceStyle = 'panels' | 'featheredge' | 'screening';
export type PanelStyle = 'lap' | 'closeboard';
export type PostType = 'timber75' | 'timber100' | 'concrete';

export interface FenceInput {
    /** Total run in metres (gates take their width out of this). */
    runM: number;
    /** Fence height in metres (0.914 / 1.22 / 1.525 / 1.829). */
    heightM: number;
    style: FenceStyle;
    panelStyle: PanelStyle;
    postType: PostType;
    /** Timber posts only: drive-in spikes instead of digging + postmix. */
    useSpikes: boolean;
    includeGravelBoards: boolean;
    /** Number of 90° corners in the run (each needs a corner/extra post). */
    corners: number;
    /** Closeboard gates in the run, 915 mm each. */
    gates: number;
}

export interface FencePlan {
    style: FenceStyle;
    /** Run left for fencing after gates take their 915 mm each. */
    fenceRunM: number;
    /** Panel bays (panels mode) or post bays (featheredge/screening). */
    bays: number;
    bayWidthM: number;
    posts: number;
    intermediatePosts: number;
    endPosts: number;
    cornerPosts: number;
    /** Suggested buried depth, mm. */
    burialMm: number;
    /** Post length actually needed, m. */
    postNeedM: number;
    /** Nearest stocked post length, m. */
    postLengthM: number;
    postmixBags: number;
    spikes: number;
    /** Featheredge: rails per bay and total boards. */
    railsPerBay: number;
    arrisRails: number;
    featherboards: number;
    /** Screening: batten rows and total 3.6 m lengths. */
    battenRows: number;
    battenLengths: number;
    builtRunM: number;
}

const PANEL_W_M = 1.83;
const GATE_W_M = 0.915;
/** Stocked timber post lengths, m. */
const POST_LENGTHS_M = [1.8, 2.1, 2.4, 2.7, 3.0];
/** Featheredge: 125 mm boards lapped 25 mm = 100 mm cover. */
const FEATHER_COVER_M = 0.1;
/** Stocked featheredge board lengths, m. */
const FEATHER_LENGTHS_M = [0.9, 1.2, 1.5, 1.65, 1.8];
/** Screening battens: 38 mm face + 12 mm gap. */
const BATTEN_PITCH_M = 0.05;
const BAGS_PER_POST: Record<PostType, number> = {
    timber75: 2,
    timber100: 2,
    concrete: 3,
};

export function planFence(input: FenceInput): FencePlan {
    const gates = Math.round(input.gates);
    const corners = Math.round(input.corners);
    const fenceRunM = Math.max(PANEL_W_M, input.runM - gates * GATE_W_M);

    // Bay width: panels are fixed 1.83 m; built-on-site styles span posts
    // at up to 3 m (the arris rail length) but 1.8 m keeps it stiff.
    const bayWidthM = input.style === 'panels' ? PANEL_W_M : 1.8;
    const bays = Math.max(1, Math.ceil(fenceRunM / bayWidthM));
    // Posts: one per bay + 1, a corner each, and one extra hanging post
    // per gate (the latch side shares the fence run's post).
    const posts = bays + 1 + corners + gates;

    const concrete = input.postType === 'concrete';
    const spiked = input.useSpikes && !concrete;

    // Burial: 600 mm standard, 750 mm for 6 ft fences (more sail area).
    const burialMm = input.heightM >= 1.8 ? 750 : 600;
    const postNeedM = input.heightM + (spiked ? 0 : burialMm / 1000);
    const postLengthM =
        POST_LENGTHS_M.find((l) => l >= postNeedM - 1e-9) ?? POST_LENGTHS_M[POST_LENGTHS_M.length - 1];

    const railsPerBay = input.style === 'featheredge' ? (input.heightM >= 1.5 ? 3 : 2) : 0;
    const battenRows = input.style === 'screening' ? Math.ceil(input.heightM / BATTEN_PITCH_M) : 0;

    return {
        style: input.style,
        fenceRunM,
        bays,
        bayWidthM,
        posts,
        intermediatePosts: concrete ? Math.max(0, posts - 2 - corners) : 0,
        endPosts: concrete ? 2 : 0,
        cornerPosts: concrete ? corners : 0,
        burialMm,
        postNeedM,
        postLengthM,
        postmixBags: spiked ? 0 : posts * BAGS_PER_POST[input.postType],
        spikes: spiked ? posts : 0,
        railsPerBay,
        arrisRails: bays * railsPerBay,
        featherboards: input.style === 'featheredge' ? units((fenceRunM / FEATHER_COVER_M) * 1.05) : 0,
        battenRows,
        battenLengths: input.style === 'screening' ? units((battenRows * fenceRunM * 1.05) / 3.6) : 0,
        builtRunM: bays * bayWidthM + Math.round(input.gates) * GATE_W_M,
    };
}

export function calculateFence(input: FenceInput): BillOfMaterials {
    const plan = planFence(input);
    const heightFt = Math.round(input.heightM / 0.3048);
    const concrete = input.postType === 'concrete';
    const spiked = plan.spikes > 0;
    const gates = Math.round(input.gates);
    const postSize = input.postType === 'timber100' ? '100 × 100' : '75 × 75';

    // ----- the fence face itself, per style -----
    const faceLines: BomLine[] =
        input.style === 'panels'
            ? [
                  {
                      id: 'panels',
                      name: `${input.panelStyle === 'closeboard' ? 'Closeboard' : 'Lap'} fence panel, 6 × ${heightFt} ft`,
                      detail: `1829 × ${Math.round(input.heightM * 1000)} mm, dip treated`,
                      qty: plan.bays,
                      unit: 'panels',
                  },
              ]
            : input.style === 'featheredge'
              ? [
                    {
                        id: 'featherboards',
                        name: `Treated featheredge board, 125 mm × ${(FEATHER_LENGTHS_M.find((l) => l >= input.heightM - 0.16) ?? 1.8).toFixed(2)} m`,
                        detail: 'lapped 25 mm for 100 mm cover, plus 5% spares. A gravel board makes up the bottom 150 mm',
                        qty: plan.featherboards,
                        unit: 'boards',
                    },
                    {
                        id: 'arris-rails',
                        name: 'Treated arris rail, 75 mm × 3.0 m',
                        detail: `${plan.railsPerBay} rails per bay (${input.heightM >= 1.5 ? 'top, middle and bottom' : 'top and bottom'})`,
                        qty: plan.arrisRails,
                        unit: 'rails',
                    },
                    ...(!concrete
                        ? [
                              {
                                  id: 'rail-brackets',
                                  name: 'Powapost arris rail bracket, 225 mm',
                                  detail: 'two per rail, no morticing needed',
                                  qty: plan.arrisRails * 2,
                                  unit: 'brackets',
                              },
                          ]
                        : []),
                    {
                        id: 'feather-nails',
                        name: 'Galvanised ring shank nails, 50 mm',
                        detail: '2 per board per rail',
                        qty: units((plan.featherboards * plan.railsPerBay * 2) / 250),
                        unit: 'boxes of 250',
                    },
                ]
              : [
                    {
                        id: 'battens',
                        name: 'Treated screening batten, 38 × 19 mm × 3.6 m',
                        detail: `${plan.battenRows} rows with a 12 mm shadow gap`,
                        qty: plan.battenLengths,
                        unit: 'lengths',
                    },
                    {
                        id: 'batten-screws',
                        name: 'Exterior screws, 4 × 50 mm',
                        detail: '2 per batten at every post',
                        qty: units((plan.battenRows * (plan.bays + 1) * 2) / 200),
                        unit: 'boxes of 200',
                    },
                ];

    // ----- posts -----
    const postDetail = spiked
        ? `${plan.postLengthM.toFixed(1)} m, sits in the spike socket`
        : `${plan.postLengthM.toFixed(1)} m stocked length (${plan.burialMm} mm in the ground)`;
    const postLines: BomLine[] = concrete
        ? [
              ...(plan.intermediatePosts > 0
                  ? [
                        {
                            id: 'posts-int',
                            name: 'Supreme Pro slotted intermediate concrete post',
                            detail: postDetail,
                            qty: plan.intermediatePosts,
                            unit: 'posts',
                        },
                    ]
                  : []),
              {
                  id: 'posts-end',
                  name: 'Supreme Pro slotted concrete end post',
                  detail: 'one at each end of the run',
                  qty: plan.endPosts,
                  unit: 'posts',
              },
              ...(plan.cornerPosts > 0
                  ? [
                        {
                            id: 'posts-corner',
                            name: 'Supreme Pro slotted concrete corner post',
                            detail: 'one per 90° turn',
                            qty: plan.cornerPosts,
                            unit: 'posts',
                        },
                    ]
                  : []),
          ]
        : [
              {
                  id: 'posts',
                  name: `Incised fence post, treated green ${postSize} mm`,
                  detail: postDetail,
                  qty: plan.posts,
                  unit: 'posts',
              },
          ];

    // ----- setting -----
    const settingLines: BomLine[] = spiked
        ? [
              {
                  id: 'spikes',
                  name: `Powapost galvanised drive-in fence post spike, ${input.postType === 'timber100' ? '100' : '75'} mm`,
                  qty: plan.spikes,
                  unit: 'spikes',
              },
              {
                  id: 'driving-tool',
                  name: `Powapost fence post driving tool, ${input.postType === 'timber100' ? '100' : '75'} mm`,
                  detail: 'protects the spike socket while you drive it',
                  qty: 1,
                  unit: 'tools',
              },
          ]
        : [
              {
                  id: 'postmix',
                  name: 'Carlton Rapid Set fence post concrete',
                  detail: '20 kg bag, sets in 5 to 10 minutes',
                  qty: plan.postmixBags,
                  unit: 'bags',
              },
          ];

    // ----- gates -----
    const gateLines: BomLine[] = gates
        ? [
              {
                  id: 'gate',
                  name: 'Closeboard gate, square top, 1750 × 915 mm',
                  qty: gates,
                  unit: 'gates',
              },
              {
                  id: 'gate-hinges',
                  name: 'Heavy duty tee hinges, 450 mm (pair)',
                  detail: 'galvanised, one pair per gate',
                  qty: gates,
                  unit: 'pairs',
              },
              {
                  id: 'gate-latch',
                  name: 'Auto gate latch + pad bolt set',
                  detail: 'galvanised, fits from either side',
                  qty: gates,
                  unit: 'sets',
              },
          ]
        : [];

    // ----- extras -----
    const extraLines: BomLine[] = [];
    if (input.includeGravelBoards) {
        extraLines.push(
            concrete
                ? {
                      id: 'gravel-boards',
                      name: 'Smooth concrete gravel board, 150 × 1830 mm',
                      detail: 'slots under the panel, keeps timber off the soil',
                      qty: plan.bays,
                      unit: 'boards',
                  }
                : {
                      id: 'gravel-boards',
                      name: 'Treated timber gravel board, 150 × 22 mm',
                      detail: '6" × 1", fix with Powapost gravel board clips',
                      qty: plan.bays,
                      unit: 'boards',
                  },
        );
        if (!concrete) {
            extraLines.push({
                id: 'gb-clips',
                name: 'Powapost gravel board clip, 50 × 150 mm',
                detail: 'two per board',
                qty: plan.bays * 2,
                unit: 'clips',
            });
        }
    }
    if (!concrete) {
        if (input.style === 'panels') {
            extraLines.push({
                id: 'clips',
                name: 'Galvanised panel fixing clips',
                detail: '4 per panel',
                qty: units((plan.bays * 4) / 6),
                unit: 'packs of 6',
            });
        }
        extraLines.push({
            id: 'caps',
            name: `Post cap, ${input.postType === 'timber100' ? '125 × 125' : '100 × 100'} mm`,
            detail: 'stops end-grain rot from the top down',
            qty: plan.posts,
            unit: 'caps',
        });
    }

    const styleLabel =
        input.style === 'panels'
            ? `${plan.bays} × 1.83 m ${input.panelStyle} panels`
            : input.style === 'featheredge'
              ? `${plan.bays} bays of featheredge on rails`
              : `${plan.bays} bays of slatted screening`;

    return {
        facts: [
            { label: 'Run entered', value: `${input.runM.toFixed(1)} m${gates ? ` inc. ${gates} gate${gates > 1 ? 's' : ''}` : ''}` },
            { label: 'Build', value: styleLabel },
            {
                label: 'Posts',
                value: `${plan.posts} × ${plan.postLengthM.toFixed(1)} m`,
            },
            {
                label: 'In the ground',
                value: spiked ? 'On spikes, no digging' : `${plan.burialMm} mm deep`,
            },
        ],
        sections: [
            { title: input.style === 'panels' ? 'Panels' : input.style === 'featheredge' ? 'Boards & rails' : 'Screening', lines: faceLines },
            { title: 'Posts & setting', lines: [...postLines, ...settingLines] },
            ...(gateLines.length ? [{ title: 'Gate', lines: gateLines }] : []),
            ...(extraLines.length ? [{ title: 'Finishing', lines: extraLines }] : []),
        ],
        tools: [
            spiked
                ? 'Sledgehammer and the Powapost driving tool, check each spike for plumb twice'
                : 'Post hole digger or auger (hire for runs over 10 posts)',
            'String line, pegs and a 1.2 m spirit level',
            input.style === 'featheredge'
                ? 'A spare featheredge offcut as a lap gauge keeps the 25 mm overlap honest'
                : input.style === 'screening'
                  ? 'A 12 mm packer batten makes every shadow gap identical'
                  : 'Panel clamps or a second pair of hands for fitting',
            spiked ? 'A scrap block to protect post tops while driving' : 'Wheelbarrow and bucket, postmix needs water on hand',
            'Exterior wood preserver for every cut end',
            'Galvanised 40 mm screws and a drill driver',
        ],
        notes: [
            spiked
                ? 'Drive-in spikes suit firm ground with no buried services or rubble. Check before committing the whole run.'
                : `Posts go ${plan.burialMm} mm into the ground${input.heightM >= 1.8 ? ' (deeper than usual because a 6 ft fence catches a lot of wind)' : ''}. You need a ${plan.postNeedM.toFixed(2)} m post, so buy the ${plan.postLengthM.toFixed(1)} m stocked length. Check for services before digging.`,
            input.style === 'featheredge'
                ? 'Featheredge outlasts panels and repairs board by board. Fit boards thick edge over thin, and keep them off the soil with a gravel board.'
                : input.style === 'screening'
                  ? 'Screening battens look best with the rows dead level, set the first row with a laser and the rest follow.'
                  : concrete
                    ? 'Concrete posts and gravel boards keep all timber clear of soil. Panels drop into the slots, no fixings needed.'
                    : 'Timber posts: fix panels with clips and cap every post.',
            ...(gates
                ? ['Hang each gate off a 100 mm post on the hinge side, postmixed even if the rest of the run is on spikes.']
                : []),
            plan.builtRunM > input.runM
                ? `Whole bays overshoot by ${(plan.builtRunM - input.runM).toFixed(2)} m. Trim the last bay or adjust a gap.`
                : 'Run divides into whole bays.',
        ],
    };
}
