---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Experience.astro","src/components/sections/Skills.astro","src/components/common/SiteIntro.astro","src/components/designs/nightshift/NightshiftHero.tsx","src/components/designs/metro/MetroLine.tsx"]
---

---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Experience.astro","src/components/sections/Skills.astro","src/components/common/SiteIntro.astro"]
---

# Home surface

Scope: the portfolio home (`/` and `/pt/`) in every world. Visitor mode: Experience. Audience: recruiters in Brazil and Latin America skimming on a phone between candidates; job: judge seniority and range fast, then reach the CV or email. Proof: the five existing worlds plus the two below, all restaging the same content from `src/data` and `src/i18n`. Constraints: shared sections (About, Education, Projects, Contact) re-skin through tokens only; bespoke sections are Hero, Experience, Skills; every world gets an arrival curtain and a quick-change gesture in `SiteIntro.astro`; phones get a calibrated lighter version of heavy scenes. Unresolved: switcher permanence (PRODUCT.md).

## Direction contract: Night Shift (design id `nightshift`)

THESIS: The WMS you built becomes the object: a warehouse floor at 3 a.m. in Three.js, where orders travel as light along the real route (receive, put-away, pick, pack, ship). It refuses the floating glass object beside a name.

OWN-WORLD: asphalt greys under sodium and blue-spot light; Barlow Condensed uppercase signage headings, Barlow body; hairline seams and one tone step, never shadow; safety yellow lives only inside the scene; blue spot #3f8cff is the sole UI accent; radii 6px cards, 3px buttons.

STORY: this person builds systems that run through the night without him; the CV is one dock away.

FIRST VIEWPORT: full-bleed WebGL warehouse, aisles of instanced racking receding into fog, one conveyor on a committed diagonal carrying light packets between five lit stations. Text column pinned left at 40% width: name in condensed caps at clamp(2.5rem, 6vw, 6rem), role, tagline, outline "View my work", filled "Download CV" as a dock plate, socials. Scroll scrubs the camera through named states dock, aisles, dispatch. Phones: 40% of the geometry, no fog, stepped states.

FORM: candidate 3 of 7, Warehouse Floor; seed bfa6e4a7. Raises: seams (console), one diagonal (pulp), honest routing (ink basin), single control with named states (cape), three light sources only (cyclorama).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Direction contract: Linha Verde (design id `metro`)

THESIS: The page is a metro line: each section a station, the scroll the train arriving. It refuses the pinned parallax hero with a horizontal project scroller.

OWN-WORLD: enamel white ground; Linha Verde green #00874a carries the spine, the station bands and the primary action; signage black type in Overpass (900 caps for station names), Overpass Mono for timetable labels; tile-grey hairlines; radii 10px cards, 6px buttons.

STORY: this person's career is a route with clear stops; you ride it in one scroll and get off at the CV.

FIRST VIEWPORT: a green line runs down the left margin with a train marker bound to scroll. The first station is the name as a platform sign, white on a full-width green band, Overpass 900 caps at clamp(2.5rem, 7vw, 6rem); role and tagline beneath as the timetable; CTAs as turnstile buttons. Arriving at any station, two door panels slide apart from the centre to reveal it; one scroll value drives train, doors and signs through a single CSS custom property. Phones: the line moves to a top rail, doors still open, no parallax.

FORM: candidate 3 of 7, Subway Map Journey; seed ddf50991. Raises: single progress source (miura), continuous emergence (darkroom), one custom property (specimen).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Status (2026-09-07)

Both direction contracts above were built code-led and closed: finish review ran (recapture, then fix with six material findings, two fix rounds, verdict ship on 2026-09-07), DESIGN.md and `.impeccable/design.json` record the two worlds as built, and no shipping raster was produced by this run (both worlds are procedural and CSS), so no provenance was owed. Roll records: `.impeccable/rolls/`. Review evidence and packet: `.impeccable/review/`. Divergences from the contracts, recorded in DESIGN.md as built: the dock plate has a chamfer and no radius; Night Shift's secondary CTA is a seam outline; Metro's sign band spans the main column, not the viewport; the phone build carries about 42% of the racking.
