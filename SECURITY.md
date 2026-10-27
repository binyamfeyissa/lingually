# Security Policy

Lingually takes the security and privacy of its users very seriously. Because Lingually is a local-first, Bring Your Own Key (BYOK) application, security is built directly into its architectural boundaries.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture & Safeguards

### 1. Zero Credential Persistence on Server
- The Next.js Route Handler (`/api/ai`) operates as a completely stateless proxy.
- Credentials and request text are forwarded directly to the selected AI provider.
- Credentials, prompts, and document contents are **never** logged to server stdout/stderr, written to disk, or stored in any database.

### 2. SSRF Protection
- Custom provider base URLs (for Ollama or OpenAI-compatible endpoints) are validated on both client and server before execution.
- Access to cloud provider metadata endpoints (e.g., `169.254.169.254`, `metadata.google.internal`, `100.100.100.200`) is strictly blocked.
- Arbitrary internal private networks (e.g. `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are blocked on the server-side proxy. Localhost connections (`127.0.0.1`, `localhost`) are permitted only for local services such as Ollama.

### 3. Content Sanitization & XSS Prevention
- Imported documents and rendered HTML content are processed through `sanitize-html`.
- Dangerous tags (`<script>`, `<iframe>`, `<object>`, `<embed>`) and inline event handlers (`onload`, `onerror`, `onclick`) are stripped.
- All external links enforce `rel="noopener noreferrer nofollow"` and `target="_blank"`.

### 4. Credential Storage Isolation
- Document backups and JSON exports **never** include user API keys.
- Users can choose between three storage modes in Settings:
  - **Persistent Local Storage** (`localStorage`)
  - **Session-Only Storage** (`sessionStorage`)
  - **In-Memory Only** (RAM only; wiped on reload)

### 5. Browser Storage Advisory
Browser storage (`localStorage` and `sessionStorage`) is accessible to JavaScript running within the same origin. It does not provide hardware encryption or isolation from malicious browser extensions with broad host permissions. On shared or untrusted workstations, users are advised to use **Session-Only** or **In-Memory** storage modes.

## Reporting a Vulnerability

If you discover a security vulnerability within Lingually, please do not open a public GitHub issue. Instead, report it privately via security advisory on GitHub or by emailing the project maintainers. Please include:
- A description of the issue.
- Steps to reproduce or a proof of concept.
- Potential impact and affected components.

We commit to acknowledging receipt within 48 hours and providing a remediation timeline.
