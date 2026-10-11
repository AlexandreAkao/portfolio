---
name: Alexandre Akira Portfolio
description: One portfolio, five complete visual identities switched at runtime. The content never changes, only the staging.
colors:
  engineer-navy-depth: "#0a192f"
  engineer-navy-raised: "#112240"
  engineer-navy-lifted: "#1d3461"
  engineer-navy-line: "#233554"
  engineer-frost: "#ccd6f6"
  engineer-slate: "#8892b0"
  engineer-terminal-teal: "#64ffda"
  engineer-terminal-teal-deep: "#4cd9b0"
  creative-warm-paper: "#faf5ee"
  creative-warm-paper-deep: "#f0e9df"
  creative-white-card: "#ffffff"
  creative-warm-card-hover: "#f8f4ef"
  creative-sand-line: "#e2d8cc"
  creative-ink-navy: "#1a1a2e"
  creative-ink-muted: "#4a4a68"
  creative-royal-violet: "#7333d4"
  creative-royal-violet-deep: "#6425c0"
  avantgarde-charcoal: "#131211"
  avantgarde-charcoal-raised: "#1c1a18"
  avantgarde-charcoal-lifted: "#252220"
  avantgarde-charcoal-line: "#2a2725"
  avantgarde-bone: "#f0ece6"
  avantgarde-ash: "#9a948b"
  avantgarde-acid-lime: "#c5ff41"
  avantgarde-acid-lime-bright: "#d4ff6e"
  editorial-newsprint: "#f5f5f0"
  editorial-newsprint-deep: "#eae8e1"
  editorial-white-card: "#ffffff"
  editorial-newsprint-card-hover: "#f9f8f5"
  editorial-newsprint-line: "#d4d0c8"
  editorial-ink: "#1a1a1a"
  editorial-ink-grey: "#636363"
  editorial-signal-orange: "#ff4d00"
  editorial-signal-orange-deep: "#e64500"
  editorial-signal-orange-ink: "#bf3900"
  arcade-cabinet-black: "#0f0d0e"
  arcade-cabinet-plum: "#1a1820"
  arcade-cabinet-card: "#231f20"
  arcade-cabinet-card-hover: "#2d2829"
  arcade-cabinet-line: "#2a2725"
  arcade-cream: "#f9f4da"
  arcade-silver: "#b1b4b9"
  arcade-coin-gold: "#fcba28"
  arcade-coin-gold-deep: "#e5a820"
  arcade-candy-green: "#0ba95b"
  arcade-candy-blue: "#12b5e5"
  arcade-candy-pink: "#f38ba3"
  arcade-candy-purple: "#a189cc"
  arcade-candy-red: "#f55a6e"
typography:
  engineer-display:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1
  creative-display:
    fontFamily: "Sora, sans-serif"
    fontSize: "6rem"
    fontWeight: 700
    lineHeight: 1.25
  avantgarde-display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "clamp(2.25rem, 8vw, 6.5rem)"
    fontWeight: 700
    lineHeight: 0.95
  editorial-display:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(2.5rem, 10vw, 9rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  arcade-display:
    fontFamily: "Bungee, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 400
    lineHeight: 1
  engineer-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  creative-body:
    fontFamily: "Source Serif 4, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  avantgarde-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  editorial-body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  arcade-body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  headline:
    fontFamily: "var(--font-heading)"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-heading)"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: "var(--font-body)"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "var(--font-body)"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  prose:
    fontFamily: "var(--font-body)"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "-0.003em"
  label:
    fontFamily: "var(--font-body)"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.05em"
  button:
    fontFamily: "var(--font-body)"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  button-caps:
    fontFamily: "var(--font-body)"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: "0.05em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  sm-6: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  section: "80px"
components:
  engineer-button-primary:
    backgroundColor: "{colors.engineer-terminal-teal}"
    textColor: "{colors.engineer-navy-depth}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    padding: "12px 24px"
  engineer-button-primary-hover:
    backgroundColor: "{colors.engineer-terminal-teal-deep}"
  engineer-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.engineer-terminal-teal}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    padding: "12px 24px"
  engineer-card:
    backgroundColor: "{colors.engineer-navy-raised}"
    textColor: "{colors.engineer-frost}"
    rounded: "{rounded.xs}"
    padding: "24px"
  creative-button-primary:
    backgroundColor: "{colors.creative-royal-violet}"
    textColor: "{colors.creative-white-card}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  creative-button-primary-hover:
    backgroundColor: "{colors.creative-royal-violet-deep}"
  creative-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.creative-royal-violet}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  creative-card:
    backgroundColor: "{colors.creative-white-card}"
    textColor: "{colors.creative-ink-navy}"
    rounded: "{rounded.xl}"
    padding: "32px"
  avantgarde-button-primary:
    backgroundColor: "{colors.avantgarde-acid-lime}"
    textColor: "{colors.avantgarde-charcoal}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  avantgarde-button-primary-hover:
    backgroundColor: "{colors.avantgarde-acid-lime-bright}"
  avantgarde-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.avantgarde-acid-lime}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
  avantgarde-card:
    backgroundColor: "{colors.avantgarde-charcoal-raised}"
    textColor: "{colors.avantgarde-bone}"
    rounded: "{rounded.md}"
    padding: "32px"
  editorial-button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.editorial-ink}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "12px 32px"
  editorial-button-primary-hover:
    backgroundColor: "{colors.editorial-signal-orange}"
    textColor: "{colors.editorial-ink}"
  editorial-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.editorial-signal-orange-ink}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.none}"
    padding: "12px 32px"
  editorial-button-secondary-hover:
    backgroundColor: "{colors.editorial-signal-orange}"
    textColor: "{colors.editorial-ink}"
  editorial-card:
    backgroundColor: "{colors.editorial-white-card}"
    textColor: "{colors.editorial-ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  arcade-button-primary:
    backgroundColor: "{colors.arcade-coin-gold}"
    textColor: "{colors.arcade-cabinet-black}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  arcade-button-primary-hover:
    backgroundColor: "{colors.arcade-coin-gold-deep}"
  arcade-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.arcade-coin-gold}"
    typography: "{typography.button-caps}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  arcade-card:
    backgroundColor: "{colors.arcade-cabinet-card}"
    textColor: "{colors.arcade-cream}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Alexandre Akira Portfolio

