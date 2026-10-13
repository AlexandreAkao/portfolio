# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** recruiters and hiring managers in Brazil and Latin America evaluating Alexandre Akira for senior full-stack roles. They arrive from LinkedIn, a CV link, dev.to, or a referral, often on a phone and between other candidates. They need to judge seniority, range, and credibility fast, and they read both Portuguese and English.

**Secondary (by repository evidence, not separately confirmed):** engineers who find the blog through dev.to cross-posts or GitHub.

## Product Purpose

Personal portfolio and blog for Alexandre Akira, Senior Software Engineer ("Desenvolvedor de Software Sênior" in Portuguese), live at https://alexandreakira.dev. Sections: Hero, About, Experience, Education, Skills, Projects, Contact, plus a bilingual Blog.

**Success is a craft impression.** The visitor explores the site, switches between designs, and leaves remembering someone with range and taste. The hiring contact (email or CV download) follows from that impression rather than replacing it.

## Positioning

One body of content rendered through eight complete, switchable visual identities (Editorial as default since 2026-10-10, then Avant-garde, Engineer, Creative, Arcade, Terminal, Tape, Cartoon). The site demonstrates frontend range alongside backend depth: a SaaS with 26 independent services, a warehouse system for 200+ distribution centers, and applied AI work with RAG and LLM integration.

**Confirmed decision (2026-10-10):** keep all five designs and differentiate them, rather than consolidate. The 2026-10-10 re-critique found them sharing one template (identical hero stacks; About, Education, Projects and Contact shared across worlds at 41–61% of page height; Engineer recognisable as a widely cloned template). Future work deepens each world's own staging instead of removing worlds; no design is removed without an explicit decision.

