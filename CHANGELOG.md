# Changelog 🔍

All notable changes to the **Design Auditor** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-28

### Added

- **Audit Pipeline:** 7-step audit (capture → Lighthouse → axe-core → layout analysis → score → report → present).
- **Playwright Capture:** Screenshots at 3 viewports (desktop, tablet, mobile) with DOM extraction.
- **Performance Scoring:** Lighthouse 3-run median for reliable metrics.
- **Accessibility Scanning:** axe-core WCAG 2.1 AA violation detection.
- **Design Scoring:** 0-100 composite score across 7 categories (performance, CTA, hierarchy, accessibility, social proof, mobile, images).
- **Reference Corpus:** 50 curated high-converting sites across 5 verticals (SaaS, e-commerce, creator, agency, dev tools).
- **Report Template:** Standardized DESIGN-AUDIT.md with P1/P2/P3 ranked findings.
- **Configuration:** `config.yml` for viewports, scoring weights, thresholds, and model routing.
- **Dark Factory v2 Notes:** Future integration documentation (Phase 5.5/5.6) — no Dark Factory v1 changes.
