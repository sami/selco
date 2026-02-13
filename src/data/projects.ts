export interface Tool {
    title: string;
    href: string;
    description: string;
    icon?: string; // Lucide icon name or similar
}

export interface Project {
    id: string; // unique slug
    title: string;
    href: string;
    description: string;
    icon?: string;
    tools: Tool[];
}

export const projects: Project[] = [
    {
        id: 'tiling',
        title: 'Tiling',
        href: 'projects/tiling/',
        description: 'Plan your tiling job from start to finish. Work out tiles, adhesive, grout and spacers.',
        tools: [
            {
                title: 'Tiles',
                href: 'calculators/tiles/',
                description: 'Calculate tile quantities for walls and floors.'
            },
            {
                title: 'Adhesive',
                href: 'calculators/adhesive/',
                description: 'Estimate adhesive coverage and bag counts.'
            },
            {
                title: 'Grout',
                href: 'calculators/grout/',
                description: 'Calculate grout based on joint width and tile size.'
            },
            {
                title: 'Spacers',
                href: 'calculators/spacers/',
                description: 'Find out how many spacers you need.'
            }
        ]
    },
    {
        id: 'masonry',
        title: 'Masonry',
        href: 'projects/masonry/',
        description: 'Work out bricks, blocks, mortar and wall ties for your walls.',
        tools: [
            {
                title: 'Brick Calculator',
                href: 'calculators/bricks/',
                description: 'Calculate bricks for single or double skin walls.'
            },
            {
                title: 'Block Calculator',
                href: 'calculators/blocks/',
                description: 'Estimate concrete blocks for walls and partitions.'
            },
            {
                title: 'Mortar Calculator',
                href: 'calculators/mortar/',
                description: 'Determine cement and sand quantities for different mixes.'
            }
        ]
    }
];

export const standaloneTools: Tool[] = [
    {
        title: 'Unit Conversions',
        href: 'calculators/conversions/',
        description: 'Convert between metric and imperial measurements.'
    }
];
