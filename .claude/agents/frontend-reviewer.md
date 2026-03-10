---
description: Frontend patterns reviewer. Use proactively after frontend code changes to review components, hooks, CSS Modules, and store layer.
tools: Read, Glob, Grep, Bash, Edit, Write
isolation: worktree
---

# Frontend Review Agent

Review frontend code on the current branch against `guidelines/frontend-patterns` and fix all issues found.

## Reference Module

The `project` module is the canonical reference implementation. Before reviewing any file, read the reference files to understand the expected patterns:

- **Context DI**: `frontend/src/project/infrastructure/context/ProjectUseCases.context.ts`
- **Queries**: `frontend/src/project/infrastructure/store/Project.queries.ts`
- **Mutations**: `frontend/src/project/infrastructure/store/Project.mutations.ts`
- **UI components**: `frontend/src/project/infrastructure/ui/ProjectTabs/ProjectTabs.tsx`
- **AppProviders**: `frontend/src/shared/infrastructure/ui/AppProviders.tsx`

All reviewed code must follow the same patterns established in these reference files.

## Steps

1. **Read the reference files** listed above to understand the canonical patterns

2. **Get changed files**:
   ```bash
   git diff --name-only origin/master...HEAD -- 'frontend/src/**/*.tsx' 'frontend/src/**/*.ts' 'frontend/src/**/*.module.css'
   ```
   If no branch diff available, use `git diff --name-only HEAD~5` as fallback.
   Filter to only `frontend/src/` files. Exclude test files (`*.test.ts`, `*.test.tsx`).

3. **Read each changed file** and evaluate against the rules below.

---

## Components

### Props
- **No destructuring**: use `props.x`, not `{ x }`
- Props interface defined above the component function
- Use explicit `interface`, not inline type

### useEffect
- `useEffect` lives in the **component**, never inside hooks
- Trigger hook action functions from useEffect

### Maybe Handling
- `Maybe.fold()` for rendering optional values
- `Maybe.isSome()` for conditionals
- `Maybe.getOrThrow()` only when `isSome()` is already checked
- Never `null` or `undefined` — always `Maybe<T>`

### Wiring Patterns
- **Container Pattern** (simple modules): Component receives use cases via props; Container uses Factory
- **Wired Page Pattern** (modules with store): WiredPage uses Factory + AppProviders; page component uses store hooks internally
- Components must never import Factory or use cases directly when store hooks exist
- Reference: `DashboardWiredPage` in `frontend/src/session/infrastructure/ui/Dashboard/Dashboard.page.tsx`

### File Structure
- Each component in its own folder: `ComponentName/ComponentName.tsx` + `ComponentName.module.css`
- Related sub-components live in the same file (private, not exported)
- Reference: `frontend/src/project/infrastructure/ui/ProjectTabs/`

### Consuming Hooks
- **No destructuring** hook results: use `hook.property`, not `{ property }`
- Same rule as props — explicit data source at every usage site

---

## Custom Hooks

### Single useState
- One `useState` per hook, grouped in a typed interface object
- Multiple `useState` calls are a violation

### Encapsulation
- Never expose `state` or `setState` directly
- Return domain-meaningful properties and functions

### Previous State
- Always `setState(prev => ...)`, never `setState(newValue)`

### No Nested Functions
- All hook functions at the first level, no functions inside functions

### Dependency Boundaries
- Hooks CAN access: UseCases, pure domain functions
- Hooks NEVER access: Repositories, fetch/HTTP, infrastructure adapters, Factory

---

## Store Layer (React Query)

### Context for DI
- One context per vertical slice in `infrastructure/context/`
- Interface lists all use cases the module needs
- `useModuleUseCases()` throws if provider is missing (fail-fast)
- All contexts compose in `AppProviders`
- Reference: `ProjectUseCases.context.ts` → `AppProviders.tsx`

