# Alexandre Akira — Portfolio

Personal portfolio built with Astro 5, featuring a multi-design system that lets visitors switch between four distinct visual experiences.

## Designs

- **Engineer** — Dark blue terminal aesthetic with JetBrains Mono, teal accents
- **Creative** — Warm off-white with purple accents, Space Grotesk/Playfair Display, rounded elements
- **Avant-garde** — Charcoal with lime accents, Three.js particles, custom cursor, marquee animations
- **Editorial** — Off-white with orange accents, Clash Display, oversized typography, asymmetric layout

Design preference persists via `localStorage` and transitions use the View Transitions API.

## Tech Stack

- **Framework:** Astro 5 + TypeScript
- **UI Islands:** React 19
- **Styling:** Tailwind CSS v4
- **Animations:** Motion (framer-motion)
- **3D:** Three.js + React Three Fiber
- **Blog:** Content Collections + MDX
- **i18n:** English (default) + Portuguese

## Project Structure

```
src/
├── components/
│   ├── designs/          # Design-specific components
│   │   ├── engineer/
│   │   ├── creative/
│   │   ├── avantgarde/
│   │   └── editorial/
│   └── sections/         # Shared section wrappers
├── content/blog/         # MDX blog posts (en/, pt/)
├── data/                 # Experience, education, skills, projects, designs
├── i18n/                 # Translation files (en.json, pt.json)
├── layouts/              # BaseLayout, BlogLayout
└── pages/                # Astro routes
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start dev server at `localhost:4321`          |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview production build locally             |
