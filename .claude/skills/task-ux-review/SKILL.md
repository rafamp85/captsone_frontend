---
name: task-ux-review
description: Visual UX evaluation of the running application using Playwright screenshots. Triggers: "review UX", "visual review", "check UI".
argument-hint: "[spec:<path> | description of what to test]"
agent: ux-reviewer
allowed-tools: Read, Glob, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_wait_for, mcp__playwright__browser_resize, mcp__playwright__browser_tabs
---

# UX Review

Launch a subagent to perform a visual UX review of the running application.

The agent uses browser MCP (Playwright) to navigate, screenshot, interact with, and evaluate the UI against UX best practices.

## Usage

```
/task-ux-review spec:planning/specs/16-structured-chat.md   → Extract scope from spec file
/task-ux-review "Session dashboard: launch, list sessions"   → Free-text description
/task-ux-review                                              → Auto-discover all screens
```

## Scope

### From spec file (preferred)

If `$ARGUMENTS` starts with `spec:`, read the spec file at the given path and extract:
- **What** section → high-level description of what to test
- **Acceptance criteria** → verifiable conditions to check visually
- **Requirements** (frontend only) → expected UI behavior
- **How** sections with frontend tasks → specific components and screens to test

Use these to build a focused test plan. Only test the screens and flows relevant to the spec — skip unrelated parts of the app.

### From description

If a free-text description is provided (e.g., `"Session dashboard: launch, list, stop sessions"`), focus the review on those specific screens and flows.

### Auto-discover

If no arguments are provided, discover all screens by reading the project routes and test every reachable page.

## Environment

**Default: test against dev** (during spec implementation). Only test against prod if explicitly requested.

| | Dev (default) | Prod |
|---|---|---|
| **Start** | `npm run start:dev` | Already running (port 5173) |
| **App URL** | `https://maestro.tailf37050.ts.net:5174/dashboard` | `https://maestro.tailf37050.ts.net:5173/dashboard` |
| **Health check** | `curl -sk https://localhost:5174/api/health` | `curl -sk https://localhost:5173/api/health` |
| **DB** | `maestro-dev` | `maestro` |

Before testing, verify the dev servers are running. If not, start them with `npm run start:dev` from the project root.

## What the Agent Does

1. Verify servers are running (hit the health endpoint above)
2. If spec file provided, read it and extract the test scope (What + Acceptance criteria + frontend Requirements)
4. Navigate each screen in scope and capture screenshots
5. Test user flows described in the scope (or discover them from routes)
6. Evaluate against a UX checklist (layout, typography, colors, responsive, accessibility)
7. Test responsive behavior at desktop, tablet (768px), and mobile (375px)
8. Report findings as a summary table with screenshots

## Output

A summary table of screens reviewed (pass/fail) and a list of issues found with severity, description, and screenshot references.

When invoked with a spec file, also report which acceptance criteria were verified visually (pass/fail).
