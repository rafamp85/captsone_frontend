---
name: task-validate
description: Full project validation: compile, lint, format, and run all tests. Triggers: "validate", "check project", "run checks".
context: fork
agent: project-validator
allowed-tools: Read, Glob, Bash, Edit
---

# Validate

Launch a subagent to run full project validation: TypeScript compilation, linting, formatting, and all test suites.

The agent reads `package.json` to discover available scripts, runs each check, fixes formatting and lint auto-fixable issues, and reports results.

## Output

A summary table of all checks (compilation, lint, format, unit tests, integration tests, E2E tests) with pass/fail status and error details.
