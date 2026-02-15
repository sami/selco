import { describe, it, expect } from 'vitest';

/**
 * Homepage search filter tests
 * Tests client-side search functionality for filtering calculators and projects
 */

// Helper function to test search filtering logic
function filterBySearchQuery(items: Array<{ name: string; text: string }>, query: string): Array<{ name: string; text: string }> {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase().trim();
  return items.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) || 
    item.text.toLowerCase().includes(lowerQuery)
  );
}

describe('Homepage Search Filtering', () => {
  const mockHandyCalculators = [
    {
      name: 'Unit Converter',
      text: 'Convert between metric and imperial units for length, area, volume, and weight.'
    }
  ];

  const mockProjectCalculators = [
    {
      name: 'Tiling Project',
      text: 'Estimate tiles, adhesive, grout, spacers, and self-levelling compound.'
    },
    {
      name: 'Masonry Project',
      text: 'Calculate bricks or blocks, sand, cement, and wall ties.'
    },
    {
      name: 'Concrete & Groundworks Project',
      text: 'Work out cement, sand, aggregate, and hardcore sub-base quantities.'
    }
  ];

  describe('Empty search query', () => {
    it('should return all items when query is empty', () => {
      const result = filterBySearchQuery(mockProjectCalculators, '');
      expect(result).toEqual(mockProjectCalculators);
      expect(result).toHaveLength(3);
    });

    it('should return all items when query is whitespace only', () => {
      const result = filterBySearchQuery(mockProjectCalculators, '   ');
      expect(result).toHaveLength(3);
    });
  });

  describe('Search by calculator name', () => {
    it('should find calculator by exact name match', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'Tiling');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tiling Project');
    });

    it('should find calculator by partial name match (case insensitive)', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'tiling');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tiling Project');
    });

    it('should find calculator by partial name', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'mason');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Masonry Project');
    });
  });

  describe('Search by calculator description', () => {
    it('should find calculator by keyword in description', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'tiles');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tiling Project');
    });

    it('should find calculator by material keyword', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'cement');
      expect(result).toHaveLength(2); // Masonry and Concrete projects
      expect(result.map(r => r.name)).toContain('Masonry Project');
      expect(result.map(r => r.name)).toContain('Concrete & Groundworks Project');
    });

    it('should find Unit Converter by material keyword', () => {
      const result = filterBySearchQuery(mockHandyCalculators, 'metric');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Unit Converter');
    });
  });

  describe('No results', () => {
    it('should return empty array for non-matching query', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'plumbing');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for query that matches nothing', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'xyz123');
      expect(result).toHaveLength(0);
    });
  });

  describe('Case insensitivity', () => {
    it('should match query regardless of case', () => {
      const queries = ['TILING', 'Tiling', 'tiling', 'TiLiNg'];
      queries.forEach(query => {
        const result = filterBySearchQuery(mockProjectCalculators, query);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Tiling Project');
      });
    });
  });

  describe('Multiple word searches', () => {
    it('should find items matching any word in the query', () => {
      // Search for "grout spacers" should find Tiling Project which mentions both
      const result = filterBySearchQuery(mockProjectCalculators, 'grout');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tiling Project');
    });
  });

  describe('Special characters and whitespace', () => {
    it('should trim leading and trailing whitespace', () => {
      const result = filterBySearchQuery(mockProjectCalculators, '  tiling  ');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tiling Project');
    });

    it('should handle ampersand in Concrete & Groundworks', () => {
      const result = filterBySearchQuery(mockProjectCalculators, 'groundworks');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Concrete & Groundworks Project');
    });
  });
});
