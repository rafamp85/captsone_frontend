# Frontend Template

React frontend template with hexagonal architecture, OTP authentication, and TDD practices.

## Stack

- React 19 + TypeScript
- Vite (dev server on port 4200, proxy to backend on 8080)
- Jest (unit/integration) + Playwright (e2e)
- CSS Modules
- Hexagonal Architecture (vertical slicing by business modules)
- TDD with Inside-Out development

## Development Workflow

Follow the XP pair-programming methodology defined in `guidelines/xp-tdd-practices`. Act as both Navigator and Driver. The user is the Tech Lead — consult during planning only.

### Mandatory Practices

- **TDD**: Every feature starts with a failing test. Follow the 5-step cycle from `guidelines/xp-tdd-practices`.
- **Testing Standards**: Test naming, structure, and coverage per `guidelines/testing-standards`.
- **Hexagonal Architecture**: Organize code by business modules with domain/application/infrastructure layers per `guidelines/architecture-hexagonal`.
- **Design Principles**: Apply naming, function design, and error handling standards from `guidelines/design-principles`.
- **Frontend**: React components, hooks, and CSS Modules per `guidelines/frontend-patterns`.

### Architecture Layers

- **Domain**: Value Objects
- **Application**: Use Cases, DTOs, Ports
- **Infrastructure**: HTTP Adapters, UI (React components, hooks, CSS Modules), Factory

All layer patterns documented in `guidelines/architecture-hexagonal`.

## Project Structure

Hexagonal Architecture with vertical slicing by business module. Dependencies flow inward: Infrastructure -> Application -> Domain.

```
src/
  shared/
    domain/               — Shared domain types (DomainError, Maybe, Id)
    application/ports/    — Shared port interfaces (TokenPort)
    infrastructure/
      http/               — HttpClient, endpoints
      ui/                 — App, ProtectedRoute, global styles, routes
    tests/
  [module]/               — e.g. health, auth
    domain/
      value-objects/      — Value objects (Email, OtpCode)
    application/
      [UseCase].ts        — One class per use case
      [DTO].ts            — Data transfer objects
      ports/              — Port interfaces
    infrastructure/
      adapters/           — HTTP adapters implementing ports
      ui/                 — React components, hooks, CSS Modules
    tests/
      e2e/                — Playwright specs
      integration/        — HTTP adapter tests (require backend)
      unit/
        application/      — Use case tests
        domain/           — Value object tests
        infrastructure/
          ui/             — Component and hook tests
```

## Scripts

- `npm start` — Dev server (port 4200)
- `npm test` — Unit tests
- `npm run test:integration` — Integration tests (requires backend on 8080)
- `npm run test:e2e` — Playwright e2e tests
- `npm run compile` — TypeScript check
- `npm run lint:fix` — Lint and fix
- `npm run format:fix` — Format code

## Available Skills

### Guidelines (auto-loaded knowledge)

- `architecture-hexagonal` — Hexagonal architecture, vertical slicing, layer dependencies
- `design-principles` — Naming, functions, classes/modules, error handling
- `testing-standards` — Test naming, structure, FIRST principles, mocks policy
- `frontend-patterns` — Components, hooks, CSS Modules, store layer
- `xp-tdd-practices` — TDD 5-step cycle, TPP, inside-out, pair programming
- `git-strategy` — Feature branching, conventional commits, TDD commit discipline

### Actions (interactive practices)

- `/action-plan` — Create a TDD plan, save to Notion backlog, implement, and track progress
- `/action-tdd` — Enforce TDD cycle or TPP when being skipped
- `/action-refactor` — Refactor code, tests, rename, or frontend patterns

### Commands (user-only, interactive)

- `/command-meta-skill` — Create new skills or review existing ones

### Tasks (subagent reviews)

- `/task-validate` — Full validation: compile, lint, format, tests
- `/task-code-review` — Review code against design principles and fix
- `/task-testing-review` — Review test quality and coverage, fix and create tests
- `/task-architecture-review` — Review hexagonal architecture compliance and fix
- `/task-frontend-review` — Review frontend patterns and components
- `/task-ux-review` — Visual UX review with Playwright
- `/task-qa` — Functional QA verification against a spec with Playwright

## Non-Negotiable Rules

- Never skip TDD. No production code without a failing test first.
- Never commit directly to `master`.
- Always respond in English in code. Comments and documentation in English.
