import { describe, it, expect } from 'vitest';
import { projectRegistry } from '../projects/registry';

describe('Project Registry', () => {
  it('every entry has a title, blurb, and route', () => {
    expect(projectRegistry.length).toBeGreaterThan(0);
    
    projectRegistry.forEach((entry) => {
      expect(entry.id).toBeDefined();
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);

      expect(entry.title).toBeDefined();
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);

      expect(entry.blurb).toBeDefined();
      expect(typeof entry.blurb).toBe('string');
      expect(entry.blurb.length).toBeGreaterThan(0);
      expect(entry.blurb.length).toBeLessThanOrEqual(80); // 60-80 chars requested

      expect(entry.route).toBeDefined();
      expect(typeof entry.route).toBe('string');
      expect(entry.route.startsWith('/')).toBe(true);
      
      expect(['Handy Calculators', 'Project Calculators']).toContain(entry.category);
    });
  });
});
