---
name: deploy-gh-pages
description: Deploying the Astro site to GitHub Pages, fixing deployment issues, and configuring the CI/CD pipeline.
---

# Deploy to GitHub Pages

## How It Works

Push to `main` triggers the GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the Astro site and deploys to GitHub Pages automatically.

## Pipeline Steps

1. **Checkout** code
2. **Build** using `withastro/action@v2` (installs deps, runs `astro build`)
3. **Deploy** to GitHub Pages via `actions/deploy-pages@v4`

## Configuration Checklist

| Setting | Value | File |
|---------|-------|------|
| `site` | `https://sami.github.io` | `astro.config.mjs` |
| `base` | `/selco` | `astro.config.mjs` |
| `.nojekyll` | Present in repo root | Prevents Jekyll processing |
| Branch | `main` | Workflow trigger |

## Common Issues

### Links return 404 on GitHub Pages
All internal links must use `import.meta.env.BASE_URL` prefix. The base is `/selco`, not `/`.

### CSS/assets not loading
Astro handles asset paths automatically when `base` is configured. Do not manually prefix static asset paths.

### Build fails in CI
Run `npm run build` locally first. The CI environment uses the same build command.
