# CSS Token Lint Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Write a zero-configuration Node.js lint script that catches undefined CSS custom property references at build time, preventing the phantom token category of bugs from recurring (Decision T-2).

**Architecture:** A pure-ES-module script (`scripts/lint-css-tokens.mjs`) with exported pure functions (for Vitest testing) and a conditional main block (for direct execution). Tests are co-located at `scripts/lint-css-tokens.test.mjs`. The script scans all `.css`, `.tsx`, `.astro` files under `src/`, extracts definitions (`--token:`) and references (`var(--token)` and Tailwind arbitrary `[--token]`), compares the two sets, and exits 1 if any references are undefined.

**Tech Stack:** Node.js 22 built-ins (`fs`, `path`, `url`), Vitest 4, GitHub Actions

---

## Task 1: Write the failing tests

**Files:**
- Create: `scripts/lint-css-tokens.test.mjs`

**Step 1: Create the test file**

```javascript
// scripts/lint-css-tokens.test.mjs
import { describe, it, expect } from 'vitest';
import { extractDefinitions, extractReferences, findUndefinedTokens } from './lint-css-tokens.mjs';

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
```

**Step 2: Run to confirm they FAIL** (module does not exist yet)

```bash
node ./node_modules/.bin/vitest run scripts/lint-css-tokens.test.mjs
```

Expected: `Error: Cannot find module './lint-css-tokens.mjs'`

---

## Task 2: Implement the pure functions

**Files:**
- Create: `scripts/lint-css-tokens.mjs`

**Step 1: Create the script with exported pure functions only** (no main block yet)

Note: uses `String.prototype.matchAll()` — cleaner than `regex.exec()` loops and avoids `lastIndex` mutation.

```javascript
#!/usr/bin/env node
/**
 * lint-css-tokens.mjs
 *
 * CI-safe linter: reports CSS custom property references that have no
 * corresponding definition anywhere in src/. Prevents phantom tokens.
 *
 * Usage:  node scripts/lint-css-tokens.mjs
 * Exit:   0 = clean, 1 = undefined tokens found
 */

import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

// ─── Pure functions (exported for unit testing) ───────────────────────────────

/**
 * Extract all CSS custom property DEFINITIONS from a string.
 * Matches `--token-name:` in any context (@theme, :root, inline style).
 *
 * @param {string} content
 * @returns {Set<string>}  e.g. Set { '--color-brand-navy', '--radius-card' }
 */
export function extractDefinitions(content) {
  const result = new Set();
  for (const match of content.matchAll(/(--[\w-]+)\s*:/g)) {
    result.add(match[1]);
  }
  return result;
}

/**
 * Extract all CSS custom property REFERENCES from a string.
 *   var(--token-name)    — standard CSS var() references
 *   [--token-name]       — Tailwind v4 arbitrary value references
 *
 * @param {string} content
 * @returns {Set<string>}  e.g. Set { '--color-brand-navy', '--radius-input' }
 */
export function extractReferences(content) {
  const result = new Set();
  for (const match of content.matchAll(/var\(\s*(--[\w-]+)/g)) {
    result.add(match[1]);
  }
  for (const match of content.matchAll(/\[(--[\w-]+)\]/g)) {
    result.add(match[1]);
  }
  return result;
}

/**
 * Given all defined token names and all references with source-file tracking,
 * return a map of tokens that are referenced but never defined.
 *
 * @param {Set<string>}           definitions  all defined token names
 * @param {Map<string, string[]>} references   token name → file paths
 * @returns {Map<string, string[]>}            undefined tokens → file paths
 */
export function findUndefinedTokens(definitions, references) {
  const result = new Map();
  for (const [token, files] of references) {
    if (!definitions.has(token)) {
      result.set(token, files);
    }
  }
  return result;
}
```

**Step 2: Run the tests — they should now PASS**

```bash
node ./node_modules/.bin/vitest run scripts/lint-css-tokens.test.mjs
```

Expected:
```
✓ scripts/lint-css-tokens.test.mjs (10 tests) Xms
```

---

## Task 3: Add the main execution block

**Files:**
- Modify: `scripts/lint-css-tokens.mjs` (append after the pure functions)

**Step 1: Append file-scanner and CLI entrypoint to the end of the script**

