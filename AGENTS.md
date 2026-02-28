# AGENTS.md — Working Guide for AI Agents

This file tells any AI agent how to work effectively on the Design Auditor codebase.

---

## Architecture

Design Auditor is a **standalone Copilot CLI skill** that audits web pages for conversion, performance, accessibility, and design quality. It is NOT part of Dark Factory — it is a separate, independent skill.

```
SKILL.md (Design Auditor / Orchestrator)
  ├── scripts/capture.js    → Playwright screenshots + DOM extraction
  ├── scripts/audit.js      → Orchestration (capture → Lighthouse → axe → score)
  ├── config.yml            → Tunables (viewports, thresholds, scoring)
  ├── reference-corpus.yml  → 50 curated reference sites across 5 verticals
  └── templates/design-audit-template.md → Report format
```

The skill is invoked as: `audit <url>` or `audit local`

---

## File Ownership Map

| File/Dir | Purpose | Change Rules |
|----------|---------|-------------|
| `SKILL.md` | Main auditor prompt | Most critical file. Changes affect the entire audit pipeline. |
| `scripts/capture.js` | Playwright capture + DOM extraction | Core infrastructure. Test with a real URL after changes. |
| `scripts/audit.js` | Pipeline orchestrator | Coordinates all steps. Changes affect scoring and output. |
| `config.yml` | User-tunable settings | Never hardcode values that belong here. |
| `reference-corpus.yml` | Curated reference sites | Keep URLs live and verified. Flag stale entries. |
| `templates/design-audit-template.md` | Report output format | Keep in sync with SKILL.md instructions. |
| `docs/dark-factory-v2.md` | Future integration notes | Reference only. Does not affect current functionality. |

---

## Before You Change Anything

1. Read the file you're changing completely
2. Understand which pipeline step it affects
3. Check if the template or config references it
4. Make the smallest possible change
5. Test with a real URL: `node scripts/audit.js https://example.com`

---

## Key Rules

1. **Report only.** The auditor never modifies the target site's code.
2. **DOM verification.** Every visual claim must be confirmed by DOM query, not just vision.
3. **Concrete fixes.** "Improve your CTA" is banned. Provide selectors and values.
4. **Max 10 findings.** Quality over quantity. Rank by conversion impact.
5. **Reference URLs must be real.** Test that they resolve before adding to corpus.
6. **Config is source of truth.** Viewports, thresholds, scoring weights — all in config.yml.
7. **Standalone identity.** This is NOT Dark Factory. Do not add Dark Factory dependencies.

---

## Common Pitfalls

### 1. Dead reference URLs
Sites redesign constantly. Before citing a reference, verify the URL loads and still demonstrates the pattern you're citing.

### 2. Vision hallucinations
If the vision model says "CTA is missing" but DOM extraction shows a button element at y=400, trust the DOM. Vision confirms, DOM verifies.

### 3. SPA rendering failures
Modern SPAs may not render in headless Playwright. The capture script waits for `networkidle` and checks visible element count. If < 3 elements visible, the audit flags it and recommends using a local dev server URL.

### 4. Lighthouse variance
Lighthouse scores vary between runs. The audit script runs 3 times and takes the median. If variance > 15%, it's flagged as unstable in the report.

### 5. Scope creep
This tool audits landing pages for conversions. It is not a full web development framework, a CI tool, or a design system generator. Keep it focused.
