---
name: action-plan
description: Create a TDD development plan for a feature following inside-out strategy. Triggers: "plan", "create a plan".
argument-hint: "[feature description]"
allowed-tools: Read, Glob, Grep, Bash, AskUserQuestion
---

# Development Plan

Create a development plan following TDD and architecture practices.

## Usage

```
/action-plan add user authentication
/action-plan implement order checkout
```

## Before Creating the Plan

Review these guidelines:
- `guidelines/xp-tdd-practices` (TDD cycle, TPP, inside-out)
- `guidelines/architecture-hexagonal` (layers, module structure)

## Plan Structure

1. **Understand the requirement**: Ask clarifying questions if needed
2. **Identify layers**: Which layers are involved (Domain, Application, Infrastructure)?
3. **Define test cases**: List cases from simplest to most complex (TDD)
4. **Development order**: Inside-out (Domain -> UseCase -> Infrastructure)
5. **Acceptance criteria**: What defines "done"?

## Plan Format

```markdown
# [Feature Name]

## Requirement
Brief description of what needs to be built.

## Layers Involved
- [ ] Domain (entities, VOs, services, repositories)
- [ ] Application (use cases, DTOs)
- [ ] Infrastructure (adapters, HTTP)

## Test Cases (ordered simple -> complex)
1. ...
2. ...

## Development Order
1. Domain: ...
2. Application: ...
3. Infrastructure: ...

## Acceptance Criteria
- [ ] All tests pass
- [ ] Code follows architecture guidelines
```

## Spec Context (auto-approve)

When called from `/action-spec implement`, the requirement and tasks are already defined in the spec's How section. In this case:

1. Read the spec section content (passed as context)
2. Read the codebase to understand existing patterns
3. Generate the TDD plan (test cases ordered simple → complex)
4. **Show the plan but proceed directly** — do not ask for approval
5. The spec was already approved by the user; the plan just orders the TDD steps

To detect spec context: if the calling context includes a spec How section with `<!-- commit point -->` markers, treat it as pre-approved.

## Standalone Usage (ask approval)

When called directly by the user (no spec context):

1. Generate the plan
2. Show it and ask for approval via `AskUserQuestion`
3. After approval, proceed to implementation
