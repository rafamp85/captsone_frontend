---
name: frontend-patterns
description: This skill should be used when working with React components, custom hooks, CSS Modules, or store hooks (React Query), or when files match **/*.tsx, **/*.hook.ts, **/*.module.css, **/store/*.ts, **/context/*.ts.
---

# Frontend Patterns

React component standards, custom hooks rules, store layer (React Query), and CSS Modules styling guidelines.

## React Components

### Props
- **No destructuring**: use `props.x`, not `{ x }`. Why: makes the data source explicit at every usage site — always clear it comes from props, not local state or closure variables
- Props interface defined above component function
- Use explicit interface, not inline type

### useEffect
- `useEffect` lives in the **component**, not in hooks
- Trigger hook action functions from useEffect

### Maybe Handling
`Maybe<T>` wraps optional values (replaces `null`/`undefined`). Two states: `Some(value)` or `None`.
- Use `state.value.isSome()` for conditionals
- Use `state.value.fold()` for rendering different states
- Use `state.value.getOrThrow()` only when `isSome()` is already checked

### Wiring Patterns

Two patterns for connecting components to dependencies:

| Pattern | When | Example |
|---------|------|---------|
| **Container** | Simple modules without caching | `HealthContainer` uses Factory, passes UseCase via props |
| **Wired Page** | Modules with React Query store | `DashboardWiredPage` uses Factory + AppProviders; page uses store hooks |

For full patterns and examples, see `references/components.md`.

### Styling
- CSS Modules only, import as `styles`
- File naming: `ComponentName.module.css`
- Each component in its own folder: `ComponentName/ComponentName.tsx` + `ComponentName.module.css`

## Store Layer (React Query)

The store layer encapsulates React Query behind domain-meaningful APIs. It lives in `infrastructure/store/`.

### Structure
- `Module.queries.ts` — wraps `useQuery`, exposes domain helpers (not raw React Query internals)
- `Module.mutations.ts` — wraps `useMutation`, handles cache invalidation
- `infrastructure/context/ModuleUseCases.context.ts` — one Context per vertical slice for DI
- `shared/infrastructure/ui/AppProviders.tsx` — composes all Context providers

### Key Rules
- Store hooks obtain use cases from Context via `useModuleUseCases()`
- Queries expose functions like `projects()`, `hasProjects()`, `findById()` — never `data`, `isError`, `isSuccess`
- Mutations invalidate the module's query key on success
- Components consume store hooks directly — never import use cases or Factory

### Dependency Flow
```
Factory → AppProviders → Context → Store hooks → Components
```

For full store rules and examples, see `references/store.md`.

## React Custom Hooks

### Core Rules
1. **Separate business logic from presentation**: Hooks = how things work; Components = how things look
2. **Context only for dependency injection**: `createContext` and `useContext` are allowed exclusively for providing use cases to store hooks (one context per vertical slice in `infrastructure/context/`). Never use Context for shared state or cross-component communication
3. **Pass dependencies as parameters**: Use cases as hook parameters, not global calls. Store hooks (`useProjectsQuery`, `useProjectMutations`) may obtain use cases from Context internally
4. **Only useState inside hooks**: No `useEffect` inside hooks (it belongs in the component)
5. **Single useState**: Group all state in one typed interface object. Why: one state object makes state transitions atomic and explicit — the hook always updates a complete snapshot, preventing inconsistent intermediate states
6. **No nested functions**: Hook functions go at the first level
7. **Encapsulate state**: Never expose state or setState directly
8. **Use previous state**: Always `setState(prev => ...)`, not `setState(newValue)`
9. **No destructuring**: Use `hook.property` pattern when consuming hooks (same rationale as props — explicit data source)

### Dependency Boundaries
Hooks follow the dependency rule from `guidelines/architecture-hexagonal`:
- **Can access**: UseCases, pure domain functions
- **Never access**: Repositories, fetch/HTTP APIs, infrastructure adapters, Factory

### Allowed Hooks

| Hook | Where | Use |
|------|-------|-----|
| `useState` | Custom hooks | One per hook, grouped state |
| `useEffect` | Components | Lifecycle, NOT in hooks |
| `useRef` | Components | DOM references only |
| `useContext` | Store hooks | Dependency injection only (use cases from Context) |
| `useQuery` | Store hooks | Read operations with caching |
| `useMutation` | Store hooks | Write operations with cache invalidation |
| `useQueryClient` | Store hooks | Cache invalidation in mutations |
| `useSearchParams` | Page components | URL-driven state |

**Prohibited**: `useMemo`, `useCallback`, `useReducer`. `useContext` only in store hooks for DI, never for shared state.

For full hook rules and complete example, see `references/hooks.md`.

## CSS Modules

### Layout
- Flexbox as standard for all layouts
- Grid only for 2D galleries
- `gap` for spacing between elements

### Prohibitions
- No Tailwind, Bootstrap or utility CSS frameworks
- No preprocessors (Sass, Less) - pure CSS only
- No `!important`
- No inline styles (except dynamic JS values)
- No nesting deeper than 2 levels
- No type selectors (`div`, `span`) - use classes
- No `text-align: justify`

### Units
- **rem** for spacing, font-sizes, and flexible dimensions
- **px** for thin borders (1px, 2px) and shadows
- **%** or **viewport units** for responsive layouts

### Typography
- Use only font variables from `globals.css`
- Maximum two fonts: one for titles, one for body
- Font sizes always in `rem`
- Left alignment by default
- Good line height (`line-height: 1.5` - `1.6`)

### Responsive
- Always use `max-width` when using `width: 100%`
- Main breakpoint: `768px`
- Flexbox layouts are naturally responsive

### Accessibility
- Never remove `outline` without providing `:focus-visible` alternative
- Buttons with minimum touchable size (44x44px on mobile)
- Text minimum 14px / 0.875rem

For full CSS rules, typography scale, and examples, see `references/css-modules.md`.

## Non-Negotiable Rules

- Never destructure props or hook results
- Never put useEffect inside hooks
- Never use Context API for state management (only for dependency injection of use cases in store hooks)
- Never declare multiple useState calls or use useReducer
- Never use `useMemo`, `useCallback`, or `useReducer`
- Never expose React Query internals (`data`, `isError`, `isSuccess`) from store hooks
- Never import Factory or use cases directly in components (use store hooks or props)
- Never use Tailwind, Bootstrap or utility frameworks
- Never use `!important` or `text-align: justify`
- Never hardcode colors - use CSS variables
- Always access props via `props.x`
- Always use Maybe.fold() for rendering optional values
- Always use CSS Modules for styling
- Always use `rem` for font-sizes and spacing
- Always use `hook.property` pattern when consuming hooks
- Always use store hooks for modules with caching needs
- Always provide one Context per vertical slice for DI
