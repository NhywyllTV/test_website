import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/**
 * Audit I18n translations
 */

function getKeysFromTs(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, "utf-8");
  const keys = new Set();
  // Matches: key: "value" or "key": "value" inside the translation object
  // Looking for lines starting with indent and ending with colon
  const matches = content.matchAll(/^\s+["']?([a-zA-Z0-9_-]+)["']?:\s+/gm);
  for (const match of matches) {
    keys.add(match[1]);
  }
  return keys;
}

function getKeysFromHtml(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  const content = fs.readFileSync(filePath, "utf-8");
  const keys = new Set();
  // Match data-i18n, data-i18n-html, data-i18n-placeholder, data-i18n-aria-label, data-i18n-title
  const matches = content.matchAll(
    /data-i18n(?:-html|-placeholder|-aria-label|-title)?=["']([a-zA-Z0-9_-]+)["']/g,
  );
  for (const match of matches) {
    keys.add(match[1]);
  }
  return keys;
}

const LANG_DIR = path.join(ROOT, "src/lang");
const REFERENCE = "en";
const NON_LANGUAGE_FILES = new Set(["index.ts", "i18n-types.ts"]);

// Find every language file instead of hardcoding EN/DE, so new languages are
// checked automatically.
const langFiles = fs
  .readdirSync(LANG_DIR)
  .filter((f) => f.endsWith(".ts") && !NON_LANGUAGE_FILES.has(f));
const keysByLang = Object.fromEntries(
  langFiles.map((f) => [f.replace(/\.ts$/, ""), getKeysFromTs(path.join(LANG_DIR, f))]),
);
const enKeys = keysByLang[REFERENCE] ?? new Set();
let hasErrors = false;

console.log("\x1b[36m%s\x1b[0m", "\n=== I18n Audit Results ===\n");

// 1. Every language against the reference
console.log("\x1b[33m%s\x1b[0m", "[1/4] Dictionary Consistency:");
let dictError = false;
for (const [lang, keys] of Object.entries(keysByLang)) {
  if (lang === REFERENCE) continue;
  const tag = lang.toUpperCase();
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  if (missing.length > 0) {
    console.error(`  ❌ Missing in ${tag}: ${missing.join(", ")}`);
    dictError = true;
  }
  if (extra.length > 0) {
    console.error(`  ❌ Unknown keys in ${tag} (not in ${REFERENCE.toUpperCase()}): ${extra.join(", ")}`);
    dictError = true;
  }
}
const langList = Object.keys(keysByLang).map((l) => l.toUpperCase()).join(", ");
if (dictError) hasErrors = true;
else console.log(`  ✅ All languages (${langList}) match ${REFERENCE.toUpperCase()}.`);

// 2. Registry, files and flags must line up
console.log("\x1b[33m%s\x1b[0m", "\n[2/4] Language Registry:");
const indexTs = fs.readFileSync(path.join(LANG_DIR, "index.ts"), "utf-8");
const registered = [...indexTs.matchAll(/code:\s*["']([a-z]{2,3})["']/g)].map((m) => m[1]);
let registryError = false;
for (const lang of Object.keys(keysByLang)) {
  if (!registered.includes(lang)) {
    console.error(`  ❌ src/lang/${lang}.ts exists but is not registered in src/lang/index.ts`);
    registryError = true;
  }
}
for (const code of registered) {
  if (!keysByLang[code]) {
    console.error(`  ❌ "${code}" is registered but src/lang/${code}.ts is missing`);
    registryError = true;
  }
  if (!fs.existsSync(path.join(ROOT, "public/images/flags", `${code}.svg`))) {
    console.error(`  ❌ Flag missing: public/images/flags/${code}.svg`);
    registryError = true;
  }
}
if (registryError) hasErrors = true;
else console.log(`  ✅ Registered: ${registered.join(", ")} (files and flags present).`);

// 3. HTML Usage Check
console.log("\x1b[33m%s\x1b[0m", "\n[3/4] HTML Usage Check:");
const htmlFiles = [
  "index.html",
  "links.html",
  "contact.html",
  "credits.html",
  "imprint.html",
  "404.html",
];
const componentsDir = path.join(ROOT, "src/components");
const components = fs.existsSync(componentsDir)
  ? fs.readdirSync(componentsDir).filter((f) => f.endsWith(".html"))
  : [];
const allHtmlPaths = [
  ...htmlFiles.map((f) => path.join(ROOT, f)),
  ...components.map((f) => path.join(componentsDir, f)),
];

const usedKeys = new Set();
let usageIssues = false;

allHtmlPaths.forEach((p) => {
  if (!fs.existsSync(p)) return;
  const keys = getKeysFromHtml(p);
  const relPath = path.relative(ROOT, p);
  keys.forEach((k) => {
    usedKeys.add(k);
    if (!enKeys.has(k)) {
      console.error(
        `  ❌ [${relPath}] Key "${k}" is used but missing in translation files.`,
      );
      usageIssues = true;
    }
  });
});

if (usageIssues) hasErrors = true;
else console.log("  ✅ All keys used in HTML are defined in the translations.");

// 4. Unused Keys Search
console.log("\x1b[33m%s\x1b[0m", "\n[4/4] Potential Unused Keys:");
// Also check main.ts for dynamic usage (like activeNavHighlight might use ids, but usually it's hardcoded)
const mainTs = fs.readFileSync(path.join(ROOT, "src/main.ts"), "utf-8");
const trulyUnused = [...enKeys].filter(
  (k) => !usedKeys.has(k) && !mainTs.includes(k),
);

if (trulyUnused.length > 0) {
  console.log(
    `  ℹ️ Found ${trulyUnused.length} keys not directly used in HTML/JS:`,
  );
  trulyUnused.forEach((k) => console.log(`    - ${k}`));
} else {
  console.log("  ✅ All keys are currently in use.");
}

console.log("\n" + "=".repeat(26) + "\n");

// Report failures through the exit code so the script works in CI/hooks too
if (hasErrors) process.exitCode = 1;
