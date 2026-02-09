---
description: Workflow to deploy the Astro application to GitHub Pages.
---

# Deploy to GitHub Pages

1.  **Configure Astro**:
    Ensure `astro.config.mjs` has the correct `site` and `base` options set.
    ```js
    export default defineConfig({
      site: 'https://sami.github.io',
      base: '/selco',
    });
    ```

2.  **Create GitHub Action**:
    Create a file at `.github/workflows/deploy.yml` with the standard Astro deployment configuration.

3.  **Push to `main`**:
    Committing and pushing to `main` will trigger the workflow.

## Example Workflow File
(See `.github/workflows/deploy.yml` in the repository for the actual implementation)