```javascript
// ─── File scanning ────────────────────────────────────────────────────────────

const SCAN_EXTENSIONS = new Set(['.css', '.tsx', '.astro']);

/** Recursively collect all files with matching extensions under `dir`. */
function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (SCAN_EXTENSIONS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

// ─── Main execution (only when run as a CLI script, not during Vitest import) ─

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const srcDir = join(process.cwd(), 'src');
  const files = collectFiles(srcDir);
  const cwd = process.cwd();

  const allDefinitions = new Set();
  /** @type {Map<string, string[]>} */
  const allReferences = new Map();

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    for (const def of extractDefinitions(content)) {
      allDefinitions.add(def);
    }
    const relPath = file.replace(cwd + '/', '');
    for (const ref of extractReferences(content)) {
      if (!allReferences.has(ref)) allReferences.set(ref, []);
      allReferences.get(ref).push(relPath);
    }
  }

  const undefinedTokens = findUndefinedTokens(allDefinitions, allReferences);

  if (undefinedTokens.size === 0) {
    console.log(`✓ CSS token check passed — ${files.length} file(s) scanned, 0 undefined tokens`);
    process.exit(0);
  } else {
    console.error(`✗ CSS token check FAILED — ${undefinedTokens.size} undefined token(s):\n`);
    for (const [token, filePaths] of [...undefinedTokens.entries()].sort()) {
      console.error(`  ${token}`);
      for (const f of [...new Set(filePaths)]) {
        console.error(`    referenced in: ${f}`);
      }
    }
    process.exit(1);
  }
}
```

**Step 2: Re-run the tests to confirm the guard works**

```bash
node ./node_modules/.bin/vitest run scripts/lint-css-tokens.test.mjs
```

Expected: same 10 ✓ — the `process.argv[1] === fileURLToPath(import.meta.url)` guard prevents the file-scan block from running during Vitest imports.

---

## Task 4: Add `lint:tokens` to package.json

**Files:**
- Modify: `package.json`

**Step 1: Add the script entry to the `"scripts"` object**

Change the scripts block from:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest"
}
```

To:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest",
  "lint:tokens": "node scripts/lint-css-tokens.mjs"
}
```

---

## Task 5: Run lint against the current codebase

**Step 1: Execute directly**

```bash
node scripts/lint-css-tokens.mjs
```

Expected:
```
✓ CSS token check passed — N file(s) scanned, 0 undefined tokens
```

If any undefined tokens appear, they are genuine bugs — add definitions to `src/styles/global.css @theme` before proceeding.

**Step 2: Confirm via npm script alias**

```bash
npm run lint:tokens
```

Same expected output.

---

## Task 6: Update CI workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Add `lint` job that gates `build`**

Replace the entire file contents with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Lint CSS tokens
        run: npm run lint:tokens

  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v2
        with:
          package-manager: npm

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

The pipeline now runs: **lint → build → deploy**. A phantom token introduced in any commit will fail the lint job and block the build.

---

## Task 7: Full verification and commit

**Step 1: Run the full test suite**

```bash
node ./node_modules/.bin/vitest run
```

Expected: `312 passed (312)` — 302 existing + 10 new lint tests.

**Step 2: Production build**

```bash
node ./node_modules/.bin/astro build
```

Expected: zero errors.

**Step 3: Commit**

```bash
git add scripts/lint-css-tokens.mjs scripts/lint-css-tokens.test.mjs package.json .github/workflows/deploy.yml
git commit -m "feat(ci): add CSS token lint guard — catches undefined custom property references

Adds scripts/lint-css-tokens.mjs that scans all src/*.css/*.tsx/*.astro,
extracts var(--*) and [--*] references, compares against --*: definitions,
and exits 1 if any are undefined. Prevents phantom token regressions (T-2).

- 10 Vitest unit tests for extractDefinitions, extractReferences, findUndefinedTokens
- package.json: lint:tokens script
- GitHub Actions: lint job gates build job (lint → build → deploy)"
```

---

## Verification Summary

| Check | Command | Expected |
|---|---|---|
| Lint unit tests | `vitest run scripts/lint-css-tokens.test.mjs` | 10 tests pass |
| Full test suite | `vitest run` | 312 pass (302 + 10) |
| Lint against codebase | `npm run lint:tokens` | ✓ 0 undefined tokens |
| Build | `astro build` | 0 errors |

## Files Modified Summary

| File | Change |
|---|---|
| `scripts/lint-css-tokens.mjs` | New — lint script with exported pure functions + CLI entrypoint |
| `scripts/lint-css-tokens.test.mjs` | New — 10 Vitest unit tests |
| `package.json` | Add `lint:tokens` script |
| `.github/workflows/deploy.yml` | Add `lint` job; gate `build` on lint passing |
