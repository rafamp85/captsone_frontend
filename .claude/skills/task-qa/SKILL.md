---
name: task-qa
description: Functional QA testing against a spec with Playwright and e2e coverage audit. Triggers: "QA", "manual testing", "check flows".
argument-hint: "spec:<path>"
agent: qa-tester
allowed-tools: Read, Glob, Grep, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, mcp__playwright__browser_select_option, mcp__playwright__browser_press_key, mcp__playwright__browser_wait_for, mcp__playwright__browser_resize, mcp__playwright__browser_tabs, mcp__playwright__browser_console_messages, mcp__playwright__browser_network_requests, mcp__playwright__browser_evaluate
---

# QA Testing

Launch a subagent to perform functional QA testing of the running application against a spec, and audit e2e test coverage.

## Usage

```
/task-qa spec:planning/specs/16-structured-chat.md   → Extract scope from spec file
/task-qa "Session dashboard: launch, rename, stop"    → Free-text description
```

## Scope

### From spec file (preferred)

If `$ARGUMENTS` starts with `spec:`, read the spec file and extract:
- **What** section → high-level description of features to test
- **Requirements** → expected behavior (SHALL/MUST statements)
- **Acceptance criteria** → verifiable conditions that define "done"
- **How** sections → specific components, routes, and flows involved

Build a test plan from the acceptance criteria. Each criterion becomes one or more manual test cases.

### From description

If a free-text description is provided, focus testing on those specific flows.

## What the Agent Does

## Environment

**Default: test against dev** (during spec implementation). Only test against prod if explicitly requested.

| | Dev (default) | Prod |
|---|---|---|
| **Start** | `npm run start:dev` | Already running (port 5173) |
| **App URL** | `https://maestro.tailf37050.ts.net:5174/dashboard` | `https://maestro.tailf37050.ts.net:5173/dashboard` |
| **Health check** | `curl -sk https://localhost:5174/api/health` | `curl -sk https://localhost:5173/api/health` |
| **DB** | `maestro-dev` | `maestro` |

Before testing, verify the dev servers are running. If not, start them with `npm run start:dev` from the project root.

### Phase 1: Manual functional testing

1. Read the spec (or description) and build a test plan
2. Verify servers are running (hit the health endpoint above)
3. Execute each test case by navigating and interacting with the app
4. Verify expected outcomes (text appears, state changes, navigation works)
5. Test edge cases (empty states, validation errors, boundary values)
6. Check console for errors and network requests for failures
7. Report results as pass/fail per test case

### Phase 2: E2E coverage audit

1. Read existing e2e test files (`*.e2e.test.ts`) relevant to the spec
2. Map each acceptance criterion to its covering e2e test (if any)
3. Identify gaps: acceptance criteria without e2e coverage
4. Report coverage matrix

## Output

### Manual Test Results

A table of test cases with pass/fail status.

### E2E Coverage Matrix

A table mapping acceptance criteria to existing e2e tests, highlighting gaps.
