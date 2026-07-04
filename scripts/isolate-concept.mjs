import fs from 'fs';
import path from 'path';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function processHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update _astro paths
      content = content.replace(/\/selco\/_astro\//g, '/selco/concept/_astro/');
      
      // Inject banner
      const banner = `
      <div style="background-color: #fef08a; color: #854d0e; padding: 12px; text-align: center; font-family: sans-serif; font-weight: 500; font-size: 14px; border-bottom: 2px solid #ca8a04;">
        Frozen concept demonstrator — AI-assisted build, frozen 4 July 2026. <a href="/selco/" style="color: #a16207; font-weight: bold; text-decoration: underline;">Superseded by the rebuild at the site root.</a>
      </div>`;
      
      // Inject right after <body>
      content = content.replace(/(<body[^>]*>)/i, `$1\n${banner}`);
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

// 1. Copy concept files
copyRecursiveSync('dist/concept', 'public/concept');

// 2. Copy _astro files needed by concept
copyRecursiveSync('dist/_astro', 'public/concept/_astro');

// 3. Process HTML files to inject banner and update asset paths
processHtmlFiles('public/concept');

console.log('Concept isolation complete.');
