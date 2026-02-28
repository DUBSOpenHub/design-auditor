# Copilot Instructions — Design Auditor

This repository contains **Design Auditor**, a standalone skill that audits web pages for conversion, performance, accessibility, and design quality.

## File map

| File/Dir | Purpose |
|---|---|
| `SKILL.md` | Main auditor prompt (the brain) |
| `templates/design-audit-template.md` | Report output format |
| `reference-corpus.yml` | 50 curated reference sites across 5 verticals |
| `config.yml` | Tunables (viewports, thresholds, models) |
| `scripts/capture.js` | Playwright capture + DOM extraction script |
| `scripts/audit.js` | Orchestration script (capture → Lighthouse → axe → report) |
| `docs/dark-factory-v2.md` | Future Dark Factory integration notes |

## Non-negotiables

1. **Report only.** The auditor never modifies the target site. It reports findings.
2. **Evidence-based.** Every finding must cite a specific element, measurement, or metric.
3. **Concrete fixes.** "Improve your CTA" is banned. Provide CSS selectors and values.
4. **DOM verification.** Visual claims must be confirmed via DOM query, not just vision model output.
5. **Max 10 findings.** Rank by impact. Quality over quantity.
6. **Standalone first.** This is NOT a Dark Factory modification. It's its own skill.

## Prohibited actions

- Modifying the target site's files
- Making recommendations without measurements
- Referencing non-existent or dead reference URLs
- Claiming causation without outcome data
