# Skill Review Flow

## Step 1: List Skills

Search for skills in two locations:

- `.claude/skills/action-*` (practice/methodology, user + Claude)
- `.claude/skills/command-*` (interactive, user only)
- `.claude/skills/task-*` (autonomous subagent)
- `.claude/skills/guidelines/*/` (guidelines, Claude only)

## Step 2: Choose Skill

Use `AskUserQuestion` for the user to choose:

```yaml
question: "Which skill do you want to review?"
header: "Skill"
options:
  - label: "[skill-name-1]"
    description: "[description]"
  - label: "[skill-name-2]"
    description: "[description]"
```

## Step 3: Analyze

Read the SKILL.md and evaluate:

### 3.1 Frontmatter

- [ ] `name` present and matches folder
- [ ] `name` follows format (lowercase, hyphens, max 64 chars)
- [ ] `description` present and non-empty
- [ ] `description` leads with what the skill does (user-facing when browsing `/`)
- [ ] `description` ends with `Triggers: "x", "y".` for Claude matching (optional for commands)
- [ ] `disable-model-invocation: true` if `command-*`
- [ ] `context: fork` and `agent:` if `task-*`
- [ ] `allowed-tools` present if command, task, or default
- [ ] `argument-hint` if it accepts arguments
- [ ] Skill in `guidelines/` does NOT have `disable-model-invocation`

### 3.2 Structure

- [ ] Folder with SKILL.md exists
- [ ] Correct location per type (command- and task- at root, guidelines in subfolder)
- [ ] Referenced resources from SKILL.md exist
- [ ] No orphan files without references
- [ ] Guidelines skills are inside the `guidelines/` subfolder

### 3.3 Progressive Disclosure

- [ ] SKILL.md < 500 lines / ~2000 words
- [ ] Detailed content in `references/` (not everything in SKILL.md)
- [ ] SKILL.md references resource files
- [ ] Each reference file is < 5000 words

### 3.4 Writing Style

- [ ] Body uses imperative/infinitive form
- [ ] No second person
- [ ] Description uses third person
- [ ] Objective, instructional language

### 3.5 Content

- [ ] Has usage section with examples
- [ ] Has clear flow/steps
- [ ] Uses `AskUserQuestion` where interactivity is needed
- [ ] Scripts are executable (if any)
- [ ] Examples are complete (if any)

## Step 4: Diagnostic

Show:

```markdown
## Diagnostic for [skill-name]

### Status
- Type: [command/task/default/guidelines]
- Location: [root/guidelines/]
- Frontmatter: [complete/incomplete]
- Progressive disclosure: [good/needs improvement]
- Style: [correct/needs improvement]

### Issues found
- [ ] Issue 1
- [ ] Issue 2

### Suggested improvements
1. Improvement 1
2. Improvement 2
```

## Step 5: Apply Improvements

Use `AskUserQuestion`:

```yaml
question: "Apply improvements?"
header: "Action"
options:
  - label: "Apply all"
    description: "Update the skill with all improvements"
  - label: "Choose which"
    description: "Select which improvements to apply"
  - label: "Show only"
    description: "Don't modify anything, just inform"
```

## Step 6: Execute and Confirm

Apply selected changes and show which files were modified.
