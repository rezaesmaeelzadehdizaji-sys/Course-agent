/**
 * fix-course7-blankpage.js
 *
 * Fix: remove blank page 2 by reducing cover page spacing so all cover
 * content fits on page 1. The page break then goes directly to page 2 (TOC).
 *
 * Cover spacing reductions:
 *   Para 0:  w:before="800" → "400"   (top margin spacer)
 *   Para 7:  w:before="800" → "400"   (spacer before horizontal rule)
 *   Para 13: w:before="800" → "200"   (spacer before disclaimer)
 *
 * Run: node dashboard/scripts/fix-course7-blankpage.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "../../");
const SRC_DOCX = path.resolve(
  __dirname,
  "../public/docs/course-07-common-poultry-diseases.docx"
);
const OUT_DASHBOARD = SRC_DOCX;
const OUT_ROOT = path.resolve(
  ROOT,
  "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx"
);
const WORK_DIR = path.join(os.tmpdir(), "course7_blankpage");

// ── Extract ────────────────────────────────────────────────────
console.log("Extracting...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
execSync(
  `powershell -Command "Expand-Archive -Path '${zipPath.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`
);

let docXml = fs.readFileSync(
  path.join(extractDir, "word", "document.xml"),
  "utf-8"
);

// ── Locate the cover page paragraphs ──────────────────────────
// We need to find the three 800-twip spacing paragraphs on the cover
// and reduce them. They're before the page break (para 15).

// Find the page break that ends the cover
const PAGE_BREAK = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
const pbPos = docXml.indexOf(PAGE_BREAK);
if (pbPos === -1) {
  console.error("Page break not found — aborting");
  process.exit(1);
}

// Work only in the cover section (before page break)
const coverXml = docXml.slice(0, pbPos);

// Para 0: first spacing para — before="800" at the very start
// It's: <w:p><w:pPr><w:spacing w:after="0" w:before="800"/></w:pPr></w:p>
const SPACER_800 = `<w:p><w:pPr><w:spacing w:after="0" w:before="800"/></w:pPr></w:p>`;

// Count occurrences in cover
let count800 = 0;
let searchPos = 0;
while (true) {
  const idx = coverXml.indexOf(SPACER_800, searchPos);
  if (idx === -1) break;
  count800++;
  searchPos = idx + SPACER_800.length;
}
console.log(`Found ${count800} spacer paragraphs with before="800" in cover`);

// Replace them with reduced values:
// 1st occurrence (para 0 — top margin): 800 → 400
// 2nd occurrence (para 7 — before rule): 800 → 400
// 3rd occurrence (para 13 — before disclaimer): 800 → 200
const replacements = [400, 400, 200];
let modified = docXml;
let replacePos = 0;

for (let i = 0; i < Math.min(count800, replacements.length); i++) {
  const idx = modified.indexOf(SPACER_800, replacePos);
  if (idx === -1) break;
  // Make sure we're still in the cover area (before page break)
  const currentPbPos = modified.indexOf(PAGE_BREAK);
  if (idx > currentPbPos) break;

  const newVal = replacements[i];
  const replacement = `<w:p><w:pPr><w:spacing w:after="0" w:before="${newVal}"/></w:pPr></w:p>`;
  modified = modified.slice(0, idx) + replacement + modified.slice(idx + SPACER_800.length);
  console.log(`  ✓ Spacer ${i + 1}: before="800" → before="${newVal}"`);
  replacePos = idx + replacement.length;
}

docXml = modified;

// ── Validate ───────────────────────────────────────────────────
console.log("\nValidating...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ Balanced");

// ── Write + repack ─────────────────────────────────────────────
fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  docXml,
  "utf-8"
);

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_blankpage.zip");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`Wrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`Size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. Cover spacing reduced — TOC should now be on page 2.");