**Confirmed decision (2026-10-11):** Engineer was restaged as an Internet-Draft read in a pager (it had been recognisable as Brittany Chiang's v4 template), and two worlds from the same direction round were added rather than discarded: Terminal (a dark shell session, the category standard played straight) and Tape (punched teletype paper tape; "Fita" in Portuguese). The site now has seven worlds.

**Confirmed decision (2026-10-11):** an eighth world, Cartoon ("Desenho" in Portuguese), was added at the user's request: a 1960s cartoon's opening titles, chosen by the user from a direction round (seed aae49696). It carries a caricature of Alexandre drawn in SVG from the avatar, which the user asked for. It is a homage to the era's style, never to its characters.

## Operating Context

- Entry points: LinkedIn (linkedin.com/in/alexandre-akao), dev.to (alexandreakira), GitHub (alexandreakao), and the CV link.
- Blog posts cross-post to dev.to through RSS (`/rss.xml` and `/pt/rss.xml`), which carry the full Markdown-rendered body. Post content must read cleanly outside the site's styling.
- Design choice persists in `localStorage` (`design`); language persists in `localStorage` (`lang`) and can be forced with `?lang=pt`. Both are applied before first paint.
- CVs on hand: `public/resume/Alexandre_Akira_en_CV.pdf` and `public/resume/Alexandre_Akira_ptbr_CV.pdf`. Downloads follow the active language in heroes, Contact, and the mobile menu, including without JavaScript.
- Contact is a `mailto:` button to the address in `src/data/social.ts`.

## Capabilities and Constraints

- Static Astro 5 site with React 19 islands, Tailwind CSS v4, Motion, and Three.js for the Avant-garde design. No server, no form handler, no analytics configured.
- Locales: English is the default at `/`, Portuguese at `/pt/`. **Confirmed decision:** keep English as the default locale. Portuguese is a full peer with content parity, not a fallback.
- Design registry lives in `src/data/designs.ts`. All designs render at once and CSS visibility toggles the active one via `data-design`. Adding a design means registry entry, per-section components, and tokens (see CLAUDE.md).
- Shared content lives in `src/data/*.ts` (experience, education, skills, projects, social) and `src/i18n/*.json`. Designs consume it; they never fork it.
- **Confirmed decision:** the mailto button is the contact mechanism. The form strings that went unused (`contact.name`, `contact.email`, `contact.message`) were removed on 2026-10-10; Contact now pairs the mailto button with the visible address (with copy) and the CV.
- Terminology: English copy says "Engineer", not "Developer" (enforced via PR #1). The main title is "Senior Software Engineer" in English and "Desenvolvedor de Software Sênior" in Portuguese (user decision, 2026-10-13). Experience titles keep their role-specific wording; FUNCAP is "Undergraduate Research Fellow" / "Bolsista de Iniciação Científica".
- No linter or test runner is configured.

## Brand Commitments

- Name: Alexandre Akira. Title: Senior Software Engineer / Desenvolvedor de Software Sênior.
- Tagline in copy: "Building scalable distributed systems, modern web applications, and AI-powered solutions."
- Voice as written: first person, direct, confident, metric-led.
- Assets: avatar at `src/assets/images/avatar.jpeg` (also `public/images/avatar.jpeg` for Open Graph), favicon at `public/favicon.svg`. No logo or wordmark beyond the name.

## Evidence on Hand

All figures below were confirmed accurate as written by the user.

- Working in the industry since 2018; the confirmed 8+ years metric remains. Listed roles begin Aug 2019.
- Two concurrent current roles: Seva / Appointally (Apr 2025 to present) and AmbevTech (Nov 2020 to present).
- Metrics: 26 independent services (Appointally); 200+ distribution centers and 18% lower infrastructure costs (AmbevTech WMS); 52 components across 10+ apps with 95%+ test coverage (AmbevTech UIKit); multi-country LATAM rollout (BEES B2B). The previously confirmed 40% order-processing reduction remains in WMS details.
- Education: postgraduate degree in Applied AI Engineering (UNIPDS, May 2024 to May 2025); MBA in Full-Stack Development (Sirius, May 2024 to May 2025); Bachelor's in Computer Science (UNIFOR, Jan 2018 to Jan 2022).
- Languages: native Brazilian Portuguese and C1 English.
- Work details: Seva is remote, part-time, Canada; AmbevTech / AB InBev is remote, Brazil. NATI projects are Athena (quizzes) and Banca (Journalism publishing); FUNCAP research is Unifall (fall detection with Python and Machine Learning).
- Blog: two posts per locale ("Clean Architecture in Microservices", 2025-03-15; "ES6, ES7, ES8... What Feature Is That?", 2023-11-18). One cover image at `src/assets/images/blog/es6-es7-es8-cover.png`.
- Personal projects: DevTray (native macOS utilities, https://devtray.app); Ordenados (ITO-inspired digital card game with Next.js, Supabase, and WebSocket); Azure Open PR (React/Vite Chrome extension); Design Patterns TS (retained as complementary work).
- Current CV PDFs in English and Portuguese, copied from `../resume-cv` on 2026-10-13. Both `.tex` sources informed the content update; extra skills, BEES/UIKit dates, and previously confirmed complementary metrics were retained with the user's approval.

**Absences that future work must not fabricate:** no testimonials or recommendations, no client logos, no case-study write-ups beyond the experience bullets, no live URLs or screenshots for professional projects (they are internal enterprise systems), no analytics or traffic data.

## Product Principles

1. **The site is the proof.** Range is shown, not told. Each section should make the craft impression before it makes a claim.
2. **Two languages, one product.** Portuguese gets parity in content, copy quality, and features. Nothing ships in one locale only.
3. **Metrics over adjectives.** Keep the confirmed numbers in front. Never add a number that is not in Evidence on Hand.
4. **Recruiter speed inside any skin.** A phone skim must surface seniority, current role, and how to reach out within seconds, in every design.
5. **Shared content, swappable presentation.** Product truth lives in `src/data` and i18n. Designs consume it and never diverge from it.
