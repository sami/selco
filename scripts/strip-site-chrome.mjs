/**
 * Replace the merchant-branded chrome baked into the frozen concept pages
 * (top bar, logo header, category nav, info strip, promo and footer) with the
 * neutral header and footer used by src/layouts/BaseLayout.astro.
 *
 * Safe to re-run: pages that no longer carry the old chrome are skipped.
 *
 *   node scripts/strip-site-chrome.mjs
 */
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const BASE = '/selco/';

const HEADER = `<header class="tmc-header"> <div class="tmc-header-inner"> <a href="${BASE}" class="tmc-wordmark">Trade Materials Calculator</a> <a href="${BASE}" class="tmc-nav-link">All calculators</a> </div> </header> `;

const FOOTER = `<footer class="tmc-footer"> <div class="tmc-footer-inner"> <p><strong>Trade Materials Calculator</strong>: estimating tools for trade sales assistants.</p> <p>An independent project, not affiliated with or endorsed by any builders' merchant or manufacturer. Product names belong to their owners. Quantities are estimates, so check them before ordering.</p> </div> </footer>`;

const STYLE = `<style id="tmc-chrome">.tmc-header{background:#fff;border-bottom:1px solid #e2e8f0}.tmc-header-inner{max-width:1280px;margin:0 auto;padding:14px 15px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.tmc-wordmark{font-size:1.05rem;font-weight:800;color:#1f2937;text-decoration:none}.tmc-nav-link{font-size:.875rem;font-weight:600;color:#475569;text-decoration:none}.tmc-wordmark:hover,.tmc-nav-link:hover{text-decoration:underline}.tmc-footer{margin-top:40px;background:#fff;border-top:1px solid #e2e8f0;color:#64748b;font-size:.8rem;line-height:1.5}.tmc-footer-inner{max-width:1280px;margin:0 auto;padding:24px 15px}.tmc-footer-inner p{margin:0 0 6px}.tmc-footer-inner p:last-child{margin:0}.tmc-footer-inner strong{color:#1f2937}</style>`;

/** The drawer toggle for the removed mobile nav; left behind it would query missing elements. */
const MOBILE_NAV_SCRIPT = /<script type="module">const o=document\.getElementById\("mobile-menu-toggle"\).*?<\/script>/s;

function cut(html, startMarker, endMarker, { inclusiveEnd }) {
  const start = html.indexOf(startMarker);
  const endAt = html.indexOf(endMarker, start);
  if (start === -1 || endAt === -1) throw new Error(`markers not found: ${startMarker} … ${endMarker}`);
  const end = inclusiveEnd ? endAt + endMarker.length : endAt;
  return [html.slice(0, start), html.slice(end)];
}

const pages = [
  path.join(PUBLIC_DIR, 'index.html'),
  ...fs
    .readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'concept')
    .map((e) => path.join(PUBLIC_DIR, e.name, 'index.html'))
    .filter((p) => fs.existsSync(p)),
];

let changed = 0;
for (const page of pages) {
  let html = fs.readFileSync(page, 'utf8');
  if (!html.includes('<!-- Top Bar -->')) continue;

  // Some pages carry the script inside the header block, so take it out first.
  if (!MOBILE_NAV_SCRIPT.test(html)) throw new Error(`mobile nav script not found in ${page}`);
  html = html.replace(MOBILE_NAV_SCRIPT, '');

  let [before, after] = cut(html, '<!-- Top Bar -->', '<!-- Breadcrumbs -->', { inclusiveEnd: false });
  html = before + HEADER + after;

  [before, after] = cut(html, '<!-- Footer -->', '</footer>', { inclusiveEnd: true });
  html = before + FOOTER + after;

  if (html.includes('mobile-menu-toggle')) throw new Error(`mobile nav still referenced in ${page}`);

  html = html
    .replace(/<link rel="icon"[^>]*selco-logo\.svg">/, `<link rel="icon" type="image/svg+xml" href="${BASE}favicon.svg">`)
    .replace(/<link rel="shortcut icon"[^>]*selco-logo\.svg">/, '')
    .replace('</head>', `${STYLE}</head>`);

  fs.writeFileSync(page, html);
  changed++;
}

console.log(`Stripped site chrome from ${changed} of ${pages.length} page(s)`);
