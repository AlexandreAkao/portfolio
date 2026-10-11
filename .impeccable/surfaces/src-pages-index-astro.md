---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/components/sections/Hero.astro","src/components/sections/Experience.astro","src/components/sections/Skills.astro","src/components/common/SiteIntro.astro"]
---

# Home surface

Scope: the portfolio home (`/` and `/pt/`) in every world. Visitor mode: Experience. Audience: recruiters in Brazil and Latin America skimming on a phone between candidates; job: judge seniority and range fast, then reach the CV or email. Proof: seven worlds (Editorial, Avant-garde, Engineer, Creative, Arcade, Terminal, Tape), all restaging the same content from `src/data` and `src/i18n`. Constraints: Hero, Experience and Skills are bespoke per world; a world forks About, Education, Projects, Contact and the footer inside the shared section when its identity needs it (Same Bones Rule); every world gets an arrival curtain and a quick-change gesture in `SiteIntro.astro`; phones get a calibrated lighter version of heavy scenes. Editorial opens the site (user decision, 2026-10-10). Unresolved: switcher permanence (PRODUCT.md).

## Direction contract: Engineer, "draft-akira" (2026-10-11)

THESIS: the portfolio is one Internet-Draft read in a pager. It refuses the cloned navy/teal terminal template and its centered hero stack.
OWN-WORLD: cool paper, near-black ink, one link blue; reverse video (ink fill, paper text) is the only fill besides the single blue Email key. Courier Prime at one size; hierarchy by numbering, position, 3-character indent and bold. Page-break seams `Akira  Informational  [Page N]` between sections; a `less` status line pinned to the foot.
STORY: the visitor reads a spec of a senior engineer: abstract, status, numbered sections, author's address. They scan numbers in reverse video, open details, then mail or download the CV.
FIRST VIEWPORT: `$ less` command top-left; RFC header block in two columns; centered title (name, role) as the one large exception; Abstract (tagline); Status of This Memo (current employers, Email key, CV, socials); table of contents with dot leaders.
FORM: RFC / Internet-Draft, candidate 6 of 7; seed key 9f180fc9 (assigned).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Direction contract: Terminal, the category standard (2026-10-11)

THESIS: a dark shell session played straight, at the craft level of GitHub's dark terminal, Warp and Ghostty. No irony, no smuggled quirk.
OWN-WORLD: GitHub-dark ground, cool grey text, green user prompt, blue path and links, one green filled key for email. JetBrains Mono throughout; output in a raised panel only for JSON and mail.
STORY: each section is a command and its output; the visitor reads `whoami`, `cat now.txt`, `cat experience.log` (sub-roles as a `tree`), `cat skills.json | jq`, `ls -l ~/projects`, then `mail` with the address copyable; `exit` closes the page.
FIRST VIEWPORT: a login line, then `whoami` printing the name large, the role, `cat now.txt` (employers), `echo $TAGLINE`, `ls ~/links` (cv.pdf, email filled, socials), the design invitation, a blinking prompt.
FORM: canon (standing exit) of round 9f180fc9, chosen by the user.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Direction contract: Tape, the punched paper tape (2026-10-11)

THESIS: the career punched into teletype paper tape: a perforated orange rail crosses the page and its holes encode real ASCII. It refuses dark-neon glow and card stacks.
OWN-WORLD: true black ground, tape orange carrying a third of the first screen, punched white windows for running copy, ink holes. Big Shoulders condensed caps; rank by window area, not size. State is a mark: a band for active, a cross for done, a folded flag where you stopped.
STORY: the visitor reads the name in a punched window, sees the career as two tape tracks over the years (concurrent roles honest), opens each role's details hung on pins, and ends at the trailer: blank tape, END OF TAPE.
FIRST VIEWPORT: white name window left; employers, Email key and CV right; tagline; the full-bleed tape punching the name and role; the flag; the invitation.
FORM: fused challenger operate-a-cutting-bench-select-rail, bolder re-roll 1 of seed 9f180fc9.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Retired worlds (2026-10-10)

Night Shift (`nightshift`, seed bfa6e4a7, re-derived 2026-09-07) and Metro / Linha Verde (`metro`, seed ddf50991) were removed at the user's explicit request on 2026-10-10, right after the critique in `.impeccable/critique/2026-10-10T04-06-31Z__src-pages.md` (which had rated them the two most authored worlds). Their code, tokens, curtains, the scene gate in `SiteIntro.astro`, the Metro line overlay, and the Barlow / Overpass fonts are gone. Their direction contracts, roll records (`.impeccable/rolls/`) and review packets (`.impeccable/review/`) stay as history; the code lives in git before that date (commits 34a89d7 and 9326597). Do not treat either contract as active.
