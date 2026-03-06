# 🔍 Design Auditor

**Paste a URL. Get 5 ranked fixes to improve conversions.**

Design Auditor analyzes web pages for conversion effectiveness, performance, accessibility, and design quality. It's like Grammarly for landing pages — paste your URL, get told what's hurting your conversions, see exactly how to fix it.

## Quick Start

### As a Copilot CLI Skill

```
> audit https://myproduct.com
```

The auditor will:
1. Screenshot your site at 3 viewports (desktop, tablet, mobile)
2. Run Lighthouse for performance + accessibility scoring
3. Analyze layout, CTA placement, visual hierarchy, social proof
4. Generate a ranked report with concrete fixes and reference examples

### As a Script

```bash
# Install dependencies
npm install

# Run the audit
node scripts/audit.js https://myproduct.com

# With options
node scripts/audit.js https://myproduct.com --output-dir ./my-audit --vertical saas
```

## What It Checks

| Category | Points | What's Analyzed |
|----------|--------|----------------|
| Performance | /25 | LCP, CLS, FID, page weight, image sizes |
| CTA Effectiveness | /20 | Above fold? Contrast? Size? Visible? |
| Visual Hierarchy | /15 | H1 count, heading order, content flow |
| Accessibility | /15 | WCAG 2.1 AA, axe-core violations |
| Social Proof | /10 | Testimonials, logos, trust signals |
| Mobile Readiness | /10 | Tap targets, font size, responsive |
| Image Optimization | /5 | Alt text, modern formats, compression |

## Output

`DESIGN-AUDIT.md` — a scored report with:
- 🔴 **P1** fixes (directly hurting conversions)
- 🟡 **P2** fixes (missed opportunities)
- 🟢 **P3** fixes (nice to have)

Every finding includes: what's wrong, why it matters, how to fix it (with code), and a reference site that does it well.

## Reference Corpus

50 curated high-converting sites across 5 verticals:
- **SaaS** — Stripe, Linear, Vercel, Notion, Figma, Cal.com, Resend, Clerk, PlanetScale, Supabase
- **E-commerce** — Apple, Allbirds, Glossier, Warby Parker, Everlane, Casper, Away, Mejuri, Brooklinen, Bombas
- **Creator** — Brian Lovin, Lee Rob, swyx, Maggie Appleton, Josh Comeau, Paco, Rauno, Linus, Cassie Evans, Chris Coyier
- **Agency** — Basecamp, 37signals, Ueno, Basic, Fantasy, MetaLab, Work & Co, Pentagram, Instrument, Huge
- **Dev Tools** — GitHub, Tailwind, Astro, Turso, Railway, Fly.io, Deno, Bun, Neon, Upstash

## Configuration

Edit `config.yml` to customize:
- Viewports (add/remove breakpoints)
- Scoring weights per category
- Lighthouse run count
- Finding limits
- Output paths

## Project Structure

```
design-auditor/
├── SKILL.md                          # Main auditor prompt (the brain)
├── AGENTS.md                         # AI agent working guide
├── config.yml                        # Tunables
├── reference-corpus.yml              # 50 curated reference sites
├── scripts/
│   ├── capture.js                    # Playwright capture + DOM extraction
│   └── audit.js                      # Pipeline orchestrator
├── templates/
│   └── design-audit-template.md      # Report format
├── docs/
│   └── dark-factory-v2.md            # Future Dark Factory integration notes
└── .github/
    └── copilot-instructions.md       # Copilot coding guidelines
```

## Dark Factory Integration

Design Auditor is a **standalone skill**. It does NOT modify Dark Factory.

Future integration notes are documented in `docs/dark-factory-v2.md` — describing how it could plug into Dark Factory as Phase 5.5/5.6 in a future version. Dark Factory v1 remains untouched.

## License

MIT

---

🐙 Created with 💜 by [@DUBSOpenHub](https://github.com/DUBSOpenHub) with the [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli).

Let's build! 🚀✨
