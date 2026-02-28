# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in Design Auditor, please report it responsibly.

### How to Report

1. **Preferred:** Use [GitHub Security Advisories](https://github.com/DUBSOpenHub/design-auditor/security/advisories/new) to report privately.
2. **Alternative:** Email **security@dubsopenhub.com**.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledgment | Within 24 hours |
| Assessment | Within 72 hours |
| Fix (if confirmed) | Best effort, typically within 7 days |

### Scope

Security concerns for Design Auditor include:

- **Data exfiltration:** Could the audit scripts leak sensitive data from audited pages?
- **Dependency vulnerabilities:** Playwright, Lighthouse, or axe-core CVEs
- **Arbitrary code execution:** Could a malicious page exploit the headless browser?
- **Reference corpus integrity:** Could poisoned reference data lead to harmful recommendations?

### Out of Scope

- Findings about the websites being audited (that's the tool's job)
- Feature requests (use regular issues)
- Styling or documentation issues

## Security Best Practices

When running Design Auditor:
- Run in a sandboxed environment when auditing untrusted URLs
- Keep Playwright and Chromium updated
- Review audit output before acting on recommendations
