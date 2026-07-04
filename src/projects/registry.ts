export interface ProjectCalculator {
  id: string;
  title: string;
  blurb: string;
  route: string;
  category: 'Handy Calculators' | 'Project Calculators';
}

export const projectRegistry: ProjectCalculator[] = [
  {
    id: 'masonry-wall',
    title: 'Masonry Wall',
    blurb: 'Calculate bricks, blocks, mortar, and wall ties for your wall build.',
    route: '/projects/masonry-wall',
    category: 'Project Calculators',
  },
  {
    id: 'hard-flooring',
    title: 'Hard Flooring',
    blurb: 'Estimate laminate, LVT, or engineered wood and underlay requirements.',
    route: '/projects/hard-flooring',
    category: 'Project Calculators',
  },
];
