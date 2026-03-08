---
name: design-principles
description: This skill should be used when writing or reviewing code, refactoring, or when the user asks about "naming", "functions", "classes", "comments", "error handling", or "code design".
---

# Design Principles

Code design standards covering naming, functions, classes/modules, comments, and error handling.

## Naming

- Pronounceable in English, no technical abbreviations
- Avoid redundant prefixes/suffixes (`I`, `Impl`, `Abstract`)
- Concrete names; avoid catch-all words (helper, util, manager)
- No type information in names; the IDE shows it
- One concept, one name; no aliases or synonyms
- Combine well with grammar: `isPaidInvoice`, `sumOfNumbersIn(expression)`
- Prefer "not" in the name over the negation operator
- Distinguish nouns (classes, modules) from verbs (methods, functions)
- Allowed generic suffixes: DTO, Repository, Factory, Mapper, UseCase, Service
- Constants use camelCase, not SCREAMING_SNAKE_CASE
- Never use underscore prefix for private members
- Prefer enums over literal types for fixed sets of values

For full naming rules with examples, see `references/naming.md`.

## Functions

1. **Single responsibility**: Each function does exactly what its name indicates
2. **Impeccable naming**: Function names are verbs describing the action
3. **Minimum arity**: 0-3 parameters; group in an object if exceeded
4. **No boolean flags**: Prefer specific functions (`show()/hide()`)
5. **Guard clauses**: Exit early for edge cases; reduce indentation
6. **Separate control flow and logic**: Extract iterations/branches
7. **Declarative style**: Use `map/filter/reduce` when it improves readability
8. **Pure functions**: Avoid side effects when possible
9. **CQS**: Commands mutate state (void), queries return values (no mutation). Dont mix it.
10. **No comments on functions**: No JSDoc, no parameter descriptions
11. **Prioritize Immutable collections**: Avoid push, pop, shift, splice
12. **Constants close to usage**: Define inside the function that uses them
13. **Use Maybe for optionals**: Never use `| undefined` or `| null` in return types

For full function rules with code examples, see `references/functions.md`.

## Classes and Modules

1. **Minimum scope, maximum cohesion**: Keep things close to where they are used
2. **Simple constructors**: Move validation to factory methods; keep constructor as assignment
3. **Class organization**: Public constructor, then private constructor, then public API, then private
4. **Encapsulation by default**: Use `private` for methods; do not export unless necessary
5. **Law of Demeter / Tell, Don't Ask**: Avoid long call chains
6. **Rich models**: Classes encapsulate behavior; no anemic models
7. **Complete objects at construction**: No partial initialization
8. **No JS getters/setters**: Use explicit methods (`calculateTotal()`, `uptime()`)
9. **No underscore prefix**: Use `private` keyword instead of `_name`
10. **No singletons**: Manage global state through the factory module
11. **Composition over inheritance**
12. **Domain-specific types**: Build classes with behavior

For full rules with code examples, see `references/classes-modules.md`.

## Comments and Formatting

- Code must be self-explanatory; comments indicate unclear code
- Only comment WHY, never WHAT
- No JSDoc, no parameter descriptions
- Delete commented-out code; version control exists
- Let the formatter handle formatting (Prettier, ESLint)
- No blank lines inside functions/methods; blank lines only between functions

## Error Handling

Use a single `DomainError` class with factory methods:

| Factory Method | Type | Use |
|----------------|------|-----|
| `createNotFound()` | notFound | Entity does not exist |
| `createValidation()` | validation | Invariant violated |
| `create()` | other | Other domain errors |

- Throw for invariant violations, entity not found, invalid state transitions
- Return `Maybe.none()` for optional values; return empty array for no results
- Include relevant context in error messages (IDs, values)
- Never expose stack traces, DB table names, or file paths
- Distinguish domain errors from technical errors; let technical errors bubble up

For the full DomainError pattern with code examples, see `references/error-handling.md`.

## Non-Negotiable Rules

- Never write production code without self-explanatory names
- Never use generic variable names (x, data, temp, info)
- Never use boolean flags that change function behavior
- Never expose internal collections directly
- Never use JS getters/setters or underscore prefixes
- Never expose stack traces or internal details in error messages
- Always use factory methods for DomainError
- Always follow CQS: commands mutate (void), queries return (no mutation)
- Always prefer composition over inheritance
