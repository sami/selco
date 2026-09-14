import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const CONCEPT_DIR = path.join(PUBLIC_DIR, 'concept');

// 1. Ensure concept dir exists
if (!fs.existsSync(CONCEPT_DIR)) {
  console.error('Error: public/concept directory does not exist.');
  process.exit(1);
}

// 2. Move / copy _astro directory
const conceptAstroDir = path.join(CONCEPT_DIR, '_astro');
const targetAstroDir = path.join(PUBLIC_DIR, '_astro');

if (fs.existsSync(conceptAstroDir)) {
  if (!fs.existsSync(targetAstroDir)) {
    fs.mkdirSync(targetAstroDir, { recursive: true });
  }
  const astroFiles = fs.readdirSync(conceptAstroDir);
  for (const file of astroFiles) {
    fs.copyFileSync(path.join(conceptAstroDir, file), path.join(targetAstroDir, file));
  }
  console.log(`Copied ${astroFiles.length} files from public/concept/_astro to public/_astro`);
  // Remove concept/_astro
  fs.rmSync(conceptAstroDir, { recursive: true, force: true });
}

// 3. Find all calculator directories in public/concept
const entries = fs.readdirSync(CONCEPT_DIR, { withFileTypes: true });
const slugDirs = entries.filter(e => e.isDirectory() && e.name !== '_astro').map(e => e.name);

console.log(`Found ${slugDirs.length} calculator directories in concept:`, slugDirs);

// 4. Move each calculator directory to public/<slug> and replace in concept with a redirect
for (const slug of slugDirs) {
  const srcSlugDir = path.join(CONCEPT_DIR, slug);
  const targetSlugDir = path.join(PUBLIC_DIR, slug);

  // Copy directory recursively to target
  fs.mkdirSync(targetSlugDir, { recursive: true });
  const files = fs.readdirSync(srcSlugDir);
  for (const file of files) {
    const srcFile = path.join(srcSlugDir, file);
    const targetFile = path.join(targetSlugDir, file);
    if (fs.statSync(srcFile).isFile()) {
      let content = fs.readFileSync(srcFile, 'utf8');
      if (file.endsWith('.html')) {
        // Rewrite /selco/concept/ -> /selco/
        content = content.replaceAll('/selco/concept/', '/selco/');
      }
      fs.writeFileSync(targetFile, content, 'utf8');
    }
  }

  // Create redirect HTML in public/concept/<slug>/index.html
  const redirectHtml = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/selco/${slug}/">
  <link rel="canonical" href="https://sami.github.io/selco/${slug}/">
  <title>Redirecting to /selco/${slug}/...</title>
  <script>window.location.replace("/selco/${slug}/");</script>
</head>
<body>
  <p>Redirecting to <a href="/selco/${slug}/">/selco/${slug}/</a>...</p>
</body>
</html>
`;
  fs.writeFileSync(path.join(srcSlugDir, 'index.html'), redirectHtml, 'utf8');
}

// 5. Copy and rewrite public/concept/index.html -> public/index.html
const conceptIndexFile = path.join(CONCEPT_DIR, 'index.html');
const targetIndexFile = path.join(PUBLIC_DIR, 'index.html');

if (fs.existsSync(conceptIndexFile)) {
  let indexContent = fs.readFileSync(conceptIndexFile, 'utf8');
  indexContent = indexContent.replaceAll('/selco/concept/', '/selco/');
  fs.writeFileSync(targetIndexFile, indexContent, 'utf8');
  console.log('Created public/index.html from public/concept/index.html with updated paths');

  // Replace public/concept/index.html with redirect to /selco/
  const conceptRedirectHtml = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/selco/">
  <link rel="canonical" href="https://sami.github.io/selco/">
  <title>Redirecting to Trade Materials Calculator...</title>
  <script>window.location.replace("/selco/");</script>
</head>
<body>
  <p>Redirecting to <a href="/selco/">Trade Materials Calculator</a>...</p>
</body>
</html>
`;
  fs.writeFileSync(conceptIndexFile, conceptRedirectHtml, 'utf8');
  console.log('Created redirect at public/concept/index.html -> /selco/');
}

console.log('Migration complete.');
