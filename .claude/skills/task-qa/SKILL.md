---
name: task-qa
description: Functional QA testing against a spec with Playwright and e2e coverage audit. Triggers: "QA", "manual testing", "check flows".
argument-hint: "spec:<path>"
context: fork
agent: qa-tester
allowed-tools: Read, Glob, Grep, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_fill_form, mcp__playwright__browser_select_option, mcp__playwright__browser_press_key, mcp__playwright__browser_wait_for, mcp__playwright__browser_resize, mcp__playwright__browser_tabs, mcp__playwright__browser_console_messages, mcp__playwright__browser_network_requests, mcp__playwright__browser_evaluate
---

# QA Testing

Test the running application against a spec and audit e2e test coverage.

## Usage

```
/task-qa spec:planning/specs/16-structured-chat.md   → Extract scope from spec file
/task-qa "Session dashboard: launch, rename, stop"    → Free-text description
```

## Scope

### From spec file (preferred)

If `$ARGUMENTS` starts with `spec:`, read the spec file and extract:
- **What** section → features to test
- **Requirements** → expected behavior (SHALL/MUST)
- **Acceptance criteria** → verifiable conditions
- **How** sections → specific components, routes, and flows

Build a test plan from the acceptance criteria.

### From description

If a free-text description is provided, focus testing on those specific flows.

## Environment

**Default: test against dev** (during spec implementation). Only test against prod if explicitly requested.

| | Dev (default) | Prod |
|---|---|---|
| **App URL** | `https://maestro.tailf37050.ts.net:5174/dashboard` | `https://maestro.tailf37050.ts.net:5173/dashboard` |
| **Health check** | `curl -sk https://localhost:5174/api/health` | `curl -sk https://localhost:5173/api/health` |
| **Start** | `npm run start:dev` | Already running |

Before testing, verify the dev servers are running. If not, start them with `npm run start:dev` from the project root.
