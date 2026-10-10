---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Experience.astro","src/components/sections/Skills.astro","src/components/common/SiteIntro.astro"]
---

# Home surface

Scope: the portfolio home (`/` and `/pt/`) in every world. Visitor mode: Experience. Audience: recruiters in Brazil and Latin America skimming on a phone between candidates; job: judge seniority and range fast, then reach the CV or email. Proof: five worlds (Editorial, Avant-garde, Engineer, Creative, Arcade), all restaging the same content from `src/data` and `src/i18n`. Constraints: shared sections (About, Education, Projects, Contact) re-skin through tokens only; bespoke sections are Hero, Experience, Skills; every world gets an arrival curtain and a quick-change gesture in `SiteIntro.astro`; phones get a calibrated lighter version of heavy scenes. Editorial opens the site (user decision, 2026-10-10: the most authored of the five, and no WebGL on a first visit). Unresolved: switcher permanence (PRODUCT.md).

## Retired worlds (2026-10-10)

Night Shift (`nightshift`, seed bfa6e4a7, re-derived 2026-09-07) and Metro / Linha Verde (`metro`, seed ddf50991) were removed at the user's explicit request on 2026-10-10, right after the critique in `.impeccable/critique/2026-10-10T04-06-31Z__src-pages.md` (which had rated them the two most authored worlds). Their code, tokens, curtains, the scene gate in `SiteIntro.astro`, the Metro line overlay, and the Barlow / Overpass fonts are gone. Their direction contracts, roll records (`.impeccable/rolls/`) and review packets (`.impeccable/review/`) stay as history; the code lives in git before that date (commits 34a89d7 and 9326597). Do not treat either contract as active.