## Overview

**Creative North Star: "The Repertoire"**

One performer, five staged productions of the same script. The content (name, title, tagline, experience, skills, projects, blog) never changes; a switch in the header restages it in one of five complete visual worlds: Editorial (the default), Avant-garde, Engineer, Creative, and Arcade. The system's personality is plural on purpose. Each world commits fully to its own register (the broadsheet, the dark gallery, the terminal, the studio, and the arcade cabinet). None of them is a theme laid over a neutral base, because the neutral base does not exist.

Underneath, one skeleton carries all five: a fixed translucent header, a full-viewport hero, and a single centered column of sections (About, Experience, Education, Skills, Projects, Contact) at medium density. A world declares nine semantic color tokens (page, raised, text, secondary text, accent, accent hover, border, card, card hover), two font slots, and two radii, and the shared sections re-skin themselves. Two accent-use tokens sit on top for every world: `--on-accent`, the text on an accent fill (the page color by default), and `--accent-text`, small text in the accent (the accent itself by default); a world overrides either only when its accent needs it, as Editorial does. Only Hero, Experience, and Skills get a bespoke component per world.

The aesthetic philosophy is restraint everywhere except the accent and the display type. Every world has exactly one accent and spends it on small, high-signal things: buttons, period labels, rules, hover and selection states. Display typography carries identity. Motion is one shared reveal grammar (fade and rise on scroll, once) plus a single signature per world. Every signature lives in the hero.

