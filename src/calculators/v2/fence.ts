/**
 * @file src/calculators/v2/fence.ts
 *
 * Garden fencing estimator.
 *
 * UK fencing is sold around the 6 ft (1.83 m) panel module. Posts sit
 * between panels, so a straight run needs panels + 1 posts. Post length is
 * fence height + 600 mm in the ground; concrete posts pair with gravel
 * boards so the timber panel never touches soil.
 */

import type { BillOfMaterials, BomLine } from './types';
import { units } from './types';

export type PostType = 'timber' | 'concrete';

export interface FenceInput {
    /** Total run in metres. */
    runM: number;
    /** Panel height in metres (1.2, 1.5, 1.8 typical). */
    heightM: number;
    postType: PostType;
    includeGravelBoards: boolean;
    /** Number of 90° corners in the run (each needs an extra post). */
    corners: number;
}

export interface FencePlan {
    panels: number;
    posts: number;
    /** Post length in metres after burial allowance. */
    postLengthM: number;
    /** Bags of post-fix concrete across all posts. */
    postFixBags: number;
    /** Actual fence length achievable, m. */
    builtRunM: number;
}

const PANEL_W_M = 1.83;
const BURIAL_M = 0.6;
/** Post-fix concrete per post: timber post holes take ~1 bag, concrete ~2. */
const BAGS_PER_POST: Record<PostType, number> = { timber: 1, concrete: 2 };

export function planFence(input: FenceInput): FencePlan {
    const panels = Math.max(1, Math.ceil(input.runM / PANEL_W_M));
    const posts = panels + 1 + input.corners;
    return {
        panels,
        posts,
        postLengthM: input.heightM + BURIAL_M,
        postFixBags: posts * BAGS_PER_POST[input.postType],
        builtRunM: panels * PANEL_W_M,
    };
}

export function calculateFence(input: FenceInput): BillOfMaterials {
    const plan = planFence(input);
    const heightFt = Math.round(input.heightM / 0.3048);

    const lines: BomLine[] = [
        {
            id: 'panels',
            name: `Lap fence panel, 6 × ${heightFt} ft`,
            detail: `1.83 m × ${input.heightM.toFixed(1)} m, dip treated`,
            qty: plan.panels,
            unit: 'panels',
        },
        {
            id: 'posts',
            name:
                input.postType === 'concrete'
                    ? 'Slotted concrete post'
                    : 'UC4 treated timber post, 75 × 75 mm',
            detail: `${plan.postLengthM.toFixed(1)} m (${BURIAL_M * 1000} mm in ground)`,
            qty: plan.posts,
            unit: 'posts',
        },
        {
            id: 'postfix',
            name: 'Fast-set post-fixing concrete',
            detail: '20 kg bag — fast set',
            qty: plan.postFixBags,
            unit: 'bags',
        },
    ];

    if (input.includeGravelBoards) {
        lines.push({
            id: 'gravel-boards',
            name:
                input.postType === 'concrete'
                    ? 'Concrete gravel board'
                    : 'Timber gravel board',
            detail: '1.83 m × 150 mm',
            qty: plan.panels,
            unit: 'boards',
        });
    }

    if (input.postType === 'timber') {
        lines.push(
            {
                id: 'clips',
                name: 'Panel fixing clips',
                detail: 'pack of 6',
                qty: units((plan.panels * 4) / 6),
                unit: 'packs',
            },
            {
                id: 'caps',
                name: 'Post caps',
                qty: plan.posts,
                unit: 'caps',
            },
        );
    }

    return {
        facts: [
            { label: 'Run entered', value: `${input.runM.toFixed(1)} m` },
            { label: 'Panels', value: `${plan.panels} × 1.83 m` },
            { label: 'Posts', value: `${plan.posts} (${plan.postLengthM.toFixed(1)} m long)` },
            { label: 'Built length', value: `${plan.builtRunM.toFixed(1)} m` },
        ],
        sections: [{ title: 'Fencing', lines }],
        tools: [
            'Post hole digger or auger (hire for runs over 10 posts)',
            'String line, pegs and a 1.2 m spirit level',
            'Panel clamps or a second pair of hands for fitting',
            'Wheelbarrow and bucket — Post-fix concrete needs water on hand',
            'Exterior wood preserver for cut timber ends',
            'Galvanised 40 mm screws and drill driver',
        ],
        notes: [
            'Posts set 600 mm into the ground in post-fix concrete; check for services before digging.',
            input.postType === 'concrete'
                ? 'Concrete posts + gravel boards keep timber clear of soil — longest life, no panel fixings needed.'
                : 'Timber posts: fix panels with clips, cap every post to stop end-grain rot.',
            plan.builtRunM > input.runM
                ? `Whole panels overshoot by ${(plan.builtRunM - input.runM).toFixed(2)} m — cut the last panel down or adjust the final bay.`
                : 'Run divides into whole panels.',
        ],
    };
}
