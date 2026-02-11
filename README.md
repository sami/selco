# Trade Materials Calculator

A comprehensive suite of online calculators for trade professionals, built with **Astro 5**, **React 19**, and **Tailwind CSS 4**.

Deploys to GitHub Pages at [sami.github.io/selco](https://sami.github.io/selco/).

## 🚀 Features

### 🧱 Tiling Project Wizard
A step-by-step wizard that guides users through an entire tiling project:
- **Area Calculation**: Supports L-shapes and mixed units.
- **Material Estimates**: Calculates tiles, adhesive, grout, and spacers in one go.
- **Smart Logic**: Adjusts estimates based on tile size, substrate type, and application area (wet/dry).
- **Shopping List**: Generates a complete list of required materials and recommended tools.

### 🧮 Specialized Calculators
- **Tiles**: Calculate tile quantities with wastage allowance.
- **Adhesive**: Estimate bags required based on substrate and tile type (Standard/Flexible).
- **Grout**: Calculate kg needed based on joint width and tile depth.
- **Spacers**: Estimate packs required for Cross or T-junction layouts.
- **Conversions**: Convert between metric and imperial units (Length, Area, Volume, Weight, Temperature).

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build) (Static Site Generation)
- **UI Library**: [React 19](https://react.dev) (Interactive Islands)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Testing**: Vitest & React Testing Library

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
5| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build production site to `./dist/`               |
| `npm run preview`         | Preview build locally                            |
| `npm test`                | Run unit and component tests                     |

## 📂 Project Structure

- **`src/calculators/`**: Pure TypeScript logic for all calculations (tested in isolation).
- **`src/components/`**: React components (interactive UI) and Astro components (static UI).
- **`src/pages/`**: Astro pages handling routing and layout.
- **`src/layouts/`**: Shared layouts (Header, Footer, Meta tags).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
