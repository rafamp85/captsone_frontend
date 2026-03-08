---
name: command-meta-skill
description: Create new skills or review and improve existing ones, following the project convention and the agentskills.io specification.
argument-hint: "[create | review]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion
disable-model-invocation: true
---

# Manage Skills

Create new skills or review and improve existing ones, following the project convention and the agentskills.io specification.

For type conventions, frontmatter templates, and naming rules, see `references/templates.md`.

## Usage

```
/command-meta-skill            → Ask: create or review?
/command-meta-skill create     → Create a new skill
/command-meta-skill review     → Review an existing skill
```

## Flow

### Step 0: Determine Mode

If `$ARGUMENTS` is empty, use `AskUserQuestion`:

```yaml
question: "What do you want to do?"
header: "Mode"
options:
  - label: "Create new"
    description: "Create a skill from scratch"
  - label: "Review existing"
    description: "Analyze and improve an existing skill"
```

If `$ARGUMENTS` is "create" → Create Mode.
If `$ARGUMENTS` is "review" → Review Mode.

---

## Create Mode

### Step 1: Determine type

Use `AskUserQuestion`:

```yaml
question: "What type of skill?"
header: "Type"
options:
  - label: "Action"
    description: "Practice/methodology invocable by user and auto-activatable by Claude (action- prefix)"
  - label: "Command"
    description: "Interactive, only invocable by user with /"
  - label: "Task"
    description: "Autonomous agent with context: fork"
  - label: "Guidelines"
    description: "Internal guidelines, knowledge and conventions"
```

### Step 2: Collect information

Ask with `AskUserQuestion`:

- **Name**: Slug without prefix (e.g., `deploy`, not `command-deploy`)
- **Description**: Short and concise — max 15 words for the main sentence. Then append trigger phrases. Format: `Short sentence. Triggers: "phrase1", "phrase2".`
  - Good: `Review architecture compliance. Triggers: "review architecture", "check layers".`
  - Bad: `Review hexagonal architecture compliance: layer boundaries, dependencies, and module structure.` (too long)
  - For guidelines (third person): `This skill should be used when [short context]. [Short sentence].`
  - For commands (user-only), triggers are optional since Claude cannot auto-invoke them.

### Step 3: Tools, arguments, and hint

**For Action, Command and Task**, use `AskUserQuestion` with multiSelect:

```yaml
question: "What tools does it need?"
header: "Tools"
multiSelect: true
options:
  - label: "Read", description: "Read files"
  - label: "Write", description: "Write files"
  - label: "Edit", description: "Edit files"
  - label: "Glob", description: "Search files by pattern"
  - label: "Grep", description: "Search content in files"
  - label: "Bash", description: "Run terminal commands"
  - label: "Task", description: "Launch subagents"
  - label: "AskUserQuestion", description: "Interactive questions"
```

**Argument hint**: Ask if the skill accepts arguments. If yes, add `argument-hint` to the frontmatter. The hint is shown to the user after the `/` command name as usage guidance.

```yaml
question: "Does this skill accept arguments?"
header: "Args"
options:
  - label: "No arguments"
    description: "Skill runs without parameters"
  - label: "Optional arguments"
    description: "Accepts optional parameters (shown in brackets)"
  - label: "Required arguments"
    description: "Requires parameters (shown in angle brackets)"
```

Format: `argument-hint: "[optional] or <required>"`. Examples:
- `argument-hint: "[create | review]"` — optional mode selection
- `argument-hint: "<file-path>"` — required file path
- `argument-hint: "<type> [name]"` — required type, optional name

**For Task**, also ask for the agent name (will be created in `.claude/agents/`).

**For Guidelines**, only name and description from Step 2 (no tools, no argument-hint).

### Step 4: Generate files

Run `scripts/scaffold-skill.ts` to create the base structure, or create it manually. See `references/templates.md` for frontmatter templates and directory structure per type.

### Step 5: Apply progressive disclosure

Keep SKILL.md lean (< 2000 words, < 500 lines):

- Detail → `references/`
- Examples → `examples/`
- Utilities → `scripts/`

Reference all bundled resources from SKILL.md.

### Step 6: Show result

Show files created, changes made, and how to test.

---

## Review Mode

Run `scripts/validate-skill.ts` for quick automated validation. See `references/review-checklist.md` for the full manual review flow.

Summary:
1. List skills in `.claude/skills/` and `.claude/skills/guidelines/`
2. Choose skill with `AskUserQuestion`
3. Run `scripts/validate-skill.ts` on the selected skill
4. Complement with manual analysis per `references/review-checklist.md`
5. Show diagnostic
6. Apply improvements if approved

---

## Writing style

- **Description**: Max 15 words for the main sentence. Concise and direct. Then append `Triggers: "x", "y".` for Claude matching. For commands, triggers are optional. For guidelines, use third person: `This skill should be used when [context]. [Short sentence].`
- **Argument hint**: Include `argument-hint` in frontmatter for skills that accept arguments. Use `[brackets]` for optional, `<angle>` for required.
- **Body**: Imperative/infinitive form ("To create X, define Y")
- **Avoid**: Second person, verbose descriptions, filler words in descriptions
- **Target**: < 2000 words in SKILL.md

## Additional resources

### References

- **`references/templates.md`** — Frontmatter templates, directory structure, and naming rules per type
- **`references/review-checklist.md`** — Detailed review flow and diagnostic checklist

### Scripts

- **`scripts/validate-skill.ts`** — Validate a skill against conventions. Usage: `npx tsx scripts/validate-skill.ts <path>`
- **`scripts/scaffold-skill.ts`** — Scaffold a new skill structure. Usage: `npx tsx scripts/scaffold-skill.ts <action|command|task|guidelines> <name> [--path <base>]`
