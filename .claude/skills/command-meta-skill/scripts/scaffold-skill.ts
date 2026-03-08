#!/usr/bin/env npx tsx

/**
 * Scaffolds a new skill directory with the correct structure and frontmatter template.
 *
 * Usage: npx tsx scaffold-skill.ts <type> <name> [--path <base-path>]
 *
 * Types: action, command, task, guidelines
 *
 * Examples:
 *   npx tsx scaffold-skill.ts action spec
 *   npx tsx scaffold-skill.ts command deploy
 *   npx tsx scaffold-skill.ts task code-review
 *   npx tsx scaffold-skill.ts guidelines api-patterns
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

type SkillType = 'action' | 'command' | 'task' | 'guidelines';

interface SkillConfig {
  type: SkillType;
  name: string;
  basePath: string;
}

function getSkillDir(type: SkillType, name: string, basePath: string): string {
  switch (type) {
    case 'action':
      return join(basePath, `action-${name}`);
    case 'command':
      return join(basePath, `command-${name}`);
    case 'task':
      return join(basePath, `task-${name}`);
    case 'guidelines':
      return join(basePath, 'guidelines', name);
  }
}

function getDirName(type: SkillType, name: string): string {
  switch (type) {
    case 'action':
      return `action-${name}`;
    case 'command':
      return `command-${name}`;
    case 'task':
      return `task-${name}`;
    case 'guidelines':
      return name;
  }
}

function generateFrontmatter(type: SkillType, dirName: string, name: string): string {
  switch (type) {
    case 'action':
      return `---
name: ${dirName}
description: TODO: What it does in one sentence. Triggers: "trigger1", "trigger2".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---`;

    case 'command':
      return `---
name: ${dirName}
description: TODO: What it does in one sentence.
argument-hint: "TODO: define arguments or remove this field"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
disable-model-invocation: true
---`;

    case 'task':
      return `---
name: ${dirName}
description: TODO: What it does in one sentence. Triggers: "trigger1", "trigger2".
argument-hint: "TODO: define arguments or remove this field"
context: fork
agent: ${name}
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---`;

    case 'guidelines':
      return `---
name: ${dirName}
description: TODO: What these guidelines cover in one sentence. Triggers: "trigger1", "trigger2".
---`;
  }
}

function generateBody(type: SkillType, dirName: string): string {
  const title = dirName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const usageSection =
    type === 'guidelines'
      ? `## Activation

Claude loads this knowledge automatically when relevant.
Not shown as a \`/\` command.`
      : `## Usage

\`\`\`
/${dirName}            → TODO: describe usage
\`\`\``;

  return `
# ${title}

TODO: Brief description of what this skill does (1-2 sentences).

${usageSection}

## Flow

### Step 1: TODO

TODO: Define the workflow steps.

## Additional resources

### References

- **\`references/guide.md\`** — TODO: describe reference content
`;
}

function scaffold(config: SkillConfig): void {
  const dirName = getDirName(config.type, config.name);
  const skillDir = getSkillDir(config.type, config.name, config.basePath);

  if (existsSync(skillDir)) {
    console.error(`Directory already exists: ${skillDir}`);
    process.exit(1);
  }

  // Create directories
  mkdirSync(join(skillDir, 'references'), { recursive: true });

  // Create SKILL.md
  const frontmatter = generateFrontmatter(config.type, dirName, config.name);
  const body = generateBody(config.type, dirName);
  writeFileSync(join(skillDir, 'SKILL.md'), frontmatter + '\n' + body);

  // Create placeholder reference
  writeFileSync(
    join(skillDir, 'references', 'guide.md'),
    `# ${dirName} — Reference Guide\n\nTODO: Add detailed reference content here.\n`
  );

  // Task type: create agent file
  if (config.type === 'task') {
    const agentsDir = join(config.basePath, '..', 'agents');
    mkdirSync(agentsDir, { recursive: true });
    writeFileSync(
      join(agentsDir, `${config.name}.md`),
      `# ${config.name}\n\nTODO: Define the agent's system prompt and behavior.\n`
    );
    console.log(`  Created: ${join(agentsDir, `${config.name}.md`)}`);
  }

  console.log(`\n  Scaffolded: ${skillDir}`);
  console.log(`  Type: ${config.type}`);
  console.log(`  Files created:`);
  console.log(`    ${join(skillDir, 'SKILL.md')}`);
  console.log(`    ${join(skillDir, 'references', 'guide.md')}`);
  console.log(`\n  Next steps:`);
  console.log(`    1. Edit SKILL.md: fill in TODOs`);
  console.log(`    2. Add references/ content as needed`);
  console.log(`    3. Validate: npx tsx validate-skill.ts ${skillDir}\n`);
}

// --- Parse args ---

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx tsx scaffold-skill.ts <action|command|task|guidelines> <name> [--path <base-path>]');
  process.exit(1);
}

const type = args[0] as SkillType;
if (!['action', 'command', 'task', 'guidelines'].includes(type)) {
  console.error(`Invalid type: ${type}. Must be action, command, task, or guidelines.`);
  process.exit(1);
}

const name = args[1];
if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name) || name.includes('--')) {
  console.error(`Invalid name: ${name}. Use lowercase, numbers, hyphens. No consecutive hyphens.`);
  process.exit(1);
}

const pathIdx = args.indexOf('--path');
const basePath =
  pathIdx !== -1 && args[pathIdx + 1] ? args[pathIdx + 1] : join(process.env.HOME || '~', '.claude', 'skills');

scaffold({ type, name, basePath });
