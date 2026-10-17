#!/usr/bin/env node
// Guards the `Material Symbols Outlined` subset configured in app/root.tsx.
//
// The subset keeps the woff2 at ~10 KB instead of 1.14 MB, but Google silently
// drops any ligature that is not in `icon_names` — the icon then renders as its
// own literal name as text ("account_balance_wallet" instead of a wallet glyph)
// with no error anywhere. There is no frontend lint and no test runner, so this
// script is the only thing that catches it.
//
// Run with `yarn check:icons`; it is also wired into `yarn typecheck`.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP_DIR = join(PACKAGE_ROOT, 'app');
const ROOT_TSX = join(APP_DIR, 'root.tsx');
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx']);

// An element carrying the ligature font class, captured together with its body.
const ICON_ELEMENT_RE =
  /<(span|i)\b[^>]*material-symbols-outlined[^>]*>([\s\S]*?)<\/\1>/g;
// Every mention of the class, used as a safety net against a missed match above.
const CLASS_MENTION_RE = /material-symbols-outlined/g;
// `icon: 'name'` in the object a `{tab.icon}`-style expression reads from.
const ICON_PROPERTY_RE = /\bicon\s*:\s*['"]([a-z0-9_]+)['"]/g;
const LIGATURE_RE = /^[a-z][a-z0-9_]*$/;

function collectSourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (SCAN_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      files.push(full);
    }
  }
  return files;
}

/** Pulls the icon names out of one element body. */
function namesFromBody(body) {
  const names = new Set();
  const unresolved = [];

  // Names supplied by an expression, e.g. `{amount > 0 ? 'north_east' : 'south_east'}`.
  // An identifier reference such as `{tab.icon}` has no name of its own; it is
  // resolved by the caller against the `icon:` keys declared in the same file.
  for (const expression of body.matchAll(/\{([\s\S]*?)\}/g)) {
    for (const literal of expression[1].matchAll(/['"]([a-z0-9_]+)['"]/g)) {
      names.add(literal[1]);
    }
    for (const member of expression[1].matchAll(/\b([A-Za-z_$][\w$]*)\.\w+/g)) {
      unresolved.push(member[1]);
    }
  }

  // A name written straight into the element, e.g. `>account_balance_wallet</span>`.
  const literalText = body.replace(/\{[\s\S]*?\}/g, '').trim();
  if (LIGATURE_RE.test(literalText)) {
    names.add(literalText);
  }

  return { names, unresolved };
}

const used = new Map(); // icon name -> [ "app/file.tsx:42", ... ]
const problems = [];

for (const file of collectSourceFiles(APP_DIR)) {
  const source = readFileSync(file, 'utf8');
  const relativePath = relative(PACKAGE_ROOT, file);

  const mentioned = [...source.matchAll(CLASS_MENTION_RE)].length;
  if (mentioned === 0) continue;

  let matched = 0;
  for (const element of source.matchAll(ICON_ELEMENT_RE)) {
    matched += 1;
    const lineNumber = source.slice(0, element.index).split('\n').length;
    const location = `${relativePath}:${lineNumber}`;
    const { names, unresolved } = namesFromBody(element[2]);

    const record = (name) => {
      if (!used.has(name)) used.set(name, []);
      used.get(name).push(location);
    };
    for (const name of names) record(name);

    if (names.size > 0) continue;

    if (unresolved.length === 0) {
      problems.push(`${location}: could not determine the icon name used by this element`);
      continue;
    }

    // `{tab.icon}` and friends: the name lives on an object declared in this file.
    const resolved = [...source.matchAll(ICON_PROPERTY_RE)].map((match) => match[1]);
    if (resolved.length === 0) {
      problems.push(
        `${location}: cannot resolve the icon name behind ` +
          `${unresolved.map((name) => `\`${name}\``).join(', ')} — no \`icon:\` keys in this file`,
      );
      continue;
    }
    for (const name of resolved) record(name);
  }

  if (matched !== mentioned) {
    problems.push(
      `${relativePath}: found ${mentioned} \`material-symbols-outlined\` class(es) but could only ` +
        `parse ${matched} icon element(s) — the check cannot vouch for this file.`,
    );
  }
}

const rootSource = readFileSync(ROOT_TSX, 'utf8');
const subset = rootSource.match(/icon_names=([^"']+)/);
if (!subset) {
  console.error('check:icons: no `icon_names=` subset found in app/root.tsx.');
  process.exit(1);
}

const configured = new Set(subset[1].split(',').map((name) => decodeURIComponent(name.trim())));
const missing = [...used.keys()].filter((name) => !configured.has(name)).sort();
const unused = [...configured].filter((name) => !used.has(name)).sort();

for (const problem of problems) {
  console.error(`check:icons: ${problem}`);
}

if (missing.length > 0) {
  console.error(
    `\ncheck:icons: ${missing.length} icon(s) are used in app/ but missing from the ` +
      `\`icon_names\` subset in app/root.tsx. They will render as their literal name:\n`,
  );
  for (const name of missing) {
    console.error(`  - ${name}  (${used.get(name).join(', ')})`);
  }
  console.error('\nAdd them to the subset, or drop the usage.');
}

if (unused.length > 0) {
  console.log(
    `check:icons: note — ${unused.length} name(s) in the subset are unused ` +
      `(${unused.join(', ')}); each one costs a few bytes of the font.`,
  );
}

if (problems.length > 0 || missing.length > 0) {
  process.exit(1);
}

console.log(
  `check:icons: ok — ${used.size} icon(s) used, all present in the app/root.tsx subset.`,
);
