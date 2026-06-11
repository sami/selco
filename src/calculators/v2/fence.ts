/**
 * @file src/calculators/v2/fence.ts
 *
 * Garden fencing estimator — mapped to Selco's stocked range.
 *
 * Panels: lap or closeboard, 1829 mm (6 ft) wide, heights 3/4/5/6 ft.
 * Posts: incised treated timber 75 or 100 mm, or Supreme Pro slotted
 * concrete (sold as intermediate, end and corner posts — counted
 * separately, the way the yard sells them).
 * Setting: Carlton Rapid Set fence post concrete (20 kg), or Powapost
 * drive-in spikes for timber posts where digging isn't an option.
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export type PanelStyle = 'lap' | 'closeboard';
export type PostType = 'timber75' | 'timber100' | 'concrete';

export interface FenceInput {
    /** Total run in metres. */
    runM: number;
    /** Panel height in metres (0.914 / 1.22 / 1.525 / 1.829). */
    heightM: number;
    panelStyle: PanelStyle;
    postType: PostType;
    /** Timber posts only: drive-in spikes instead of digging + postmix. */
    useSpikes: boolean;
    includeGravelBoards: boolean;
    /** Number of 90° corners in the run (each needs a corner/extra post). */
    corners: number;
}

export interface FencePlan {
    panels: number;
    posts: number;
    /** Concrete runs split the count the way Selco sells them. */
    intermediatePosts: number;
    endPosts: number;
    cornerPosts: number;
    /** Post length in metres after burial allowance. */
    postLengthM: number;
    /** Bags of postmix across all posts (0 when spiked). */
    postmixBags: number;
    spikes: number;
    /** Actual fence length achievable, m. */
    builtRunM: number;
}

const PANEL_W_M = 1.83;
const BURIAL_M = 0.6;
/** Postmix per post: 20 kg bags — timber holes ~2, concrete ~3. */
const BAGS_PER_POST: Record<PostType, number> = {
    timber75: 2,
    timber100: 2,
    concrete: 3,
};

export function planFence(input: FenceInput): FencePlan {
    const panels = Math.max(1, Math.ceil(input.runM / PANEL_W_M));
    const corners = Math.round(input.corners);
    const posts = panels + 1 + corners;
    const concrete = input.postType === 'concrete';
    const spiked = input.useSpikes && !concrete;
    return {
        panels,
        posts,
        intermediatePosts: concrete ? Math.max(0, posts - 2 - corners) : 0,
        endPosts: concrete ? 2 : 0,
        cornerPosts: concrete ? corners : 0,
        postLengthM: input.heightM + (spiked ? 0 : BURIAL_M),
        postmixBags: spiked ? 0 : posts * BAGS_PER_POST[input.postType],
        spikes: spiked ? posts : 0,
        builtRunM: panels * PANEL_W_M,
    };
}

export function calculateFence(input: FenceInput): BillOfMaterials {
    const plan = planFence(input);
    const heightFt = Math.round(input.heightM / 0.3048);
    const concrete = input.postType === 'concrete';
    const spiked = plan.spikes > 0;
    const panelName =
        input.panelStyle === 'closeboard' ? 'Closeboard fence panel' : 'Lap fence panel';

    const postLines: BomLine[] = concrete
        ? [
              ...(plan.intermediatePosts > 0
                  ? [
                        {
                            id: 'posts-int',
                            name: 'Supreme Pro slotted intermediate concrete post',
                            detail: `${plan.postLengthM.toFixed(1)} m (600 mm in the ground)`,
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
                  name: `Incised fence post, treated green ${input.postType === 'timber100' ? '100 × 100' : '75 × 75'} mm`,
                  detail: spiked
                      ? `${plan.postLengthM.toFixed(1)} m — sits in the spike socket`
                      : `${plan.postLengthM.toFixed(1)} m (600 mm in the ground)`,
                  qty: plan.posts,
                  unit: 'posts',
              },
          ];

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
                  detail: '20 kg bag, sets in 5–10 minutes',
                  qty: plan.postmixBags,
                  unit: 'bags',
              },
          ];

    const lines: BomLine[] = [
        {
            id: 'panels',
            name: `${panelName}, 6 × ${heightFt} ft`,
            detail: `1829 × ${Math.round(input.heightM * 1000)} mm, dip treated`,
            qty: plan.panels,
            unit: 'panels',
        },
        ...postLines,
        ...settingLines,
    ];

    if (input.includeGravelBoards) {
        lines.push(
            concrete
                ? {
                      id: 'gravel-boards',
                      name: 'Smooth concrete gravel board, 150 × 1830 mm',
                      detail: 'slots under the panel, keeps timber off the soil',
                      qty: plan.panels,
                      unit: 'boards',
                  }
                : {
                      id: 'gravel-boards',
                      name: 'Treated timber gravel board, 150 × 22 mm',
                      detail: '6" × 1" — fix to the posts below the panel',
                      qty: plan.panels,
                      unit: 'boards',
                  },
        );
    }

    if (!concrete) {
        lines.push(
            {
                id: 'clips',
                name: 'Galvanised panel fixing clips',
                detail: '4 per panel',
                qty: units((plan.panels * 4) / 6),
                unit: 'packs of 6',
            },
            {
                id: 'caps',
                name: `Post cap, ${input.postType === 'timber100' ? '125 × 125' : '100 × 100'} mm`,
                detail: 'stops end-grain rot from the top down',
                qty: plan.posts,
                unit: 'caps',
            },
        );
    }

    return {
        facts: [
            { label: 'Run entered', value: `${input.runM.toFixed(1)} m` },
            { label: 'Panels', value: `${plan.panels} × 1.83 m ${input.panelStyle}` },
            { label: 'Posts', value: `${plan.posts} (${plan.postLengthM.toFixed(1)} m long)` },
            { label: 'Built length', value: `${plan.builtRunM.toFixed(1)} m` },
        ],
        sections: [{ title: 'Fencing', lines }],
        tools: [
            spiked
                ? 'Sledgehammer and the Powapost driving tool, plus a level to check each spike twice'
                : 'Post hole digger or auger (hire for runs over 10 posts)',
            'String line, pegs and a 1.2 m spirit level',
            'Panel clamps or a second pair of hands for fitting',
            spiked ? 'A scrap block to protect post tops while driving' : 'Wheelbarrow and bucket, postmix needs water on hand',
            'Exterior wood preserver for cut timber ends',
            'Galvanised 40 mm screws and a drill driver',
        ],
        notes: [
            spiked
                ? 'Drive-in spikes suit firm ground with no buried services or rubble. Check before committing the whole run.'
                : 'Posts set 600 mm into the ground in postmix. Check for services before digging.',
            concrete
                ? 'Concrete posts and gravel boards keep all timber clear of soil. Panels drop into the slots, so no fixings needed.'
                : 'Timber posts: fix panels with clips and cap every post.',
            plan.builtRunM > input.runM
                ? `Whole panels overshoot by ${(plan.builtRunM - input.runM).toFixed(2)} m. Cut the last panel down or adjust the final bay.`
                : 'Run divides into whole panels.',
        ],
    };
}
