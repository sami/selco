# Tech Stack

| **Layer** | **Technology** | **Notes** |
| --- | --- | --- |
| Framework | Astro 5 | Static site generation with selective hydration (islands architecture) |
| Interactive components | React 19 | Used only for calculator UI components via `client:load` directive |
| Language | TypeScript (strict mode) | Full type safety across all modules |
| Testing | Vitest | Target 90%+ unit test coverage for all calculation modules |
| Hosting | GitHub Pages | Deployed via GitHub Actions CI/CD |
| Styling | Tailwind CSS | Utility-first, mobile-first approach |

**No backend.** The application runs entirely in the browser. No server, no database, no user accounts, no payment integration.
