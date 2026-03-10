# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Production build (output: dist/)
npm run preview  # Preview production build locally
```

No linter or test runner is configured.

## Architecture

Astro 5 portfolio site with 4 swappable visual designs (Engineer, Creative, Avant-garde, Editorial) and i18n (en/pt). React 19 islands handle interactive components; everything else is Astro server-rendered.

### Multi-Design System

The core architectural pattern: all 4 designs render simultaneously, with CSS visibility toggling the active one.

- **Registry:** `src/data/designs.ts` — config-driven list of design IDs. Adding a design means adding it here plus creating components and CSS tokens.
- **Switching:** `localStorage` key `design` sets `data-design` attribute on `<html>`. An inline script in `BaseLayout.astro` runs before paint to prevent FOUC.
- **CSS visibility:** `[data-design='X'] [data-design-show]:not([data-design-show='X']) { display: none !important }` in `global.css`. To conditionally show content for a design, wrap it in `<div data-design-show="designId">`.
- **Design tokens:** Each design defines CSS custom properties (`--bg`, `--text`, `--accent`, `--font-heading`, etc.) scoped to `[data-design='X']` in `global.css`. Tailwind reads these via `@theme` mappings.
- **Section pattern:** Each section in `src/components/sections/` (Hero, Experience, Skills, etc.) imports all design variants and wraps each in `data-design-show`. See `Hero.astro` for the canonical example.
- **Design components:** `src/components/designs/{engineer,creative,avantgarde,editorial}/` — React (.tsx) components for each design's variant of a section. Use `client:load` or `client:visible` Astro directives.

### i18n

- English is the default locale (no URL prefix). Portuguese lives at `/pt/`.
- UI strings: `src/i18n/en.json` and `pt.json`, accessed via `t(key, locale)` from `src/i18n/utils.ts`.
- Client-side language toggle uses `data-lang` attribute on `<html>` + `data-lang-show` visibility pattern (same approach as design toggling).
- Blog posts are organized by locale folder: `src/content/blog/en/`, `src/content/blog/pt/`.

### Path Aliases

Defined in `tsconfig.json`: `@/*` → `src/*`, `@components/*`, `@layouts/*`, `@data/*`, `@i18n/*`.

### Key Libraries

- **Tailwind CSS v4** — configured as a Vite plugin (not PostCSS). Design tokens flow through CSS custom properties → `@theme` block in `global.css`.
- **Motion (framer-motion)** — animations in React islands.
- **Three.js + @react-three/fiber + @react-three/drei** — 3D effects in Avant-garde design.
- **Astro View Transitions** — `ClientRouter` in BaseLayout for smooth page transitions.
- **Astro Content Collections** — blog uses `glob` loader with Zod schema in `src/content/config.ts`.

## Conventions

- Use `npm` (not pnpm/yarn).
- TypeScript strict mode. JSX uses `react-jsx` import source.
- React components are `.tsx`, Astro components are `.astro`.
- Data files (`src/data/`) export typed arrays/objects consumed by both Astro and React components.
- Fonts are self-hosted via `@fontsource` packages, except Clash Display (fontshare CDN).
