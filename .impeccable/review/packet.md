# Finish review packet: two new worlds on the home surface

## Original request (user, Portuguese)
"quero criar mais 2 temas. Os dois temas vão ser mais ousados, quero que um deles seja utilizando threejs, então tera algum modelo bem legal para demonstrar, e o outro vai ser algo com mais animação, com motion.dev ou animejs (não precisa ser esses necessariamente, so de exemplo). E pode usar animação tambem no do threejs se achar que vai ficar bom"

## Confirmed answers (structured interview)
- The 3D object represents his own work (procedural, from real facts: the WMS warehouse floor), not a showcase asset.
- The motion world is scroll-led: a sequence of scenes that transform as you scroll.
- Phones get a calibrated lighter version of heavy scenes.
- Direction rounds (decision page): user locked the assigned direction in both: Night Shift (seed bfa6e4a7) and Linha Verde / Metro (seed ddf50991). Build path: code-led (no image generation on this harness), so there is no approved comp and no QUALITY BAR card: both directions are the builder's own grounded candidates.

## Direction contracts
`.impeccable/surfaces/src-pages-index-astro.md` (two contracts, one per world).

## Artifact (paths)
- Shared wiring: `src/styles/global.css` (tokens for `nightshift` and `metro`, metro door mechanics under `[data-design='metro'] main > section`), `src/data/designs.ts`, `src/layouts/BaseLayout.astro` (allowlist), `src/i18n/en.json` + `pt.json`, `src/components/sections/{Hero,Experience,Skills}.astro`, `src/pages/index.astro` (MetroLine), `src/components/common/SiteIntro.astro` (arrival + quick-change curtains for both worlds), `src/lib/client-intro.ts` (hydration directive: heroes hydrate at the curtain's reveal and only while their world is visible).
- Night Shift: `src/components/designs/nightshift/NightshiftHero.tsx` (R3F warehouse: instanced racking as uprights/beams/loads, conveyor on a diagonal with five stations, packets routing in order, sodium point lights + one blue spot + packet glow, fog on desktop, scroll-scrubbed camera DOCK→AISLES→DISPATCH over a pinned 200vh hero on desktop, three stepped states over a pinned 150vh hero on phones; progress completes at the pin's release so the whole journey plays on screen), `NightshiftExperience.tsx` (shift manifest, seams), `NightshiftSkills.tsx` (inventory bays).
- Metro: `src/components/designs/metro/MetroLine.tsx` (fixed rail + train marker bound to scroll via spring; publishes `--line-progress` and per-section `--arrival`, monotonic), `MetroHero.tsx` (platform sign band + timetable), `MetroExperience.tsx` (stops on a line), `MetroSkills.tsx` (line index).

## Screenshots (all required; `.impeccable/review/`; fresh load at scrollY 0 unless a position is stated, after `data-intro` = `done` plus a 1.5s settle, then 1.4s to 1.6s before WebGL frames and 0.6s before others; the Astro dev toolbar is hidden by an injected style in every capture of this round)
- Night Shift desktop 1440: `nightshift-desktop-dock.png` (scrollY 0; HUD reads Dock at y=860), `nightshift-desktop-aisles.png` (scrollY 482, Aisles), `nightshift-desktop-dispatch.png` (scrollY 964, Dispatch; the hero is still pinned, sticky top = 64px under the header), `nightshift-desktop.png` (full page after a scroll-through; the hero is a pinned 200vh journey so its second viewport is empty in a full-page capture by construction).
- Night Shift mobile 390: `nightshift-mobile-hero.png` and `nightshift-mobile-dock.png` (scrollY 0, Dock), `nightshift-mobile-aisles.png` (scrollY 240, Aisles), `nightshift-mobile-dispatch.png` (scrollY 486, Dispatch, still pinned), `nightshift-mobile.png` (full). The hero is a pinned 150vh journey on phones.
- Metro desktop 1440: `metro-desktop-hero.png` (scrollY 0, settled; the band now starts at x=160, right of the rail labels whose right edge is x=140; the band's top sits about 260px down because the hero is vertically centred in a min-h-screen block, by design), `metro-desktop.png` (full page after scroll-through), `metro-desktop-experience.png`, `metro-desktop-skills.png`, `metro-desktop-contact.png` (page end; every `--arrival` reads 1.000 there).
- Metro at 1280x800: `user-1280-metro-hero.png` (scrollY 0; rail labels right edge 140px, band left 160px; the same clearance holds at 1024).
- Metro mobile 390: `metro-mobile-hero.png` (scrollY 0, settled; the timetable's dt and dd share a row, dt at x=24 and dd at x=128), `metro-mobile.png` (full), `metro-mobile-experience.png`.
- Arrival curtains (unchanged from the last round, fresh load at scrollY 0, frames timed from `data-intro` = `play`): `intro-nightshift-{300,700,1000,1350}.png` (play, play, reveal, reveal; canvas mounted in both reveal frames), `intro-metro-{300,700,1000,1350}.png`.
- Quick-change (unchanged): `qc-nightshift-000-origin.png`, `qc-nightshift-200-cover.png`, `qc-nightshift-done-reveal.png`; `qc-metro-000-origin.png`, `qc-metro-200-cover.png`, `qc-metro-done-reveal.png`.

## Fix round 1 (applied after the `fix` disposition; verdict pass requested on these six)
1. Concept roll: `.impeccable/rolls/README.md` records both rolls with the decision-page answers; `.impeccable/rolls/bfa6e4a7.txt` and `ddf50991.txt` are the seed script's own output reproduced with `--from <key>`; the two card payloads are archived beside them.
2. Date kickers: `NightshiftExperience.tsx` and `MetroExperience.tsx` now set the period beside the heading in one row (heading left, period right); on narrow phones the row wraps and the period falls under the heading, never above it. Evidence: `nightshift-desktop.png` Experience region, `metro-desktop-experience.png`, `metro-mobile-experience.png`.
3. Metro phone timetable: the `<dl>` is a two-column grid at every width (5.5rem label column below md). Evidence: `metro-mobile-hero.png`.
4. Promised objects: the Night Shift "Download CV" is now a dock plate (chamfered steel plate with a stamped inner seam and a roll-up shutter glyph whose slats roll up on hover and focus), `NightshiftHero.tsx` CTA block; both Metro CTAs are turnstiles (a three-arm tripod that turns 120 degrees on hover and focus), `MetroHero.tsx`. Evidence: `nightshift-desktop-dock.png`, `metro-desktop-hero.png`.
5. Packets as light: packet core and halo, station lamps and sodium lamp heads are exempt from fog (`fog={false}`), halo opacity 0.55 additive, core 0.085; the conveyor's near end moved from world (-15, 11) to (-5, 2.5) so the belt starts right of the 40% text column at the dock state. `NightshiftHero.tsx`. Evidence: `nightshift-desktop-dock.png`, `nightshift-desktop-dispatch.png`.
6. Rail labels: no plates; labels render only from lg (1024px) and the main column starts at 160px there (88px at md), so the band never sits under a label. `MetroLine.tsx`, `global.css`. Evidence: `metro-desktop-hero.png`, `user-1280-metro-hero.png`.
Also fixed while recapturing: the HUD was 24px below the fold at rest because the pinned hero started under the 64px header at full viewport height; the hero now pins at `top: 64px` with height `100vh - 4rem`, so the HUD is on screen in every state (`nightshift-desktop-dock.png`). The one console error in this round's capture log is the capture script's own toolbar-hiding init script running before `documentElement` exists; it is not a site error.

## Fix round 2 (applied after the first verdict pass; verdict requested on the three open items)
- Fix 4, Metro (was partial): the CTA is now the turnstile itself, not an icon inside a button: a round pivot post (44px, `rounded-full`) carrying the tripod, and a push arm that carries the label and leaves the post by 4px on hover and focus while the tripod turns 120 degrees; primary is Linha Verde with white, secondary is an outlined post and arm. `src/components/designs/metro/MetroHero.tsx`, `Turnstile` component. Evidence: `metro-desktop-hero.png` (CTAs at about x 208 to 620, y 640 to 690), `user-1280-metro-hero.png`, `metro-mobile-hero.png`.
- Regression, dock state: the conveyor is one committed diagonal again and the whole diagonal moved right, from world (2, 8.5) at the receive station to (21, -19) at ship, so at DOCK its lit near end and the first station sit right of the 40% text column (about x 940 to 1040 of 1440) and the belt runs back along the racking. Phones look 5 units further right at the dock step so the same belt stays in their narrower frame. `src/components/designs/nightshift/NightshiftHero.tsx` (`conveyorCurve`, `CameraRig`). Evidence: `nightshift-desktop-dock.png`, `nightshift-mobile-dock.png`.
- Regression, Metro phone hero: the timetable labels flow inline with their values on phones (label, then the value text on the same line, wrapping as text; from md the two-column grid returns), the role is text-xl and the tagline text-base on phones, and the turnstile arms are compact below sm, so both CTAs share one row (154px + 153px). Measured at 390: label at x=24 and the value's first character at x=133 on the same line; CTAs on one row; socials at y=723. `MetroHero.tsx`. Evidence: `metro-mobile-hero.png`.

Recaptured in this round with the same method as round 1 (settled at scrollY 0, dev toolbar hidden): `nightshift-desktop-{dock,aisles,dispatch}.png` (scrollY 0 / 482 / 964), `nightshift-desktop.png`, `nightshift-mobile-{hero,dock,aisles,dispatch}.png` (0 / 0 / 240 / 486), `nightshift-mobile.png`, `metro-desktop-hero.png`, `metro-desktop.png`, `user-1280-metro-hero.png`, `metro-mobile-hero.png`, `metro-mobile.png`. All other captures are unchanged from round 1.

## Detector findings (hook is not active on this harness; run once)
`.impeccable/review/detector-findings.json`: 20 entries. Advisories: literal scene colours in the Night Shift canvas (safety yellow, sodium, cardboard: scene materials, not UI chrome) and 0.6/0.7rem label sizes (since moved to 0.75rem). Warnings kept deliberately: `side-tab` on the Metro door panels' inset edge stripes (they are the train door edges of the world, not card accents) and one bounce easing in the pre-existing Arcade curtain pop.

## Critique reference
No comp exists (code-led, no image generation). Judge against the direction contracts' FIRST VIEWPORT blocks and the craft floor: `.claude/skills/impeccable/reference/craft-floor.md`.

## Known constraints
- PRODUCT.md principles apply (recruiter speed on a phone; shared content from src/data and i18n; The Own Palette Rule from DESIGN.md).
- `hero.greeting` ("Hi, my name is") is intentionally not rendered in the two new worlds (eyebrow ban).