**Key Characteristics:**
- Five complete worlds, one content source, switched at runtime and persisted per visitor.
- One accent per world, spent on interactive and labeling elements only.
- Display typography carries identity: monospace, geometric sans, heavy grotesk, display grotesk, or slab poster.
- Flat, border-defined surfaces in four worlds; Creative alone lifts with shadow.
- Shared reveal motion (fade, 30px rise, 0.5s, once) with a signature per world, staged in the hero.
- WebGL in one world only (Avant-garde's particle field), mounted only while that world is active and backed by a CSS fallback.
- Candy stays on the cards: Arcade's candy colors are surfaces, never UI chrome.
- Bilingual by construction: every text node renders both locales and CSS shows one.

## Colors

Five self-contained palettes, each a dark or paper neutral family plus exactly one accent; Arcade adds a set of candy surfaces.

### Primary
- **Terminal Teal** (#64ffda): Engineer's accent. Prompt glyphs ("$", ">", "<", "/>"), period labels, timeline nodes, the filled button with Navy Depth text, the outline button stroke, focus rings. Hover deepens to Terminal Teal Deep (#4cd9b0).
- **Royal Violet** (#7333d4): Creative's accent. Filled pill buttons with white text, the second word of the name, eyebrow labels, selected chips and tabs, 10% tints behind tag pills and period badges, the portrait halo. Hover deepens to Royal Violet Deep (#6425c0).
- **Acid Lime** (#c5ff41): Avant-garde's accent. The particle field, the custom cursor, the hero rule, the 3px card edge, period labels, category numbers, the filled button with Charcoal text, chip hover glow. Hover brightens to Acid Lime Bright (#d4ff6e).
- **Signal Orange** (#ff4d00): Editorial's accent. The hero rule, hover underlines, the outline button stroke, the button and contact fills (with Ink text), and display-size text such as the 404 numeral. Hover deepens to Signal Orange Deep (#e64500). Small orange text (role lines, skill numbers, the "<A4 />" mark, the secondary button label, every accent hover on text) renders in **Signal Orange Ink** (#bf3900) instead.
- **Coin Gold** (#fcba28): Arcade's accent. The 4px underline beneath section titles, the hero role line, the filled pill button with Cabinet Black text, project metric text. Hover deepens to Coin Gold Deep (#e5a820). It also serves as the sixth candy surface.

### Secondary (Arcade only)
Candy surfaces cycle by index across experience and skill cards: Candy Green (#0ba95b), Candy Blue (#12b5e5), Candy Pink (#f38ba3), Candy Purple (#a189cc), Candy Red (#f55a6e), then Coin Gold. Text on every candy surface is solid Cabinet Black, never faded by opacity; chips on them are Cabinet Black at 15%. Purple and red were lightened on 2026-10-11 (from #7b5ea7 and #ed203d, which held black text at 3.7:1 and 4.5:1) so every candy reads at 4.6:1 or more, chips included. No other world has a secondary color.


### Neutral
- **Engineer, the Navy Depth family:** Navy Depth (#0a192f) page; Navy Raised (#112240) cards, the skills block, the header pill; Navy Lifted (#1d3461) card hover; Navy Line (#233554) borders and the timeline; Frost (#ccd6f6) text; Slate (#8892b0) secondary text. A 40px grid of Terminal Teal at 3% is drawn over the page.
- **Creative, the Warm Paper family:** Warm Paper (#faf5ee) page; Warm Paper Deep (#f0e9df) header pill and raised surfaces; White Card (#ffffff) cards; Warm Card Hover (#f8f4ef); Sand Line (#e2d8cc) borders; Ink Navy (#1a1a2e) text; Ink Muted (#4a4a68) secondary text.
- **Avant-garde, the Charcoal family:** Charcoal (#131211) page under a 3% fractal-noise overlay; Charcoal Raised (#1c1a18) cards and chips; Charcoal Lifted (#252220) hover; Charcoal Line (#2a2725) borders; Bone (#f0ece6) text; Ash (#9a948b) secondary text. Watermark years use Bone at 4%; the marquee uses Ash at 8%.
- **Editorial, the Newsprint family:** Newsprint (#f5f5f0) page; Newsprint Deep (#eae8e1) raised; White Card (#ffffff) cards; Newsprint Card Hover (#f9f8f5); Newsprint Line (#d4d0c8) borders and hairlines; Ink (#1a1a1a) text, and the text on every Signal Orange fill; Ink Grey (#636363) secondary text: 5.49:1 on Newsprint and 4.9:1 on Newsprint Deep (it was #6b6b6b, 4.35:1 on Deep). Ghost numerals use Ink at 4% to 6%. Signal Orange Ink (#bf3900) is the world's `--accent-text`: 5.05:1 on Newsprint, 4.51:1 on Newsprint Deep, 5.53:1 on White Card, 5.2:1 on card hover.
- **Arcade, the Cabinet Black family:** Cabinet Black (#0f0d0e) page; Cabinet Plum (#1a1820) header pill; Cabinet Card (#231f20) cards; Cabinet Card Hover (#2d2829); Cabinet Line (#2a2725) borders; Cream (#f9f4da) text; Silver (#b1b4b9) secondary text.

### Named Rules
**The One Accent Rule.** Each world has exactly one accent and spends it on buttons, labels, rules, hover and selection states. Body copy, headings, and card surfaces never take the accent. Arcade's candy colors are surfaces with Cabinet Black text on them, never accents.

**The Own Palette Rule.** A world uses only its own token set. No Candy Green in Engineer, no Creative shadow in Editorial, no Terminal Teal outside the terminal.

**The Dark Text on Bright Accent Rule.** Text on an accent fill reads `--on-accent`; small text in the accent reads `--accent-text`. Teal, Lime, and Gold are light accents, so their fills take the page color, the default (11:1 to 16:1). Violet's own hero and filter fills take white (6.7:1). Signal Orange measures 3.0:1 on Newsprint and 3.3:1 under white text, so Editorial sets `--on-accent` to Ink (5.2:1) and `--accent-text` to Signal Orange Ink (#bf3900, 4.5:1 or more on every Editorial surface); in Editorial, `.text-accent`, `hover:text-accent`, and `group-hover:text-accent` all render in it. Raw Signal Orange stays on rules, outlines, fills, and text at 24px and up, which opts in through `.text-accent-display`.

## Typography

**Display Font:** per world. Engineer: JetBrains Mono (monospace). Creative: Sora (sans-serif). Avant-garde: Poppins (sans-serif). Editorial: Clash Display (sans-serif, served from Fontshare). Arcade: Bungee (sans-serif, single weight).
**Body Font:** per world. Engineer: Inter (sans-serif). Creative: Source Serif 4 (serif). Avant-garde: Inter (sans-serif). Editorial: DM Sans Variable (sans-serif). Arcade: Outfit (sans-serif).
**Label/Mono Font:** JetBrains Mono (monospace) for the design switcher label, inline code, code blocks, and all of Engineer's labels.

**Character:** The display slot carries each world's identity. Monospace reads as a prompt, Sora as a rounded modern studio, Poppins as a heavy geometric gallery wall, Clash Display as a broadsheet masthead, Bungee as a marquee sign. Body faces stay quiet and legible so the display can be loud. Every heading in a shared section resolves through the heading slot, so re-skinning changes the voice without touching a component.

### Hierarchy
- **Display** (hero name): Engineer 700, 3rem rising to 4.5rem at 768px, line-height 1. Creative 700, 3.75rem rising to 6rem, line-height 1.25, surname in Royal Violet. Avant-garde 700, clamp(2.25rem, 8vw, 6.5rem), line-height 0.95, characters staggered in. Editorial 700, clamp(2.5rem, 14vw, 9rem) below 768px and clamp(2.5rem, 10vw, 9rem) from 768px, line-height 0.9, letter-spacing -0.025em, beside a ghost "01". Arcade 400, 3rem rising to 4.5rem, uppercase.
- **Hero role line**: 1.25rem to 2.25rem depending on world, in secondary text. Engineer prefixes "> ". Arcade sets it in Bungee uppercase Coin Gold. Editorial pairs it with a 3px orange rule.
- **Role line wrapping** (every hero): the role wraps between words, never at the hyphen of "Full-Stack" (hyphenated words are kept whole).
- **Currently at** (every hero): "Currently at Seva / Appointally and AmbevTech" right under the role, derived from the roles still in progress, in secondary text with the company names in primary text (medium or semibold, never broken across lines), joined the way each language joins a list ("and" / "e", via `Intl.ListFormat`). Engineer prints it as a `//` comment in monospace; Editorial indents it to the role's first letter, beside the rule, from 640px.
- **Design invitation** (every hero, after the socials): "One portfolio, 5 designs." in secondary text at 0.875rem, then a text button "Switch to <next world>" in primary text with a 2px accent underline at a 4px offset. It switches to the next world in order through the header switcher, so it plays the same quick-change.
- **Clash word spacing** (Editorial): every heading and `.font-heading` set in Clash Display takes `word-spacing: 0.1em`, because Clash's own space measures only 0.14em. Headings that switch to the body face inline (`:not([style*='font-body'])`) are left alone.
- **Headline** (section h2): 700, 1.875rem, line-height 1.2, centered, 32px below (48px from 768px). Engineer wraps it in teal "<" and "/>". Arcade underlines it in Coin Gold, 4px thick, 8px offset.
- **Title** (card h3 and h4, company names): 700, 1.125rem, line-height 1.55 in the heading face. Editorial scales experience titles to clamp(1.5rem, 3vw, 2.5rem) and skill headings to clamp(2rem, 4vw, 3rem).
- **Body**: 400, 1rem, line-height 1.5 in About and Contact; 0.875rem, line-height 1.43 inside cards. The 896px section column gives About roughly 65 to 75 characters per line.
- **Prose** (blog article): 1.125rem, line-height 1.85, letter-spacing -0.003em, paragraphs, list items, and blockquotes capped at 40rem (about 70 characters; `ch` runs wide in DM Sans), in secondary text with headings and strong text in primary text. Inline code sits in a 6px box on the raised surface in the accent-text token. Code blocks keep Shiki's github-dark-default palette in every world on a dark panel, the `--code-bg` token: the raised surface in the dark worlds, the world's own ink in Editorial (#1a1a1a) and Creative (#1a1a2e), so every syntax token reads at 5.1:1 or more.
- **Label** (eyebrow, period, chip, tag): 500, 0.75rem, letter-spacing 0.05em. Uppercase in Creative, Avant-garde, Editorial, and Arcade; monospace and sentence case in Engineer. Hero eyebrows track wider: 0.1em in Creative, 0.3em in Avant-garde. Editorial has no eyebrow: the name is the headline on its own.
- **Mono**: JetBrains Mono at 0.875rem for Engineer's buttons and skills block; 0.75rem uppercase with 0.05em tracking for the design switcher label.

### Named Rules
**The Heading Slot Rule.** Headings never hardcode a family. They use the heading slot (`--font-heading`) so a world can swap the voice in one token.

**The Loud Display, Quiet Body Rule.** Identity lives in the display size and face. Body and label sizes stay between 0.75rem and 1.125rem in every world.

## Layout

A single centered column at medium density with the same section order in every world: Hero, About, Experience, Education, Skills, Projects, Contact. Avant-garde inserts a ghosted marquee band after the hero and again before Contact.

- **Header:** fixed and full width, 24px horizontal and 12px vertical padding, content capped at 1152px. The background is the page color at 80% behind a 12px backdrop blur, with a 1px bottom border. Left: the "<A4 />" mark in the heading face and accent. Center from 768px: on the home (`/` and `/pt/`) five section anchors, a 1px vertical divider, then Blog; on every other page (blog, 404) Home and Blog. Right: the design switcher pill, the PT/EN toggle, and a hamburger below 768px. Main content starts 64px down.
- **Hero:** at least one viewport tall. Engineer and Arcade center everything. Creative is a two-column grid at 1152px (text beside a 320px portrait composition, hidden below 768px). Avant-garde and Editorial left-align inside 1152px with 24px padding, 48px from 768px.
- **Sections:** 48px vertical padding below 768px and 80px from 768px, 896px maximum width, 24px horizontal padding, centered h2 with 32px below (48px from 768px).
- **About:** 128px round portrait with a 2px accent border, two paragraphs, then a four-column stat grid (two columns below 768px) with 16px gaps. Editorial instead runs a front-page lede in a 2fr/1fr grid from 768px: a byline (56px square portrait, name and title over a hairline), the first paragraph as the standfirst at 1.25rem rising to 1.5rem in primary text opening on a Signal Orange drop cap in the display face (3.6em, `.editorial-lede`), the second paragraph in secondary text; beside it a "By the numbers" column opened by the 3px orange rule, the four figures in the display face at 2.25rem rising to 3rem over their labels, separated by hairlines (two columns below 768px).
- **Experience:** per world. Engineer: vertical timeline with 12px ring nodes on a 1px line, sub-roles indented 16px behind a left border; each role prints its result as an always-visible monospace `=> ` line in primary text, its bullets and stack behind its own `[+] details` toggle. Creative: a wrapping row of pill tabs above one 32px-padded card. Avant-garde: stacked cards with 24px gaps, a 3px accent left edge, a ghost year watermark, and descriptions capped at 65ch; each role's result sits on the card in primary text at medium weight (a sub-role's result after its name in small secondary caps), then a "Details" text button in accent uppercase at 0.2em tracking (`aria-expanded`) opens the bullets (0.875rem, capped at 65ch of that size) and the stack. Editorial: each role is a news item, 48px apart in a 1fr/2fr grid from 768px, opened by a hairline that draws in. The left column holds the ghost number and the dateline (the period in 0.75rem semibold caps, 0.15em tracking); the right holds the company headline, the role in accent text, then the lede: the role's result at 1.125rem medium in primary text (or its summary when it has none), its summary beneath in secondary text, and a "Details" text button (2px accent underline, `aria-expanded`) that opens the bullets and the stack. Sub-roles sit behind a 1px Newsprint Line rule, 20px in, each with its own dateline, headline, lede and toggle. Arcade: stacked candy cards with 16px gaps; each role's result sits on the card face in semibold, the bullets and stack behind a details toggle.
- **Education and Projects:** Education is a card grid with 24px gaps, two columns from 768px. Professional work is told in Experience, and the hero's main action ("View my work") leads there; since 2026-10-11 Projects keeps only the personal and open-source repositories (the ruled lines that repeated each professional project and pointed back to Experience are gone). Personal projects are cards from 640px (three columns from 1024px); below 640px they are ruled lines too (title and repository link on one row, the description beneath, no icon or tags).
- **Skills:** per world. Engineer: one JSON-formatted block. Creative: centered filter pills over a centered pill cloud, opening on the first category (Backend); "All" shows the full cloud. Avant-garde: seven numbered rows with a hairline, chips wrapping at 8px. Editorial: giant headings alternating left and right with hairlines, 48px apart. Arcade: a candy grid, two columns from 640px and three from 1024px.
- **Contact:** a 672px centered column: a direct first-person line, the full-width accent "Email me" button (`--on-accent` text), then a row (stacked below 640px) with the address in primary text, selectable in one click, beside a bordered "Copy" chip, and the CV as a text link with a 2px accent underline. Every world uses it, Editorial included (its colophon was retired on 2026-10-11 at the user's request).
- **Footer:** 1px top border, 32px vertical padding, social icons at 24px gap, then two 12px lines. Editorial instead prints a masthead's other end: the 3px orange rule, then three columns from 768px (name in the display face and title; the edition with the year, the copyright and the build line; the socials and the design invitation).
- **Blog:** the list runs 768px wide, with tag filters only once a language has four or more posts; the article runs 1024px wide with a breadcrumb, a lede capped at 40rem, an optional 340px cover, a collapsible table of contents, prose, a share row, and a related-posts grid. Inside the article, prose paragraphs, list items, and blockquotes cap at 40rem; code blocks, tables, and images take the full width. The table of contents is a 1px-bordered container at the card radius on the card surface, with no side stripe. Blockquotes are a 1px accent rule with a 1.5rem indent, italic in primary text, with no fill and no radius.
- **Breakpoints:** 640px, 768px (navigation, most grids), 1024px (three-column grids, the switcher's glyph and world name).
- **Rhythm:** a 4px scale. Reused steps are 4, 8, 16, 24, 32, 48, and 80px.
- **Mobile:** navigation collapses to a hamburger; a 256px panel slides in from the right over a 50% black backdrop with body scroll locked. The design switcher reads "Design" below 1024px. The header pads 16px at the sides below 640px (24px from 640px) and its controls sit 8px apart, so it fits a 320px phone in every world.

### Named Rules
**The Same Bones Rule.** Section order, container widths, and the About, Education, Projects, and Contact structures stay shared by default. A world forks a section only when its identity needs it: every world forks Hero, Experience, and Skills, and since 2026-10-11 Editorial also stages its own About and footer (the user decided to keep all five worlds and differentiate them; Editorial's own Contact was retired the same day at the user's request, so Contact is shared by all five). A fork lives inside the shared section, so anchors stay unique: the shared markup carries `data-design-hide="<world>"` and the world's version `data-design-show="<world>"`.

**The 896 Rule.** Section content lives in an 896px column. Only the header and the hero widen to 1152px.

## Elevation & Depth

There is no system-wide elevation model; each world decides. Four of the five convey depth with 1px borders and one step of surface tone (page, raised, card, card hover). Creative is the only world that lifts.

- **Engineer:** flat. Borders in Navy Line and one raised tone. The only depth cue is the 40px grid drawn on the page.
- **Creative:** lifted. Cards carry a soft ambient shadow, the portrait a deep one, chips a hairline shadow that grows on hover. Cards and chips also rise 4px on hover.
- **Avant-garde:** flat with glow. Borders in Charcoal Line, a 3% noise overlay for material, and a 16px Acid Lime glow at 12% on chip hover.
- **Editorial:** flat, hairline only. Depth comes from ghost numerals at 4% to 6% and hairlines that draw in on reveal.
- **Arcade:** flat and saturated. Candy surfaces sit directly on Cabinet Black with no border or shadow.

Floating layers (the design dropdown, the mobile panel, blog card hover) use one soft shadow in every world.

### Shadow Vocabulary
- **Creative card** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): the experience card, the About portrait, and blog card hover.
- **Creative portrait** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): the hero portrait only.
- **Creative chip** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`, hover `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): skill pills.
- **Floating menu** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): the design dropdown in every world.
- **Mobile panel** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): the slide-in navigation.
- **Acid Lime glow** (`box-shadow: 0 0 16px rgba(197, 255, 65, 0.12)`): Avant-garde chip hover.

## Shapes

Corner language is a per-world token pair (card radius, button radius) drawn from one shared scale.

- **Engineer:** 2px on cards, buttons, and chips. Square timeline geometry; the 12px ring nodes are its only circles.
- **Creative:** 16px cards and full pills for buttons, chips, tabs, and badges. Concentric circles around the portrait.
- **Avant-garde:** 8px cards, 4px buttons and chips. The 3px card edge and the 1px hero rule are its signature lines.
- **Editorial:** 0px everywhere. 2px outlined buttons, 1px hairlines, a 3px accent rule. Tech tags are underlines, not boxes.
- **Arcade:** 12px candy cards and full pills for buttons and chips.
- **Shared:** the portrait and social icon circles are full; the design dropdown, mobile menu links, and code blocks are 8px; the blog cover takes the world's card radius; inline code is 6px; the language toggle is 6px; the focus ring is 2px.

### Named Rules
**The Two-Radius Rule.** A world declares exactly two radii, `--radius-card` and `--radius-btn`. Chips, tags, and filters borrow the button radius; containers borrow the card radius.

## Components

Shared components read the tokens and adapt on their own. Hero, Experience, and Skills are bespoke per world.

### Buttons
Two variants everywhere, a filled primary and an outlined secondary, side by side in the hero with a 16px gap, 12px vertical padding, and 20 to 24px horizontal padding (32px from 640px).
- **Engineer:** monospace 0.875rem. Primary fills Terminal Teal with Navy Depth text; secondary is a 1px teal outline with teal text and a 10% teal hover wash. Radius 2px.
- **Creative:** 0.875rem medium. Primary fills Royal Violet with white text; secondary is a 2px violet outline. Both scale to 1.05 on hover. Full pill.
- **Avant-garde:** 0.875rem semibold uppercase with 0.05em tracking. Primary fills Acid Lime with Charcoal text and brightens on hover; secondary outlines lime with a 10% wash on hover. Radius 4px.
- **Editorial:** 0.875rem semibold uppercase. Primary is a 2px Ink outline that fills Signal Orange with Ink text (`--on-accent`) on hover; secondary is a 2px orange outline with its label in Signal Orange Ink that fills the same way. No radius.
- **Arcade:** 0.875rem bold uppercase with 0.025em tracking. Primary fills Coin Gold with Cabinet Black text; secondary is a 2px gold outline. Full pill.
- **Contact button:** a full-width accent fill with `--on-accent` text: the page color in every world, Ink in Editorial.
- **Copy chip (Contact):** a bordered 0.75rem chip in secondary text, accent on hover, beside the address. It reads "Copy", then "Copied" for 2.5s; when the clipboard is blocked it selects the address and reads "Selected, copy it" instead. Each state is announced through a polite status region.
- **Focus:** a 2px accent outline with 2px offset in every world.

### Chips
- **Tech tag (shared):** 1px border in the border token, secondary text at 0.75rem, 8px horizontal and 2px vertical padding, the button radius. Creative instead uses a 10% accent tint with accent text and 12px by 4px padding. Editorial drops the box for a bottom border that turns accent on hover.
- **Skill chip:** Engineer prints skills as JSON strings. Creative uses white pills with a border, 16px by 8px padding, a spring entrance, and a 1.1 scale lift on hover. Avant-garde uses raised chips whose border, text, and glow turn lime on hover. Editorial uses plain 0.875rem text with a hover underline. Arcade uses Cabinet Black 15% pills on candy.
- **Filter and tab:** the selected state fills the accent with white text (Creative) or takes an accent border, accent text, and a 10% accent tint (blog tag filters). Unselected is a bordered pill in secondary text whose border turns accent on hover.
- **Period badge (Creative):** a 10% violet tint pill with violet text.

### Cards / Containers
- **Corner Style:** the world's card radius (2, 16, 8, 0, or 12px).
- **Background:** the card token, white on paper worlds and one tone above the page on dark worlds.
- **Border:** 1px in the border token. Project and blog cards shift it to accent at 50% on hover.
- **Shadow Strategy:** none, except Creative (see Elevation & Depth).
- **Internal Padding:** 24px; 32px for Creative's experience card and for Avant-garde cards from 768px.
- **Stat tile:** centered, accent number at 1.5rem bold in the heading face over a 0.875rem secondary label.
- **Blog card:** optional 192px cover, 24px padding, accent date beside a 0.875rem read time, a 1.25rem title that turns accent on hover, tag chips, and an accent "Read more" whose arrow gains 4px of gap on hover. The card rises 4px with a soft accent-tinted shadow.

### Inputs / Fields
None. Contact is a `mailto:` button by product decision.

### Navigation
- **Desktop links:** 0.875rem in secondary text, accent on hover, 24px apart, hidden below 768px. Section anchors on the home only; Home and Blog everywhere else, the 404 included.
- **Design switcher:** a pill with a 1px border on the raised surface, a monospace 0.75rem uppercase label that reads "Design" below 1024px and the world's glyph ("01", "//", "{ }", "~", a joystick) plus its name from 1024px, and a chevron that rotates 180 degrees when open. A disclosure, not a listbox: the panel drops 8px below at 224px wide, 8px radius, and the floating shadow, opens with one 0.75rem secondary line ("Same content, 5 designs") over a hairline, then lists the worlds in order as toggle buttons (aria-pressed) at 0.875rem with a 10% accent hover wash, the current one in accent with a check mark. Escape closes it and returns focus to the pill.
- **Header controls on phones:** the design switcher, the language chip and the menu toggle are 44px tall below 768px, inside the same 64px bar (10px vertical padding).
- **Thumb-sized controls (phones):** below 768px every link and button on the home measures at least 44px in both directions: the logo, the hero social chips, the "Switch to" invitation, every Details toggle (with an 8px side pad so the focus ring clears the label), Creative's tabs and skill filters, Avant-garde's skill rows, the Copy chip and the Contact CV link. Icon-only links keep their 20px icon inside a 44px hit area: 12px of padding with a matching negative margin on project cards, 44px boxes 4px apart in the footer. From 768px they return to their compact sizes. `tests/touch.spec.ts` checks it in every world but Engineer, which is being reworked on another branch.
- **Selected states:** every toggle that filters or selects (blog tag filters, Creative tabs and skill filters, Avant-garde skill rows, the design switcher) carries `aria-pressed`, so selection is never colour alone.
- **Language toggle:** a 0.75rem bordered chip reading "PT" or "EN", 6px radius, 44px square below 768px. Its accessible name starts with the visible label ("PT: Switch to Portuguese").
- **Mobile:** a 20px three-bar hamburger in a 44px target that folds into an X; a 256px right panel, a modal dialog (`role="dialog"`, `aria-modal`) that keeps Tab inside while open, that carries its own 44px close button (focused on open), 12px-padded links (the section anchors on the home, Home elsewhere), a divider before Blog, and at its foot the CV as a bordered button in primary text and the email address beside a mail icon.
- **Skip link:** an accent pill with `--on-accent` text that drops into view on focus.
- **Socials:** GitHub, LinkedIn, Dev.to, and Email, read from `src/data/social.ts`, as bordered button-radius chips in every hero (icon, plus the name from 640px; Email keeps its word, "Email" / "E-mail", at every width because it is the action) and as bare icons in the footer. External links open a new tab; the `mailto:` link never does. Dev.to shows its own logo wherever it appears (hero chips and footer).
- **Reading progress (blog):** a 4px accent bar fixed at the top.

### Signature Components
- **Engineer terminal hero:** a teal "Hi, my name is" eyebrow, the monospace name, "> " before the role, and a "$" prompt that types the tagline at 30ms per character behind a pulsing "_" caret.
- **Engineer JSON skills:** the whole skill set rendered as a JSON object in a 2px-radius block: keys in teal, values in Frost, punctuation in Slate.
- **Creative portrait halo:** a 320px composition of a pulsing violet blur, a 20%-to-transparent gradient disc, and two rings at 20% and 40% violet around a 224px round portrait.
- **Avant-garde particle field:** 200 Acid Lime points (80 on mobile) with faint connection lines under 1.8 units, drifting and repelled by the cursor, on a transparent WebGL canvas with a CSS fallback of 40 pulsing dots.
- **Avant-garde cursor:** on fine pointers a 32px lime ring trails the native cursor with a 0.15 lerp and grows to 48px over links and buttons as a `scale` eased in the same frame loop (0.2 per frame), so nothing re-lays out. The native cursor stays visible, so the visitor's pointer size and contrast settings keep working.
- **Avant-garde marquee:** a 30s linear loop of uppercase capability words at clamp(2rem, 5vw, 3.75rem) in Ash at 8%, running left after the hero and right before Contact.
- **Editorial ghost numerals:** "01" at clamp(10rem, 25vw, 18rem) beside the hero name, entry numbers at clamp(3rem, 5vw, 4.5rem) in Ink at 6%, and a 3px orange rule that scales in from the left.
- **Arcade candy stack:** each experience or skill card takes the next candy surface in sequence, a 1.5rem emoji, a Bungee uppercase title, and Cabinet Black text; experience cards keep each result on the face and hide the bullets and stack behind a "▼ details" toggle.
- **Intro curtain:** a full-screen entrance played on the home's first hard load of the session (`/` or `/pt/`; `sessionStorage` remembers it). Deep links, reloads later in the session, in-site navigation and reduced-motion visitors skip it, and a wheel or swipe over it ends it at once instead of being swallowed. One authored moment per world, each ending with an exit that opens onto the hero already animating in. Avant-garde: the name sharpens out of blur, a 1px Acid Lime rule draws, the stage splits top and bottom. Engineer: a prompt types `./akira --init`, two output lines print, the screen collapses to a line like a CRT switching off. Creative: the halo finds its portrait. Violet rings ripple out on Warm Paper to the exact geometry of the hero's portrait halo, the name rises beneath in Sora with "Akira" in Royal Violet, then the halo glides to where the portrait lands while the paper dissolves (below 768px it dissolves inward behind the name instead). Editorial: a 3px Signal Orange rule, already a stub on the first frame, draws across Newsprint beside the ghost "01", then the sheet turns upward onto the hero's own "01"; it sets no type that needs its face, so it skips the font wait (`data-intro-no-font-wait`) and plays at once. Arcade: "READY?" pops and blinks in Bungee, then the five candy bars sweep in from the left and out to the right. Click, Escape, a wheel or a swipe skips it. Lives in `src/components/common/SiteIntro.astro`; heroes hydrate on its reveal event via the `client:intro` directive.
- **Quick-change (theme switch):** the same curtain staged short. On a switch the curtain wears the incoming world's tokens, fades in over 0.15s, the theme swaps underneath, and only that world's exit gesture plays: the stage splits (Avant-garde), the screen switches off (Engineer), the halo glides to the portrait (Creative), the sheet turns (Editorial), the candy bars sweep out (Arcade). No title card, no name. 0.65s to 0.8s in total. Reduced motion, a curtain already running, or an unknown world fall back to the 0.3s crossfade.

### Motion
- **Reveal:** every section and card fades in and rises 30px over 0.5s with ease-out, once, when it is 50px into view. Siblings stagger by 0.1s, or 0.03s to 0.05s for chips and characters.
- **World switch:** the quick-change curtain, 0.65s to 0.8s, staged as the incoming world's exit gesture; a 0.3s View Transition crossfade under reduced motion or as fallback.
- **Hover:** color transitions at 150ms. Creative scales buttons to 1.05 and lifts chips 4px; cards lift 4px.
- **Menus:** the dropdown fades and scales from 0.95 over 0.15s; the mobile panel slides over 0.3s behind a 0.2s backdrop.
- **Hero signatures:** Engineer's typewriter; Avant-garde's 0.03s character stagger and a rule that scales in over 0.8s; Editorial's 0.15s word stagger on the name with parallax (name -80px, subtitle -40px across the hero's scroll), while the rule, role, employer line, tagline and actions follow within 0.15–0.5s so the role is legible in about 0.7s; Creative's portrait scaling from 0.8 over 0.8s.
- **Intro curtain:** 1.65s to 1.9s per world, fonts awaited up to 700ms first; heroes hydrate when the exit begins (0.95s to 1.35s) so the curtain opens on a hero mid-entrance.
- **Reduced motion:** CSS animations and transitions collapse to 0.01ms and smooth scrolling is disabled. Motion's JavaScript animations are reached separately: `src/lib/reduced-motion.ts`, imported by a BaseLayout script, sets `MotionGlobalConfig.skipAnimations`, so every Motion animation jumps to its end state.
- **No JavaScript:** a `<noscript>` style in BaseLayout forces any element whose inline style starts at opacity 0 or `scaleX(0)` to full opacity with no transform, so Motion's server-rendered start states (including Editorial's rule) never hide the page. If a hero island throws, its ErrorBoundary renders a static fallback with the name, the role, the CV and the email instead of nothing.
- **Language on the server:** every island takes the page's `locale` as a prop (`withServerLocale`), so `/pt/`, `/pt/blog/` and Portuguese posts render in Portuguese before hydration and without JavaScript, in hidden worlds too; the logo, Home and Blog links stay in the page's language.
- **Accessible names in animated type:** a display name split into per-letter spans for its entrance (Avant-garde) carries the whole name once in an `sr-only` span and hides the letters from assistive tech; word-split names (Editorial) keep real spaces between the words.

## Do's and Don'ts

### Do:
- **Do** declare a new world with the nine color tokens, two font slots, and two radii on its `[data-design]` selector (overriding `--on-accent` or `--accent-text` only if its accent misses 4.5:1), register it in `src/data/designs.ts`, and add it to the anti-FOUC allowlist.
- **Do** keep the accent on buttons, labels, rules, and states (The One Accent Rule), and set text on an accent fill with `text-on-accent`, never a hardcoded white or page color.
- **Do** treat Signal Orange as a display color: rules, outlines, fills with Ink text, and text at 24px and up through `.text-accent-display`. Small orange text goes through `--accent-text` (Signal Orange Ink, #bf3900); raw Signal Orange measures 3.0:1 on Newsprint and 3.3:1 under white text.
- **Do** resolve headings through the heading slot and body through the body slot; only Engineer's labels and the shared code face name JetBrains Mono directly.
- **Do** render both locales in every text node behind `data-lang-show` so the language toggle never re-renders.
- **Do** respect `prefers-reduced-motion`, and make new motion join the reveal grammar (fade, 30px rise, 0.5s, once).
- **Do** fork a shared section only when a world's identity needs it, inside the shared section with `data-design-hide` / `data-design-show` (The Same Bones Rule).
- **Do** mount a WebGL scene only while its world is active, calibrate a lighter phone build, and ship a CSS fallback, as Avant-garde does.

### Don't:
- **Don't** mix tokens across worlds. No candy surface in Engineer, no Creative shadow in Editorial, no Terminal Teal outside Engineer (The Own Palette Rule).
- **Don't** fork content per world. Copy, data, order, and links come from `src/data` and `src/i18n` only; a world may restage them, never rewrite or reorder them.
