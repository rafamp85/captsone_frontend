---
name: task-frontend-review
description: Review frontend patterns: components, hooks, CSS Modules, and store layer conventions. Triggers: "review frontend", "check components".
argument-hint: "[git range]"
context: fork
agent: frontend-reviewer
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

# Frontend Review

Launch a subagent to review changed frontend files against `guidelines/frontend-patterns`.

## Scope

If a git range is provided (e.g., `abc1234...HEAD`), review only files in that range:
```bash
git diff --name-only <range> -- '*.tsx' '*.ts' '*.module.css'
```

If no git range is provided, review all changed files on the current branch:
```bash
git diff --name-only main -- '*.tsx' '*.ts' '*.module.css'
```

Only files under `frontend/src/` are in scope. Exclude test files.

## What the Agent Does

1. Determine the file list from the scope
2. Read each changed file
3. Evaluate against `guidelines/frontend-patterns`:
   - **Components**: props, useEffect placement, Maybe handling, wiring patterns, file structure
   - **Hooks**: single useState, encapsulation, dependency boundaries, no nested functions
   - **Store**: Context DI, query/mutation encapsulation, no leaked React Query internals
   - **CSS Modules**: layout, units, naming, accessibility, responsive
4. Fix all issues found
5. Run tests to verify fixes don't break anything

## Output

A table of issues found and fixes applied per file.
