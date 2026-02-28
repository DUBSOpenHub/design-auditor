## Summary

<!-- What does this PR do? Link any related issues. -->

Closes #

## Type

- [ ] 🐛 Bug fix
- [ ] ✨ New feature / audit check
- [ ] 📖 Documentation
- [ ] 🔧 CI / tooling
- [ ] 📚 Reference corpus update

## What Changed

<!-- Brief description of the changes -->

## Checklist

### General
- [ ] `node scripts/audit.js https://example.com` runs without errors
- [ ] No hardcoded values that belong in `config.yml`
- [ ] CHANGELOG.md updated

### If audit pipeline changed
- [ ] SKILL.md updated to reflect new/changed steps
- [ ] Template (`templates/design-audit-template.md`) still matches output format
- [ ] Tested against at least 2 real URLs

### If reference corpus changed
- [ ] All new URLs are live and verified
- [ ] Correct vertical and pattern tags assigned
- [ ] Notes explain what makes the site a good reference

### If scoring changed
- [ ] Category weights still sum to 100 in `config.yml`
- [ ] Score breakdown in template matches new categories
