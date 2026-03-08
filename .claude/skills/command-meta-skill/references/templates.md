# Templates by Skill Type

## Type Summary

| Location | Prefix | Who activates | `disable-model-invocation` | Key fields |
|----------|--------|---------------|---------------------------|------------|
| Root | `action-` | Claude or user | `false` | — |
| Root | `command-` | User only with `/` | `true` | `allowed-tools` |
| Root | `task-` | Claude or user (fork) | `false` | `context: fork`, `agent:` |
| `guidelines/` | — | Claude only (not shown as `/`) | `false` | — |

---

## Action

Practice or methodology skill invocable by both the user and Claude. Claude can auto-activate it when it detects the practice should be applied.

### Structure

```
action-[name]/
├── SKILL.md
├── references/     (optional)
├── examples/       (optional)
└── scripts/        (optional)
```

### Frontmatter

```yaml
---
name: action-[name]
description: What the skill does in one sentence. Triggers: "trigger 1", "trigger 2".
allowed-tools: [comma-separated tools]
---
```

### Required fields

- `name`: Must match the folder name
- `description`: Lead with what it does, then append `Triggers: "x", "y".` for Claude matching

### Optional fields

- `argument-hint`: If it accepts arguments
- `allowed-tools`: Tools it needs

---

## Command

Interactive skill invocable only by the user with `/`.

### Structure

```
command-[name]/
├── SKILL.md
├── references/     (optional)
├── examples/       (optional)
└── scripts/        (optional)
```

### Frontmatter

```yaml
---
name: command-[name]
description: What the skill does in one sentence (triggers optional for commands).
argument-hint: "[args]"
allowed-tools: [comma-separated tools]
disable-model-invocation: true
---
```

### Required fields

- `name`: Must match the folder name
- `description`: Lead with what it does. Triggers optional (user-only invocation)
- `disable-model-invocation: true`: Always for commands

### Optional fields

- `argument-hint`: If it accepts arguments
- `allowed-tools`: Tools it needs

---

## Task

Autonomous skill that launches a subagent with its own context.

### Structure

```
task-[name]/
├── SKILL.md
├── references/     (optional)
└── scripts/        (optional)

# Also create the agent:
.claude/agents/[name].md
```

### Frontmatter

```yaml
---
name: task-[name]
description: What the skill does in one sentence. Triggers: "trigger 1", "trigger 2".
argument-hint: "[args]"
context: fork
agent: [agent-name]
allowed-tools: [comma-separated tools]
---
```

### Required fields

- `name`: Must match the folder name
- `description`: Lead with what it does, then append `Triggers: "x", "y".` for Claude matching
- `context: fork`: Always for tasks
- `agent`: File name in `.claude/agents/` (without extension)

### Optional fields

- `argument-hint`: If it accepts arguments
- `allowed-tools`: Tools available to the agent

---

## Guidelines (subfolder `guidelines/`)

Internal guidelines, knowledge and conventions that Claude loads automatically. Not shown as `/` command because it lives in a subfolder.

### Structure

```
guidelines/
└── [name]/
    ├── SKILL.md
    ├── references/     (optional)
    └── assets/         (optional)
```

### Frontmatter

```yaml
---
name: [name]
description: What these guidelines cover in one sentence. Triggers: "trigger 1", "trigger 2".
---
```

### Required fields

- `name`: Must match the folder name
- `description`: Third person, describe when Claude should load these guidelines

### Optional fields

- `metadata`: Author, version, etc.

---

## Common Rules for All Types

### Naming

- Lowercase letters, numbers, and hyphens only
- Must not start or end with a hyphen
- No consecutive hyphens (`--`)
- Max 64 characters
- `name` must match the folder name

### Description

- Max 1024 characters, but keep the main sentence under 15 words
- Concise and direct — no filler words, no verbose explanations
- Append `Triggers: "x", "y".` for Claude auto-matching (optional for commands)
- Format: `Short sentence. Triggers: "phrase1", "phrase2".`
- For guidelines: `This skill should be used when [short context]. Short sentence.`

### Argument Hint

- Add `argument-hint` to frontmatter when the skill accepts arguments
- Use `[brackets]` for optional args, `<angle brackets>` for required args
- Examples: `"[create | review]"`, `"<file-path>"`, `"<type> [name]"`

### Progressive disclosure

- SKILL.md: < 500 lines, ~1500-2000 words
- Detail → `references/`
- Examples → `examples/`
- Utilities → `scripts/`
- Assets → `assets/`
- Reference all resources from SKILL.md

### Writing style

- Imperative/infinitive form: "To create X, do Y"
- No second person
- Objective, instructional language

### Specification

- Official standard: https://agentskills.io/specification