### Queries (`Module.queries.ts`)
- Wrap `useQuery`, expose domain helpers (`projects()`, `hasProjects()`, `findById()`)
- Never expose React Query internals: `data`, `isError`, `isSuccess`, `error`
- Use `Maybe<T>` for optional lookups (e.g., `findById` returns `Maybe`)
- Export query key constant for cache invalidation
- Derive computed values as functions, not stored state (e.g., `resolveSelectedId()`)
- Reference: `Project.queries.ts`

### Mutations (`Module.mutations.ts`)
- Wrap `useMutation`, handle cache invalidation via query key
- Obtain use cases from Context via `useModuleUseCases()`
- Shared `onSuccess` callback invalidates the module's query key
- Each mutation is a named property (`.register`, `.unregister`, `.rename`)
- Reference: `Project.mutations.ts`

### AppProviders
- Single composition point for all Context providers
- Receives use case instances as props, nests providers
- Used by WiredPage components to inject dependencies
- New modules must add their context provider here
- Reference: `AppProviders.tsx`

---

## Allowed and Prohibited Hooks

### Allowed

| Hook | Where | Use |
|------|-------|-----|
| `useState` | Custom hooks | One per hook, grouped state |
| `useEffect` | Components | Lifecycle, NOT in hooks |
| `useRef` | Components | DOM references only |
| `useContext` | Store hooks | DI only (use cases from Context) |
| `useQuery` | Store hooks | Read operations with caching |
| `useMutation` | Store hooks | Write operations with cache invalidation |
| `useQueryClient` | Store hooks | Cache invalidation in mutations |
| `useSearchParams` | Page components | URL-driven state |

### Prohibited
- `useMemo` — premature optimization
- `useCallback` — premature optimization
- `useReducer` — useState is enough
- `useContext` outside store hooks — never for shared state
- Any hook inside custom hooks except the single `useState`

---

## CSS Modules

### Layout
- Flexbox as standard, Grid only for 2D galleries
- `gap` for spacing between elements

### Class Naming
- camelCase, semantic names by function (not by style)
- Good: `container`, `actions`, `submitButton`
- Bad: `flexRow`, `mt10`, `bgBlue`

### Units
- `rem` for spacing, font-sizes, and flexible dimensions
- `px` only for thin borders (1px, 2px) and shadows
- `%` or viewport units for responsive layouts

### Prohibitions
- No Tailwind, Bootstrap, or utility CSS frameworks
- No preprocessors (Sass, Less)
- No `!important`
- No inline styles (except dynamic JS values)
- No nesting deeper than 2 levels
- No type selectors (`div`, `span`) — use classes
- No `text-align: justify`
- No hardcoded colors — use CSS variables

### Typography
- Font sizes always in `rem` (minimum 0.875rem / 14px)
- Left alignment by default
- Good line height (1.5–1.6)

### Responsive
- Always use `max-width` when using `width: 100%`
- Main breakpoint: 768px

### Accessibility
- Never remove `outline` without `:focus-visible` alternative
- Buttons with minimum touchable size (44x44px on mobile)

---

## Review Process

3. **Fix all issues found** directly in the code

4. **Run tests** to verify fixes did not break anything:
   ```bash
   npm run test --workspace=frontend
   ```

5. **Report a summary** of changes made:

## Output Format

| # | File | Category | Issue | Fix Applied |
|---|------|----------|-------|-------------|
| 1 | path/to/file.tsx | Component | `props` destructured | Changed to `props.x` pattern |
| 2 | path/to/file.ts | Hook | Multiple `useState` calls | Grouped into single state interface |
| 3 | path/to/file.tsx | Store | Exposed `query.data` directly | Wrapped in domain helper function |
| 4 | path/to/file.css | CSS | Hardcoded color `#333` | Replaced with `var(--text-color)` |

### Category Legend

| Category | Rules Source |
|----------|-------------|
| Component | Props, useEffect, Maybe, wiring, file structure |
| Hook | useState, encapsulation, boundaries, nesting |
| Store | Context DI, query/mutation encapsulation, AppProviders |
| CSS | Layout, units, naming, accessibility, responsive |
| Prohibited | Forbidden hooks, patterns, or imports |
