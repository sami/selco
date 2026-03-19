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
import { join, extname, relative } from 'path';
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
  for (const match of content.matchAll(/-\[(--[\w-]+)\]/g)) {
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

/**
 * For .astro files, return only the contents of <style> blocks to avoid
 * false-positive definitions from HTML prose (e.g. <code>--token: value</code>).
 * For all other file types, return the full content unchanged.
 *
 * @param {string} content
 * @param {string} ext  e.g. '.astro', '.css', '.tsx'
 * @returns {string}
 */
export function getDefinitionContent(content, ext) {
  if (ext !== '.astro') return content;
  const blocks = [];
  for (const match of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    blocks.push(match[1]);
  }
  return blocks.join('\n');
}

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
    const defContent = getDefinitionContent(content, extname(file));
    for (const def of extractDefinitions(defContent)) {
      allDefinitions.add(def);
    }
    const relPath = relative(cwd, file);
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
