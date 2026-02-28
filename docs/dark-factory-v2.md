# Dark Factory v2 Integration Notes

> **Status:** Future reference. Dark Factory v1 is NOT modified. These notes describe how the Design Auditor skill could integrate into Dark Factory as Phase 5.5/5.6 in a future version.

## Narrative Preservation

Dark Factory's origin story (Havoc Hackathon → sealed-envelope build system) is untouched. The design audit is an **extension**, not a rewrite:

- **v1 story:** "Dark Factory validates that code works" (sealed tests)
- **v2 story:** "Dark Factory also validates that it converts" (design audit)

The 6-agent pipeline, sealed-envelope protocol, and all existing phases remain unchanged.

## Where It Fits

```
Dark Factory v1 (unchanged):
  Phase 0 — Setup
  Phase 1 — Product Spec (PRD.md)
  Phase 2 — Architecture + Sealed Tests (parallel)
  Phase 3 — Implementation
  Phase 4 — Sealed Validation (GAP-REPORT.md)
  Phase 5 — Hardening
  Phase 6 — Delivery

Dark Factory v2 (with design audit):
  Phase 0–5 — same as v1
  Phase 5.5 — Design Audit (DESIGN-AUDIT.md)    ← NEW
  Phase 5.6 — Design Hardening (fix audit issues) ← NEW
  Phase 6 — Delivery
```

## Trigger Conditions

Phase 5.5 triggers ONLY when:
1. `config.design_audit.enabled` is `true`
2. The built project is web-facing (auto-detected by presence of HTML/CSS/JSX files, or Next.js/Astro/Hugo/static site frameworks in package.json)

Non-web projects (CLIs, APIs, libraries) skip Phase 5.5 entirely.

## Agent Dispatch (Phase 5.5)

```
task(agent_type="general-purpose", model="<config.models.design_auditor>", 
  description="Design audit", prompt="
  You are the Design Auditor for the Dark Factory.
  ## Mission: Audit the built web project for conversion, performance, and design quality.
  ## Input: <PRD.md content> + <working dev server URL>
  ## Working Directory: <worktree_path>
  ## Reference Corpus: <reference-corpus.yml content>
  ## Output: Write DESIGN-AUDIT.md with scored findings and concrete fixes.
  ## Rules:
  - Report only. Do NOT modify code or tests.
  - Never recommend removing something the PRD explicitly requires.
  - If a recommendation conflicts with the PRD, flag it: 'PRD requires X, design suggests Y — defer to PRD.'
  - Max 10 findings, ranked by impact.
  - Every finding includes: element, measurement, fix, reference.
  - You do NOT have access to sealed tests. Do not request them.
")
```

## Design Hardening (Phase 5.6)

If Design Score < `config.design_audit.pass_threshold` (default 80):

1. Extract findings from DESIGN-AUDIT.md (element + fix instructions only)
2. Dispatch Lead Engineer:
```
task(agent_type="general-purpose", model="<config.models.lead_eng>",
  description="Design hardening", prompt="
  You are the Lead Engineer — Design Hardening Mode.
  ## Mission: Fix design issues flagged by the Design Auditor.
  ## Findings: <element, measurement, concrete fix — from DESIGN-AUDIT.md>
  ## Working Directory: <worktree_path>
  ## Rules: Fix CSS/HTML only. Do NOT modify test files. Re-run own tests for regressions.
")
```
3. Re-run Design Auditor
4. If score ≥ threshold → proceed to Phase 6
5. After `config.design_audit.max_design_cycles` (default 2): ship with remaining findings noted in delivery report

## Sealed-Envelope Isolation

**Critical:** The Design Auditor NEVER receives sealed tests. Its inputs are:
- PRD.md (to understand requirements)
- Screenshots + DOM (from the built site)
- Lighthouse + axe-core output
- Reference corpus

This maintains the sealed-envelope contract. The audit agent cannot leak test information to the builder through design recommendations.

## Config Changes Required

```yaml
# Addition to config.yml
design_audit:
  enabled: false  # opt-in, default off
  auto_detect: true
  pass_threshold: 80
  max_design_cycles: 2
  viewports:
    - { width: 1440, height: 900, label: desktop }
    - { width: 768, height: 1024, label: tablet }
    - { width: 375, height: 812, label: mobile }

models:
  design_auditor: claude-sonnet-4.6  # add to existing models section
```

## Files That Would Change in Dark Factory v2

| File | Change |
|------|--------|
| `SKILL.md` | Add Phase 5.5/5.6 pipeline logic after Phase 5 |
| `config.yml` | Add `design_audit` section |
| `AGENTS.md` | Document design-auditor agent |
| `agents/design-auditor.md` | New agent prompt (copy from Design Auditor skill) |
| `templates/design-audit-template.md` | New report template |

No existing files are modified in their current behavior. The new phases are additive and gated behind config.
