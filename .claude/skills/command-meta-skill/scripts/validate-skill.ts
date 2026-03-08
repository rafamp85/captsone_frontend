#!/usr/bin/env npx tsx

/**
 * Validates a skill directory against the project conventions and agentskills.io spec.
 *
 * Usage: npx tsx validate-skill.ts <path-to-skill-directory>
 * Example: npx tsx validate-skill.ts ~/.claude/skills/command-meta-skill
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { basename, join, dirname } from 'path';

interface ValidationResult {
  pass: boolean;
  rule: string;
  detail?: string;
}

interface Frontmatter {
  name?: string;
  description?: string;
  'argument-hint'?: string;
  'allowed-tools'?: string;
  'disable-model-invocation'?: boolean;
  context?: string;
  agent?: string;
  'user-invocable'?: boolean;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\S+?):\s*(.+)$/);
    if (kv) {
      const [, key, val] = kv;
      if (val === 'true') frontmatter[key] = true;
      else if (val === 'false') frontmatter[key] = false;
      else frontmatter[key] = val.replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter, body: match[2] };
}

function detectType(skillPath: string): 'action' | 'command' | 'task' | 'guidelines' {
  const dirName = basename(skillPath);
  const parentName = basename(dirname(skillPath));

  if (parentName === 'guidelines') return 'guidelines';
  if (dirName.startsWith('action-')) return 'action';
  if (dirName.startsWith('command-')) return 'command';
  if (dirName.startsWith('task-')) return 'task';
  return 'action';
}

function validate(skillPath: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const dirName = basename(skillPath);
  const skillMdPath = join(skillPath, 'SKILL.md');
  const type = detectType(skillPath);

  // Check SKILL.md exists
  if (!existsSync(skillMdPath)) {
    results.push({
      pass: false,
      rule: 'SKILL.md exists',
      detail: `Not found at ${skillMdPath}`,
    });
    return results;
  }
  results.push({ pass: true, rule: 'SKILL.md exists' });

  const content = readFileSync(skillMdPath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  // --- Frontmatter checks ---

  // name required
  results.push({
    pass: !!frontmatter.name,
    rule: 'Frontmatter: `name` present',
    detail: frontmatter.name ? `name: ${frontmatter.name}` : 'Missing `name`',
  });

  // name matches directory
  if (frontmatter.name) {
    results.push({
      pass: frontmatter.name === dirName,
      rule: 'Frontmatter: `name` matches directory',
      detail: `name="${frontmatter.name}" vs dir="${dirName}"`,
    });
  }

  // name format: lowercase, hyphens, no consecutive hyphens, max 64
  if (frontmatter.name) {
    const nameValid =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(frontmatter.name) &&
      !frontmatter.name.includes('--') &&
      frontmatter.name.length <= 64;
    results.push({
      pass: nameValid,
      rule: 'Frontmatter: `name` format valid',
      detail: nameValid
        ? 'Lowercase, hyphens, no consecutive hyphens, <= 64 chars'
        : `"${frontmatter.name}" violates naming rules`,
    });
  }

  // description required
  results.push({
    pass: !!frontmatter.description,
    rule: 'Frontmatter: `description` present',
    detail: frontmatter.description ? `${frontmatter.description.length} chars` : 'Missing `description`',
  });

  // description max 1024 chars
  if (frontmatter.description) {
    results.push({
      pass: frontmatter.description.length <= 1024,
      rule: 'Frontmatter: `description` <= 1024 chars',
      detail: `${frontmatter.description.length} chars`,
    });
  }

  // description third person with triggers
  if (frontmatter.description) {
    const hasThirdPerson =
      frontmatter.description.includes('This skill should be used when') ||
      frontmatter.description.includes('This skill should be used');
    results.push({
      pass: hasThirdPerson,
      rule: 'Frontmatter: `description` uses third person',
      detail: hasThirdPerson
        ? "Contains 'This skill should be used when...'"
        : "Should start with 'This skill should be used when...'",
    });
  }

  // --- Type-specific checks ---

  if (type === 'command') {
    results.push({
      pass: frontmatter['disable-model-invocation'] === true,
      rule: 'Command: `disable-model-invocation: true`',
      detail:
        frontmatter['disable-model-invocation'] === true
          ? 'Present'
          : 'Commands must have disable-model-invocation: true',
    });
  }

  if (type === 'task') {
    results.push({
      pass: frontmatter.context === 'fork',
      rule: 'Task: `context: fork`',
      detail: frontmatter.context === 'fork' ? 'Present' : 'Tasks must have context: fork',
    });

    results.push({
      pass: !!frontmatter.agent,
      rule: 'Task: `agent` field present',
      detail: frontmatter.agent ? `agent: ${frontmatter.agent}` : 'Tasks must specify an agent',
    });
  }

  if (type === 'action' || type === 'command' || type === 'task') {
    results.push({
      pass: !!frontmatter['allowed-tools'],
      rule: `${type.charAt(0).toUpperCase() + type.slice(1)}: \`allowed-tools\` present`,
      detail: frontmatter['allowed-tools'] ? `Tools: ${frontmatter['allowed-tools']}` : 'Should specify allowed-tools',
    });
  }

  if (type === 'guidelines') {
    // Guidelines should NOT have disable-model-invocation
    if (frontmatter['disable-model-invocation'] === true) {
      results.push({
        pass: false,
        rule: 'Guidelines: no `disable-model-invocation`',
        detail: 'Guidelines skills should not have disable-model-invocation: true',
      });
    }
  }

  if (type === 'action') {
    // Action skills should NOT have disable-model-invocation
    if (frontmatter['disable-model-invocation'] === true) {
      results.push({
        pass: false,
        rule: 'Action: no `disable-model-invocation`',
        detail:
          'Action skills are auto-activatable and should not have disable-model-invocation. Use command- prefix for user-only skills.',
      });
    }
  }

  // --- Progressive disclosure ---

  const lines = body.split('\n');
  const lineCount = lines.length;
  results.push({
    pass: lineCount <= 500,
    rule: 'Progressive disclosure: SKILL.md < 500 lines',
    detail: `${lineCount} lines`,
  });

  const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;
  results.push({
    pass: wordCount <= 3000,
    rule: 'Progressive disclosure: SKILL.md < 3000 words',
    detail: `${wordCount} words (ideal: < 2000)`,
  });

  // Check for references/ directory
  const refsPath = join(skillPath, 'references');
  const hasRefs = existsSync(refsPath) && statSync(refsPath).isDirectory();
  if (wordCount > 2000 && !hasRefs) {
    results.push({
      pass: false,
      rule: 'Progressive disclosure: move detail to references/',
      detail: `${wordCount} words in SKILL.md but no references/ directory`,
    });
  }

  // Check referenced files exist
  const refMatches = body.matchAll(/`references\/([^`]+)`/g);
  for (const match of refMatches) {
    const refFile = join(skillPath, 'references', match[1]);
    results.push({
      pass: existsSync(refFile),
      rule: `Referenced file exists: references/${match[1]}`,
      detail: existsSync(refFile) ? 'Found' : `Missing: ${refFile}`,
    });
  }

  const scriptMatches = body.matchAll(/`scripts\/([^`]+)`/g);
  for (const match of scriptMatches) {
    const scriptFile = join(skillPath, 'scripts', match[1]);
    results.push({
      pass: existsSync(scriptFile),
      rule: `Referenced file exists: scripts/${match[1]}`,
      detail: existsSync(scriptFile) ? 'Found' : `Missing: ${scriptFile}`,
    });
  }

  // --- Writing style (heuristic) ---

  const secondPersonPatterns = [/\bYou should\b/i, /\bYou need to\b/i, /\bYou can\b/i, /\bYou must\b/i];
  const secondPersonFound = secondPersonPatterns.filter((p) => p.test(body));
  results.push({
    pass: secondPersonFound.length === 0,
    rule: 'Writing style: no second person',
    detail:
      secondPersonFound.length === 0
        ? "No 'You should/need/can/must' found"
        : `Found: ${secondPersonFound.map((p) => p.source).join(', ')}`,
  });

  return results;
}

// --- Main ---

const skillPath = process.argv[2];

if (!skillPath) {
  console.error('Usage: npx tsx validate-skill.ts <path-to-skill-directory>');
  process.exit(1);
}

if (!existsSync(skillPath)) {
  console.error(`Directory not found: ${skillPath}`);
  process.exit(1);
}

const results = validate(skillPath);
const dirName = basename(skillPath);
const type = detectType(skillPath);

console.log(`\n  Default: ${dirName}`);
console.log(`  Type:  ${type}`);
console.log(`  ${'─'.repeat(50)}\n`);

let passed = 0;
let failed = 0;

for (const r of results) {
  const icon = r.pass ? '  PASS' : '  FAIL';
  console.log(`${icon}  ${r.rule}`);
  if (r.detail) {
    console.log(`        ${r.detail}`);
  }
  if (r.pass) passed++;
  else failed++;
}

console.log(`\n  ${'─'.repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed\n`);

process.exit(failed > 0 ? 1 : 0);
