// scripts/lint-css-tokens.test.mjs
import { describe, it, expect } from 'vitest';
import { extractDefinitions, extractReferences, findUndefinedTokens, getDefinitionContent } from './lint-css-tokens.mjs';

// ─── extractDefinitions ───────────────────────────────────────────────────────

describe('extractDefinitions', () => {
  it('extracts definitions from @theme / :root content', () => {
    const content = `--color-brand-navy: #04204b;\n--radius-card: 0.75rem;`;
    const defs = extractDefinitions(content);
    expect(defs.has('--color-brand-navy')).toBe(true);
    expect(defs.has('--radius-card')).toBe(true);
  });

  it('does NOT treat a var() value as a definition', () => {
    // --selco-yellow is defined; --color-brand-yellow is only in the value
    const content = `:root { --selco-yellow: var(--color-brand-yellow); }`;
    const defs = extractDefinitions(content);
    expect(defs.has('--selco-yellow')).toBe(true);
    expect(defs.has('--color-brand-yellow')).toBe(false);
  });

  it('handles Tailwind v4 companion line-height tokens (double-dash in name)', () => {
    const content = `--text-base: 1rem; --text-base--line-height: 1.5rem;`;
    const defs = extractDefinitions(content);
    expect(defs.has('--text-base')).toBe(true);
    expect(defs.has('--text-base--line-height')).toBe(true);
  });
});

// ─── extractReferences ────────────────────────────────────────────────────────

describe('extractReferences', () => {
  it('extracts standard var() references', () => {
    const content = `color: var(--color-brand-navy); border-radius: var(--radius-card);`;
    const refs = extractReferences(content);
    expect(refs.has('--color-brand-navy')).toBe(true);
    expect(refs.has('--radius-card')).toBe(true);
  });

  it('extracts Tailwind v4 arbitrary CSS-variable references', () => {
    // bg-[--token], border-[--token], rounded-[--token] etc.
    const content = `className="bg-[--color-surface] border-[--color-border] rounded-[--radius-card]"`;
    const refs = extractReferences(content);
    expect(refs.has('--color-surface')).toBe(true);
    expect(refs.has('--color-border')).toBe(true);
    expect(refs.has('--radius-card')).toBe(true);
  });

  it('does NOT extract Tailwind @apply utility class names as token references', () => {
    // ring-brand-navy, bg-brand-navy etc. are utility names, not var() references
    const content = `.btn { @apply ring-2 ring-brand-navy bg-brand-navy text-white border-border-default; }`;
    const refs = extractReferences(content);
    expect(refs.size).toBe(0);
  });

  it('handles Tailwind opacity modifier syntax: [--token]/30', () => {
    const content = `className="bg-[--color-brand-blue]/5 border-[--color-success]/30"`;
    const refs = extractReferences(content);
    expect(refs.has('--color-brand-blue')).toBe(true);
    expect(refs.has('--color-success')).toBe(true);
  });
});

// ─── getDefinitionContent ─────────────────────────────────────────────────────

describe('getDefinitionContent', () => {
  it('returns full content unchanged for .css files', () => {
    const content = `--color-navy: #04204b;`;
    expect(getDefinitionContent(content, '.css')).toBe(content);
  });

  it('returns full content unchanged for .tsx files', () => {
    const content = `const x = 'var(--color-navy)';`;
    expect(getDefinitionContent(content, '.tsx')).toBe(content);
  });

  it('returns only <style> block content for .astro files', () => {
    const content = `<html><code>--fake: value</code></html>\n<style>\n--real: #fff;\n</style>`;
    const result = getDefinitionContent(content, '.astro');
    expect(result).toContain('--real: #fff;');
    expect(result).not.toContain('--fake: value');
  });

  it('returns empty string for .astro files with no <style> block', () => {
    const content = `<html><p>No styles here</p></html>`;
    expect(getDefinitionContent(content, '.astro')).toBe('');
  });

  it('concatenates content from multiple <style> blocks in a single .astro file', () => {
    const content = [
      '<style>\n--color-a: red;\n</style>',
      '<p>prose</p>',
      '<style is:global>\n--color-b: blue;\n</style>',
    ].join('\n');
    const result = getDefinitionContent(content, '.astro');
    expect(result).toContain('--color-a: red;');
    expect(result).toContain('--color-b: blue;');
  });
});

// ─── findUndefinedTokens ──────────────────────────────────────────────────────

describe('findUndefinedTokens', () => {
  it('returns empty map when all referenced tokens are defined', () => {
    const definitions = new Set(['--color-navy', '--radius-card']);
    const references = new Map([
      ['--color-navy', ['src/components/Foo.tsx']],
      ['--radius-card', ['src/styles/global.css']],
    ]);
    expect(findUndefinedTokens(definitions, references).size).toBe(0);
  });

  it('returns a map entry for each undefined token with its source files', () => {
    const definitions = new Set(['--color-navy']);
    const references = new Map([
      ['--color-navy', ['src/components/Foo.tsx']],
      ['--color-phantom', ['src/components/Bar.tsx', 'src/styles/global.css']],
    ]);
    const result = findUndefinedTokens(definitions, references);
    expect(result.size).toBe(1);
    expect(result.has('--color-phantom')).toBe(true);
    expect(result.get('--color-phantom')).toEqual([
      'src/components/Bar.tsx',
      'src/styles/global.css',
    ]);
  });

  it('flags multiple undefined tokens independently', () => {
    const definitions = new Set([]);
    const references = new Map([
      ['--undefined-a', ['src/a.tsx']],
      ['--undefined-b', ['src/b.tsx']],
    ]);
    expect(findUndefinedTokens(definitions, references).size).toBe(2);
  });
});
