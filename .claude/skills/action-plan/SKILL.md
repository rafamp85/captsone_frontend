---
name: action-plan
description: Create a TDD development plan for a feature following inside-out strategy, save it to the Notion backlog, and track progress. Triggers: "plan", "create a plan", "implement", "update plan".
argument-hint: "[feature description | implement | update]"
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-create-pages, mcp__notion__notion-update-page
---

# Development Plan

Create a TDD development plan, save it to the Notion backlog, and track implementation progress.

## Notion Backlog

- **Database:** "Frontend Template - Backlog"
- **Data source ID:** `<your-data-source-id>`
- **Properties:** Feature (title), Status (pending/in_progress/done), Dependencies, Git (commit strategy), Branch, Base, Priority, Plan ID (auto, prefix PLAN)

## Usage

```
/action-plan whatever feature      → Create plan for "whatever feature" and save to Notion
/action-plan implement             → Implement the next pending plan from backlog
/action-plan update                → Update the current in_progress plan (mark [x], add stats)
```

## Before Creating the Plan

Review these guidelines:
- `guidelines/xp-tdd-practices` (TDD cycle, TPP, inside-out)
- `guidelines/architecture-hexagonal` (layers, module structure)

## Flow

### Step 0: Determine Mode

If `$ARGUMENTS` is "implement" → Implement Mode.
If `$ARGUMENTS` is "update" → Update Mode.
Otherwise → Plan Mode (create a new plan).

---

## Plan Mode (default)

### Step 1: Understand the requirement

1. Read the codebase (key files, existing modules) to understand current state
2. Ask clarifying questions if the requirement is ambiguous

### Step 2: Identify layers and create the plan

1. **Identify layers**: Which layers are involved (Domain, Application, Infrastructure)?
2. **Define test cases**: List cases from simplest to most complex (TDD)
3. **Development order**: Inside-out (Domain → Application → Infrastructure)
4. **Acceptance criteria**: What defines "done"?

### Step 3: Git strategy (default)

Always use: **commit-per-section + feature branch**, PR to current branch.
- Git: `commit-per-section`
- Branch: `feat/<short-name>` created from the current branch
- PR target: the current branch at plan creation time

### Step 4: Show the plan and ask for approval

Display the full plan. The user can approve, request changes, or cancel. No need for AskUserQuestion — just show the plan and wait for user response.

### Step 5: Save to Notion

Create a page in the Notion backlog using `mcp__notion__notion-create-pages` with:
- **Parent:** `{"data_source_id": "<your-data-source-id>"}`
- **Properties:** Feature (title), Status, Git, Branch, Dependencies, Priority
- **Content:** The plan in Notion markdown format:

```markdown
## Requirement
Brief description of what needs to be built.

## Layers Involved
- [ ] Domain (value objects, entities)
- [ ] Application (use cases, DTOs, ports)
- [ ] Infrastructure (adapters, UI components, hooks)

## Test Cases (ordered simple → complex)
1. ...
2. ...

## Development Order

### Domain  <!-- commit point -->
- [ ] Task 1
- [ ] Task 2

### Application  <!-- commit point -->
- [ ] Task 3
- [ ] Task 4

### Infrastructure/Adapters  <!-- commit point -->
- [ ] Task 5

### Infrastructure/UI  <!-- commit point -->
- [ ] Task 6
- [ ] Task 7

### Wiring  <!-- commit point -->
- [ ] Task 8

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests pass

## Quality Gates
- [ ] /task-validate
- [ ] /task-code-review
- [ ] /task-testing-review
- [ ] /task-architecture-review
- [ ] /task-frontend-review
- [ ] /task-qa (if frontend UI)
- [ ] /task-ux-review (if frontend UI)

## Stats
Tests: pending
Quality fixes: pending
```

### Step 6: Start implementation (if approved)

If the user chose "Approve and save to Notion", proceed to Implement Mode with the newly created plan.

---

## Implement Mode

### Step 1: Select plan

1. Fetch the Notion backlog to find plans with Status `pending` that have a Development Order section
2. Check that all dependencies have Status `done`
3. If multiple plans are ready, ask which one to implement
4. If only one is ready, confirm it with the user

### Step 2: Prepare

1. Fetch the full plan page from Notion
2. Save the current commit as base: `git rev-parse HEAD` → update Notion `Base` property
3. Update Notion `Status` to `in_progress`
4. Record the current branch name as the PR target (base branch)
5. If Branch property has a feature branch name, create it from the current branch (via Bash)

### Step 3: Implement

For each Development Order section (in order):
1. Use `/action-tdd` to implement following the TDD cycle
2. Mark completed tasks as `[x]` in Notion using `mcp__notion__notion-update-page`:
   ```json
   {"command": "update_content", "content_updates": [{"old_str": "- [ ] Task", "new_str": "- [x] Task"}]}
   ```
3. Commit according to the Git property:
   - `commit-per-green`: commit after each green test
   - `commit-per-section`: commit after completing the section

### Step 4: Validate

After all sections are complete:
1. Run `/task-validate` to verify compile, lint, format, tests
2. Fix any issues found
3. Mark acceptance criteria as `[x]` in Notion

### Step 5: Quality reviews

Build the git range from the `Base` property: `<base>...HEAD`

**Phase 1 — Static reviews (parallel):**
- `/task-code-review <base>...HEAD`
- `/task-testing-review <base>...HEAD`
- `/task-architecture-review <base>...HEAD`
- `/task-frontend-review <base>...HEAD`

Wait for all to complete. Apply fixes.

**Phase 2 — Visual/functional review (if frontend UI):**
1. Start dev servers: backend on 8080, frontend on 4200 (`npm start`)
2. Run `/task-qa` and `/task-ux-review`

Mark each quality gate as `[x]` in Notion.

### Step 6: Finalize

1. Update Stats section in Notion (test counts, quality fixes)
2. Update Notion `Status` to `done`
3. If on a feature branch, create PR to the base branch recorded in Step 2 (via Bash with `gh pr create --base <base-branch>`)
4. Show completion summary

---

## Update Mode

### Step 1: Find current plan

Fetch the Notion backlog and find the plan with Status `in_progress`.

### Step 2: Analyze completion

1. Fetch the full plan page from Notion
2. Read the codebase to determine which tasks are actually done
3. Run `npm test` (via Bash) to get current test counts

### Step 3: Update the plan

Using `mcp__notion__notion-update-page` with `update_content`:
- Mark completed items as `[x]`
- Mark completed acceptance criteria as `[x]`
- Fill in Quality Gates results
- Fill in Stats section

### Step 4: Check if plan is done

If all items are `[x]` and all quality gates passed:
- Update Notion `Status` to `done`
- Show completion summary

If not all done:
- Show what remains
- Keep status as `in_progress`
