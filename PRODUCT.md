# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** recruiters and hiring managers in Brazil and Latin America evaluating Alexandre Akira for senior full-stack roles. They arrive from LinkedIn, a CV link, dev.to, or a referral, often on a phone and between other candidates. They need to judge seniority, range, and credibility fast, and they read both Portuguese and English.

**Secondary (by repository evidence, not separately confirmed):** engineers who find the blog through dev.to cross-posts or GitHub.

## Product Purpose

Personal portfolio and blog for Alexandre Akira, Senior Full-Stack Engineer, live at https://alexandreakira.dev. Sections: Hero, About, Experience, Education, Skills, Projects, Contact, plus a bilingual Blog.

**Success is a craft impression.** The visitor explores the site, switches between designs, and leaves remembering someone with range and taste. The hiring contact (email or CV download) follows from that impression rather than replacing it.

## Positioning

One body of content rendered through five complete, switchable visual identities (Avant-garde as default, then Engineer, Creative, Editorial, Arcade). The site is itself the demonstration of frontend range instead of a claim about it, paired with backend depth (a 19-microservice SaaS, a warehouse system for 200+ distribution centers) that a frontend-only portfolio cannot truthfully show. The confirmed self-description in copy: "the intersection of backend robustness and frontend elegance."

**Open decision:** whether all five designs remain long-term. The user is open to consolidating later. Future work must neither assume the switcher is permanent nor remove a design without an explicit decision.

## Operating Context

- Entry points: LinkedIn (linkedin.com/in/alexandre-akao), dev.to (alexandreakira), GitHub (alexandreakao), and the CV link.
- Blog posts cross-post to dev.to through RSS (`/rss.xml` and `/pt/rss.xml`), which carry the full Markdown-rendered body. Post content must read cleanly outside the site's styling.
- Design choice persists in `localStorage` (`design`); language persists in `localStorage` (`lang`) and can be forced with `?lang=pt`. Both are applied before first paint.
- CV on hand: `public/resume/Alexandre_Akira_en_CV.pdf` (English only).
- Contact is a `mailto:` button to the address in `src/data/social.ts`.

## Capabilities and Constraints

- Static Astro 5 site with React 19 islands, Tailwind CSS v4, Motion, and Three.js for the Avant-garde design. No server, no form handler, no analytics configured.
- Locales: English is the default at `/`, Portuguese at `/pt/`. **Confirmed decision:** keep English as the default locale. Portuguese is a full peer with content parity, not a fallback.
- Design registry lives in `src/data/designs.ts`. All designs render at once and CSS visibility toggles the active one via `data-design`. Adding a design means registry entry, per-section components, and tokens (see CLAUDE.md).
- Shared content lives in `src/data/*.ts` (experience, education, skills, projects, social) and `src/i18n/*.json`. Designs consume it; they never fork it.
- **Confirmed decision:** the mailto button is the contact mechanism. The form strings that went unused (`contact.name`, `contact.email`, `contact.message`) were removed on 2026-10-10; Contact now pairs the mailto button with the visible address (with copy) and the CV.
- Terminology: English copy says "Engineer", not "Developer" (enforced via PR #1). Deliberate exceptions: "junior developers" in the NATI bullet and "Research Scholarship - Developer" for FUNCAP.
- No linter or test runner is configured.

## Brand Commitments

- Name: Alexandre Akira. Title: Senior Full-Stack Engineer.
- Tagline in copy: "Building scalable distributed systems and crafting delightful user experiences."
- Voice as written: first person, direct, confident, metric-led.
- Assets: avatar at `src/assets/images/avatar.jpeg` (also `public/images/avatar.jpeg` for Open Graph), favicon at `public/favicon.svg`. No logo or wordmark beyond the name.

## Evidence on Hand

All figures below were confirmed accurate as written by the user.

- 8+ years of experience. Earlier experience exists beyond the listed roles, which begin Aug 2019.
- Two concurrent current roles: Seva / Appointally (Apr 2025 to present) and AmbevTech (Nov 2020 to present).
- Metrics: 19 microservices (Appointally); 200+ distribution centers and a 40% order-processing reduction (AmbevTech WMS); 52 components across 10+ apps with 95%+ test coverage (AmbevTech UIKit); multi-country LATAM rollout (BEES B2B).
- Education: MBA in Full-Stack Development (Rocketseat / Sirius, 2024 to 2025); Bachelor's in Computer Science (UNIFOR, 2018 to 2022).
- Blog: two posts per locale ("Clean Architecture in Microservices", 2025-03-15; "ES6, ES7, ES8... What Feature Is That?", 2023-11-18). One cover image at `src/assets/images/blog/es6-es7-es8-cover.png`.
- Five personal repos on GitHub: Ordenados, Azure Open PR, Design Patterns TS, Particle Website, Space Themed Website.
- CV PDF in English.

**Absences that future work must not fabricate:** no testimonials or recommendations, no client logos, no case-study write-ups beyond the experience bullets, no live URLs or screenshots for professional projects (they are internal enterprise systems), no Portuguese CV, no analytics or traffic data.

## Product Principles

1. **The site is the proof.** Range is shown, not told. Each section should make the craft impression before it makes a claim.
2. **Two languages, one product.** Portuguese gets parity in content, copy quality, and features. Nothing ships in one locale only.
3. **Metrics over adjectives.** Keep the confirmed numbers in front. Never add a number that is not in Evidence on Hand.
4. **Recruiter speed inside any skin.** A phone skim must surface seniority, current role, and how to reach out within seconds, in every design.
5. **Shared content, swappable presentation.** Product truth lives in `src/data` and i18n. Designs consume it and never diverge from it.
