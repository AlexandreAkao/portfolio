---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Experience.astro","src/components/sections/Skills.astro","src/components/common/SiteIntro.astro","src/components/designs/nightshift/NightshiftHero.tsx","src/components/designs/nightshift/NightshiftExperience.tsx","src/components/designs/metro/MetroLine.tsx"]
---

# Home surface

Scope: the portfolio home (`/` and `/pt/`) in every world. Visitor mode: Experience. Audience: recruiters in Brazil and Latin America skimming on a phone between candidates; job: judge seniority and range fast, then reach the CV or email. Proof: the five existing worlds plus the two below, all restaging the same content from `src/data` and `src/i18n`. Constraints: shared sections (About, Education, Projects, Contact) re-skin through tokens only; bespoke sections are Hero, Experience, Skills; every world gets an arrival curtain and a quick-change gesture in `SiteIntro.astro`; phones get a calibrated lighter version of heavy scenes. Unresolved: switcher permanence (PRODUCT.md).

## Direction contract: Night Shift (design id `nightshift`)

THESIS: The city's arteries at 3 a.m. become the object: a highway interchange in Three.js where traffic travels as light along stacked ramps under sodium lamps. It refuses the floating glass object beside a name, and it refuses to belong to any one employer's system.

OWN-WORLD: unchanged. Asphalt greys under sodium and blue-spot light; Barlow Condensed uppercase signage headings, Barlow body; hairline seams and one tone step, never shadow; safety yellow only inside the scene, as lane markings; blue spot #3f8cff the sole UI accent; radii 6px cards, 3px buttons.

STORY: this person builds systems that keep traffic flowing through the night without him; every job on the manifest is a small lit object of its own; the CV is one exit away.

FIRST VIEWPORT: full-bleed WebGL interchange: an elevated overpass on piers crossing the frame on a committed diagonal, two ramps looping down to the ground road, light trails (Packet Core cores in Blue Spot halos) streaking along every deck, sodium lamp posts, one blue work light where the night crew is. Text column pinned left at 40%: name in condensed caps at clamp(2.5rem, 6vw, 6rem), role, tagline, outline "View my work", dock-plate "Download CV", socials. Scroll scrubs the camera through Overpass, Ramps, Interchange. Arrival: the curtain is a tunnel whose exit hands off to the camera gliding down onto the overpass. Experience: each manifest entry carries a procedural low-poly vignette of its own work (services cluster, racking, delivery truck, component grid, devices, chart bars) under the same three light families. Phones: about 40% of the geometry, no fog, stepped states, vignettes at 72px.

FORM: Night Interchange, re-derived 2026-09-07 inside the established Night Shift world at the user's request (the warehouse subject was tied to one employer); no new roll; original seed bfa6e4a7. Raises kept: seams (console), one diagonal (pulp), single control with named states (cape), three light sources only (cyclorama).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Direction contract: Linha Verde (design id `metro`)

THESIS: The page is a metro line: each section a station, the scroll the train arriving. It refuses the pinned parallax hero with a horizontal project scroller.

OWN-WORLD: enamel white ground; Linha Verde green #00874a carries the spine, the station bands and the primary action; signage black type in Overpass (900 caps for station names), Overpass Mono for timetable labels; tile-grey hairlines; radii 10px cards, 6px buttons.

STORY: this person's career is a route with clear stops; you ride it in one scroll and get off at the CV.

FIRST VIEWPORT: a green line runs down the left margin with a train marker bound to scroll. The first station is the name as a platform sign, white on a full-width green band, Overpass 900 caps at clamp(2.5rem, 7vw, 6rem); role and tagline beneath as the timetable; CTAs as turnstile buttons. Arriving at any station, two door panels slide apart from the centre to reveal it; one scroll value drives train, doors and signs through a single CSS custom property. Phones: the line moves to a top rail, doors still open, no parallax.

FORM: candidate 3 of 7, Subway Map Journey; seed ddf50991. Raises: single progress source (miura), continuous emergence (darkroom), one custom property (specimen).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Status (2026-09-07)

Both original contracts were built code-led and closed on 2026-09-07 (finish review: recapture, fix with six material findings, two fix rounds, verdict ship); DESIGN.md and `.impeccable/design.json` record the worlds as built; no shipping raster was produced (both worlds are procedural and CSS). Roll records: `.impeccable/rolls/`. Review evidence: `.impeccable/review/`. Divergences recorded in DESIGN.md as built: the dock plate has a chamfer and no radius; Night Shift's secondary CTA is a seam outline; Metro's sign band spans the main column, not the viewport.

Night Shift re-derivation (2026-09-07, later the same day): the user rejected the warehouse subject (intro curtain and hero scene) as too tied to AmbevTech and asked for a generic Three.js subject, a small model beside each experience, and the palette kept. Confirmed by structured interview: highway interchange at night; procedural low-poly vignettes; asphalt + blue spot unchanged. The contract above is the re-derived one. Finish review (2026-09-07, later the same day): first pass returned fix with six material findings (traffic as light, exit gated on the scene, tunnel enclosure and convergence, phone composition, trails behind the desktop column, bay drawn-gate); one fix round, verdict pass scored all six resolved, disposition ship scoped to those fixes. Two non-blocking craft notes (trail intensity, gantry plate lighting) were applied after the verdict. Packet and evidence: `.impeccable/review/packet-nightshift-rederive.md` and the captures it names. Tests: 18 Playwright smoke tests pass; production build completes. DESIGN.md and `.impeccable/design.json` refreshed by the documenter from the built world on 2026-09-07 (Night Shift entries only; the other six worlds untouched; `nightshift-tarmac` added to the palette). FINISH discharged: reviewed, verdict ship on the scored fixes, documented; no shipping raster was produced (the world is procedural and CSS), so no provenance was owed.
