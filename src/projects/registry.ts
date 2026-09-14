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
    blurb: "Estimate bricks or blocks, cement, sand and wall ties for a customer's wall.",
    route: '/projects/masonry-wall',
    category: 'Project Calculators',
  },
  {
    id: 'hard-flooring',
    title: 'Hard Flooring',
    blurb: "Estimate flooring, underlay and edge trims for a customer's room.",
    route: '/projects/hard-flooring',
    category: 'Project Calculators',
  },
];
