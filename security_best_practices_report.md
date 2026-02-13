# Security Best Practices Report (Third Pass)

Date: 2026-02-13  
Scope: `src/`, build/config files, and dependency audit (`npm audit --omit=dev`)

## Executive Summary

No actionable vulnerabilities were identified in this pass (no Critical/High/Medium/Low findings).

All previously reported issues are resolved in current source.

---

## Resolved Findings (Current Evidence)

### ARK-SEC-001: TOC DOM injection risk from unescaped heading IDs
- Status: Resolved
- Evidence:
  - TOC links are built with DOM APIs: `src/webview/ui/toc.ts:72`, `src/webview/ui/toc.ts:77`, `src/webview/ui/toc.ts:82`
  - IDs are sanitized before use: `src/webview/ui/toc.ts:81`, `src/webview/ui/toc.ts:134`

### ARK-SEC-002: Settings values persisted without schema validation
- Status: Resolved
- Evidence:
  - Per-key setting validation exists: `src/providers/viewerProvider.ts:186`
  - Validation enforced before update: `src/providers/viewerProvider.ts:209`

### ARK-SEC-003: Post-sanitization regex URL rewriting
- Status: Resolved
- Evidence:
  - Rewriting now uses DOM traversal, not regex replacement: `src/webview/app.ts:52`, `src/webview/app.ts:60`
  - Path traversal checks added for `..` segments (including decoded values): `src/webview/app.ts:65`, `src/webview/app.ts:68`

---

## Additional Notes

- Dependency scan result (`npm audit --omit=dev`): **0 vulnerabilities**.
- Positive controls verified:
  - CSP with nonce-based scripts and `connect-src 'none'`: `src/providers/viewerProvider.ts:96`
  - DOMPurify sanitization before DOM insertion: `src/webview/renderer/markdown.ts:90`, `src/webview/renderer/markdown.ts:94`
  - Mermaid strict mode + sanitized SVG rendering: `src/webview/renderer/mermaid.ts:16`, `src/webview/renderer/mermaid.ts:44`
