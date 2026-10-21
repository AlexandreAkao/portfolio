# Alexandre Akira — Portfolio

Personal portfolio and blog at [alexandreakira.dev](https://alexandreakira.dev), built with Astro 5. One body of content is staged in eight complete visual worlds; a switch in the header restages the whole site without changing a word.

## Worlds

| World | Portuguese | Staging | Type | Accent |
| :--- | :--- | :--- | :--- | :--- |
| **Editorial** (default) | Editorial | A broadsheet front page on newsprint | Clash Display + DM Sans | Signal Orange `#ff4d00` |
| **Avant-garde** | Avant-garde | A dark gallery with a Three.js particle field, custom cursor and marquee | Poppins + Inter | Acid Lime `#c5ff41` |
| **Engineer** | Engineer | An Internet-Draft read in a pager | Courier Prime | Link Blue `#1d4ed8` |
| **Arcade** | Arcade | An arcade cabinet with candy-colored cards | Bungee + Outfit | Coin Gold `#fcba28` |
| **Terminal** | Terminal | A shell session the visitor opens over ssh | JetBrains Mono | Path Blue `#58a6ff` |
| **Tape** | Fita | Punched teletype paper tape | Big Shoulders Display + Text | Tape Orange `#ff5a1f` |
| **Cartoon** | Desenho | A 1960s cartoon's opening titles, with an SVG caricature | Londrina Solid + Jost | Marigold `#f3c623` |
| **Clay** | Massinha | A developer's desk in plasticine, with a live Three.js clay puppet | Bagel Fat One + Gabarito | Clay Pink `#f26b8a` |

Every world stages its own Hero, Experience and Skills, and most also stage their own About, Education, Projects, Contact and footer. Each one opens with its own intro curtain, and switching worlds plays a short version of the incoming world's curtain.

The design system, including every world's tokens, typography and rules, is documented in [DESIGN.md](DESIGN.md). Product context and design decisions are in [PRODUCT.md](PRODUCT.md).

## How it works

- **Registry:** `src/data/designs.ts` lists the worlds and their order. The first one, Editorial, opens the site.
- **Rendering:** all worlds render on the page at once, and CSS shows only the active one (`data-design` on `<html>`, `data-design-show` on each world's block). Heroes of hidden worlds stay unhydrated until the visitor shows intent to switch.
- **Tokens:** each world sets its colors, fonts and radii as CSS custom properties on `[data-design='<id>']` in `src/styles/global.css`, which Tailwind reads through `@theme`.
- **Persistence:** the chosen world is saved in `localStorage` and applied by an inline script before first paint, so the page never flashes the wrong world.

## Languages

English is the default, with Portuguese at `/pt/`. UI strings live in `src/i18n/en.json` and `pt.json`, blog posts in `src/content/blog/en/` and `pt/`, and each language has its own RSS feed (`/rss.xml`, `/pt/rss.xml`).

## Tech Stack

- **Framework:** Astro 5 + TypeScript (strict)
- **UI Islands:** React 19
- **Styling:** Tailwind CSS v4 (Vite plugin)
- **Animations:** Motion (framer-motion)
- **3D:** Three.js + React Three Fiber + drei (Avant-garde and Clay)
- **Blog:** Content Collections + MDX
- **Fonts:** self-hosted via `@fontsource`, except Clash Display (Fontshare)
- **Tests:** Playwright

## Project Structure

```
src/
├── components/
│   ├── common/           # Header, nav, footer, intro curtains (SiteIntro.astro)
│   ├── designs/          # One folder per world
│   │   ├── editorial/
│   │   ├── avantgarde/
│   │   ├── engineer/
│   │   ├── arcade/
│   │   ├── terminal/
│   │   ├── tape/
│   │   ├── cartoon/
│   │   └── clay/
│   ├── islands/          # Design switcher, language switcher, mobile menu
│   ├── pages/            # Home and blog index, shared by both languages
│   ├── sections/         # Shared sections that stage each world's variant
│   └── ui/               # Small shared components
├── content/blog/         # MDX blog posts (en/, pt/)
├── data/                 # Experience, education, skills, projects, social, worlds
├── i18n/                 # Translation files (en.json, pt.json)
├── layouts/              # BaseLayout, BlogLayout
├── pages/                # Astro routes (/, /pt/, blog, RSS, 404)
└── styles/               # global.css: tokens and visibility rules
tests/                    # Playwright specs
```

## Commands

| Command           | Action                                          |
| :---------------- | :---------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Start dev server at `localhost:4321`            |
| `npm run build`   | Build production site to `./dist/`              |
| `npm run preview` | Preview production build locally                |
| `npm test`        | Run the Playwright tests (starts the dev server) |
| `npm run test:ui` | Run the Playwright tests in UI mode             |

The tests need Playwright's browsers: run `npx playwright install` once.
