# Contributing to Design Auditor

Thanks for your interest in contributing! Here's how to get started.

## Core Principles

1. **Report only.** The auditor never modifies the target site. It reports findings.
2. **Evidence-based.** Every finding must cite a specific element, measurement, or metric.
3. **Concrete fixes.** "Improve your CTA" is banned. Provide CSS selectors and values.
4. **Config is the source of truth.** Viewports, scoring weights, thresholds — all in `config.yml`. Don't hardcode.
5. **Reference URLs must be live.** Verify before adding to the corpus.

## Getting Started

1. Fork the repository
2. Create a branch: `audit/<topic>`
3. Make your changes
4. Test with a real URL: `node scripts/audit.js https://example.com`
5. Open a PR using the template

## What You Can Contribute

### Reference Corpus
Add high-converting sites to `reference-corpus.yml`:
- Must be a real, live site
- Tag with the correct vertical and patterns
- Include notes explaining what makes it effective

### Audit Checks
Improve the analysis in `scripts/capture.js` or `scripts/audit.js`:
- New DOM extraction signals
- Better scoring heuristics
- Additional viewport checks

### Bug Reports
Found a site that audits incorrectly? Open an issue with:
- The URL that was audited
- What the audit reported
- What the correct finding should be

## Pull Request Checklist

- [ ] `node scripts/audit.js https://example.com` runs without errors
- [ ] No hardcoded values that belong in `config.yml`
- [ ] Reference URLs in corpus are live and accurate
- [ ] SKILL.md updated if audit pipeline logic changed
- [ ] CHANGELOG.md updated with your changes

## Code Style

- JavaScript (Node.js) for scripts
- YAML for configuration and corpus
- Markdown for documentation and templates
- Keep it simple — no unnecessary frameworks or dependencies
