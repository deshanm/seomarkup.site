# Security Policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email **madurajithdeshan@gmail.com** with:
- A description of the vulnerability.
- Steps to reproduce.
- Potential impact.

You can expect an acknowledgement within 48 hours and a resolution timeline within 7 days for critical issues.

## Extension security model

The Chrome extension (`app/`) is designed with a minimal footprint:

| Claim | Details |
|-------|---------|
| **Permissions** | `activeTab` + `scripting` only. No `host_permissions`. |
| **Network calls** | None. The extension makes zero outbound network requests. |
| **Data storage** | `localStorage` in the popup for UI state (rating prompt dismissal) only. No data about visited pages is stored or transmitted. |
| **Content scripts** | A single content function (`getSchemaJson`) is injected only when the user opens the popup on an http(s) page. It reads `<script type="application/ld+json">` tags and `itemscope`/`typeof` attribute counts, then returns the result to the popup. It does not modify the page. |
| **Third-party code** | The vendored `libs/jsonTree/` library renders the JSON tree in the popup. It is MIT-licensed and network-isolated. |

## Website security

The marketing site (`website/`) is a static Astro site with no user accounts, no authentication, and no server-side data storage. The only third-party scripts are Google Analytics and a Tally.so feedback form.
