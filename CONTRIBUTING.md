# Contributing to Lingually

Thank you for your interest in contributing to **Lingually**! We are committed to building a transparent, privacy-first, open-source AI writing workbench.

## Code of Conduct

Please treat all community members with respect, dignity, and empathy. Harassment, condescension, or discriminatory behavior will not be tolerated.

## Core Architectural Principles

When writing or modifying code in Lingually, adhere to these fundamental principles:

1. **Local-First & Privacy First**: Never introduce remote databases or centralized telemetry. Documents must remain in IndexedDB unless exported by the user.
2. **Bring Your Own Key (BYOK)**: The application must never require an application-wide API key or subscription. Every provider integration must support individual user keys.
3. **No Fabricated Output**: Never simulate or fake an AI response. If a provider is not configured or an error occurs, surface a clean, honest error message.
4. **User Control**: Always present AI suggestions alongside an original before/after diff. Edits must require explicit user acceptance before being applied.
5. **Security**: Validate all URLs and inputs. Enforce SSRF protection. Never log API keys or sensitive document text.

## Development Workflow

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/lingually.git
   cd lingually
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Verify code before opening a PR:
   ```bash
   # Run TypeScript strict type-check
   npm run type-check

   # Run ESLint
   npm run lint

   # Run unit & integration tests
   npm run test

   # Run production build
   npm run build
   ```

## Pull Request Guidelines

- Branch naming: `feature/short-description` or `fix/short-description`.
- Keep PRs focused on a single concern.
- Include unit tests for any new algorithms, parsers, or utilities.
- Maintain existing comments and docstrings.
