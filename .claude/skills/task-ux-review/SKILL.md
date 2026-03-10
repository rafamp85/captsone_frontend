---
name: task-ux-review
description: Visual UX evaluation of the running application using Playwright screenshots. Triggers: "review UX", "visual review", "check UI".
argument-hint: "[spec:<path> | description of what to test]"
context: fork
agent: ux-reviewer
allowed-tools: Read, Glob, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_wait_for, mcp__playwright__browser_resize, mcp__playwright__browser_tabs
---

# UX Review

Visual UX review of the running application using Playwright.

## Usage

```
/task-ux-review spec:planning/specs/16-structured-chat.md   → Extract scope from spec file
/task-ux-review "Session dashboard: launch, list sessions"   → Free-text description
/task-ux-review                                              → Auto-discover all screens
```

## Scope

### From spec file (preferred)

If `$ARGUMENTS` starts with `spec:`, read the spec file and extract:
- **What** section → features to review
- **Acceptance criteria** → conditions to check visually
- **Requirements** (frontend only) → expected UI behavior

### From description

If a free-text description is provided, focus on those specific screens and flows.

### Auto-discover

If no arguments are provided, discover all screens from project routes.

## Environment

**Default: test against dev**. Only test against prod if explicitly requested.

| | Dev (default) | Prod |
|---|---|---|
| **App URL** | `https://maestro.tailf37050.ts.net:5174/dashboard` | `https://maestro.tailf37050.ts.net:5173/dashboard` |
| **Health check** | `curl -sk https://localhost:5174/api/health` | `curl -sk https://localhost:5173/api/health` |
| **Start** | `npm run start:dev` | Already running |

Before testing, verify the dev servers are running. If not, start them with `npm run start:dev` from the project root.
