---
name: action-refactor
description: Refactor code, tests, or rename following design principles after a green test. Triggers: "refactor", "rename", "clean up code".
argument-hint: "[code | tests | rename | frontend]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Refactor

Apply design standards and refactoring rules to code.

## Usage

```
/action-refactor            → Refactor production code (default)
/action-refactor code       → Refactor production code
/action-refactor tests      → Refactor test files
/action-refactor rename     → Rename the last artifact
/action-refactor frontend   → Refactor frontend code against frontend patterns
```

## Mode: Code (default)

Apply the design principles from `guidelines/design-principles`:
- Naming standards (pronounceable, concrete, self-explanatory)
- Function design (SRP, arity, guard clauses, CQS)
- Classes/modules design (encapsulation, composition, rich models)

Steps:
1. Review the code against `guidelines/design-principles`
2. Apply improvements
3. Run tests after refactoring to verify nothing breaks

## Mode: Tests

Apply testing standards from `guidelines/testing-standards`:
- Business-oriented test names (domain language, not technical verbs)
- AAA structure (Arrange-Act-Assert) with blank lines between sections
- Remove TODO lists after implementation is complete
- FIRST principles

Steps:
1. Review tests against `guidelines/testing-standards`
2. Apply improvements
3. Run tests to verify nothing breaks

## Mode: Frontend

Apply frontend patterns from `guidelines/frontend-patterns` to the current file or module.

### Reference files (read first)

Before refactoring, read the canonical implementation in the `project` module:
- **Context DI**: `frontend/src/project/infrastructure/context/ProjectUseCases.context.ts`
- **Queries**: `frontend/src/project/infrastructure/store/Project.queries.ts`
- **Mutations**: `frontend/src/project/infrastructure/store/Project.mutations.ts`
- **UI component**: `frontend/src/project/infrastructure/ui/ProjectTabs/ProjectTabs.tsx`
- **AppProviders**: `frontend/src/shared/infrastructure/ui/AppProviders.tsx`

### What to refactor

#### Components
- Props destructuring → `props.x` pattern
- `useEffect` inside hooks → move to component
- `null`/`undefined` → `Maybe<T>` with `fold()`/`isSome()`
- Flat file → folder per component (`ComponentName/ComponentName.tsx` + `.module.css`)
- Hook result destructuring → `hook.property` pattern

#### Store layer
- Use cases passed via props → Context DI (`useModuleUseCases()`)
- Raw `useQuery`/`useMutation` in components → encapsulate in `Module.queries.ts`/`Module.mutations.ts`
- Leaked React Query internals (`data`, `isError`, `isSuccess`) → domain helpers (`projects()`, `hasProjects()`, `errorMessage()`)
- Missing AppProviders integration → add context provider to `AppProviders.tsx`

#### Hooks
- Multiple `useState` → single grouped state interface
- Exposed `state`/`setState` → encapsulated return object
- `setState(newValue)` → `setState(prev => ...)`
- Nested functions → flat, first-level functions
- `useCallback`/`useMemo`/`useReducer` → remove (prohibited)

#### CSS Modules
- Hardcoded colors → CSS variables (`var(--text-color)`)
- `px` for font-sizes/spacing → `rem`
- Type selectors (`div`, `span`) → class selectors
- Non-semantic class names (`flexRow`, `mt10`) → semantic names (`container`, `actions`)

### Steps

1. Read the reference files listed above
2. Review the target code against `guidelines/frontend-patterns`
3. Apply improvements following the reference patterns
4. Run tests to verify nothing breaks

## Mode: Rename

Rename the last artifact following naming standards from `guidelines/design-principles`:
- Self-explanatory
- Pronounceable
- Concrete
- Clearly expresses the intention

Steps:
1. Identify the artifact to rename
2. Apply naming standards
3. Update all references
4. Run tests to verify nothing breaks
