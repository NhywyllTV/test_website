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

const enPath = path.join(ROOT, "src/lang/en.ts");
const dePath = path.join(ROOT, "src/lang/de.ts");

const enKeys = getKeysFromTs(enPath);
const deKeys = getKeysFromTs(dePath);

console.log("\x1b[36m%s\x1b[0m", "\n=== I18n Audit Results ===\n");

// 1. Cross-Language Check
console.log("\x1b[33m%s\x1b[0m", "[1/3] Dictionary Consistency:");
const missingInEn = [...deKeys].filter((k) => !enKeys.has(k));
const missingInDe = [...enKeys].filter((k) => !deKeys.has(k));

let dictError = false;
if (missingInEn.length > 0) {
  console.error(`  ❌ Missing in EN: ${missingInEn.join(", ")}`);
  dictError = true;
}
if (missingInDe.length > 0) {
  console.error(`  ❌ Missing in DE: ${missingInDe.join(", ")}`);
  dictError = true;
}
if (!dictError)
  console.log("  ✅ EN and DE dictionaries are perfectly synced.");

// 2. HTML Usage Check
console.log("\x1b[33m%s\x1b[0m", "\n[2/3] HTML Usage Check:");
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

if (!usageIssues)
  console.log("  ✅ All keys used in HTML are defined in the translations.");

// 3. Unused Keys Search
console.log("\x1b[33m%s\x1b[0m", "\n[3/3] Potential Unused Keys:");
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
