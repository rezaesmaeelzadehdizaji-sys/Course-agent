/**
 * fix-course7-v4.js
 *
 *  1. Replace empty dynamic TOC field with static TOC entries (no w:dirty)
 *     → fixes the blank TOC page
 *     → removes the "Update Fields?" dialog on open
 *
 * Run: node dashboard/scripts/fix-course7-v4.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Paths ──────────────────────────────────────────────────────
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
const WORK_DIR = path.join(os.tmpdir(), "course7_v4");

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
let settings = fs.readFileSync(
  path.join(extractDir, "word", "settings.xml"),
  "utf-8"
);

// ── Step 1: Build static TOC entries from document headings ───
// Extract all Heading1 / Heading2 paragraphs (skip "Table of Contents" itself)
console.log("\nStep 1: Extracting headings for static TOC...");

const headings = [];
let pos = 0;
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);

  const isH1 = p.includes('w:val="Heading1"');
  const isH2 = p.includes('w:val="Heading2"');
  if (isH1 || isH2) {
    // Collect all <w:t> text, joining with space
    const textParts = [];
    let tp = 0;
    const pXml = p;
    while (tp < pXml.length) {
      const tS = pXml.indexOf("<w:t", tp);
      if (tS === -1) break;
      const tE = pXml.indexOf("</w:t>", tS);
      if (tE === -1) break;
      // Get content between > and </w:t>
      const gt = pXml.indexOf(">", tS);
      if (gt !== -1 && gt < tE) {
        textParts.push(pXml.slice(gt + 1, tE));
      }
      tp = tE + 6;
    }
    const text = textParts.join(" ").trim();
    if (text && text !== "Table of Contents") {
      headings.push({ level: isH1 ? 1 : 2, text });
    }
  }
  pos = pE;
}
console.log(`  Found ${headings.length} headings (${headings.filter(h=>h.level===1).length} H1, ${headings.filter(h=>h.level===2).length} H2)`);

// ── Step 2: Generate static TOC paragraphs XML ────────────────
// Use TOC1 / TOC2 built-in Word styles (always available in any docx).
// These render with proper indent/font but no page numbers (acceptable for
// a training document where page numbers shift on every print).

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

let staticTocXml = "";
for (const h of headings) {
  const styleName = h.level === 1 ? "TOC1" : "TOC2";
  const text = escapeXml(h.text);
  staticTocXml +=
    `<w:p>` +
    `<w:pPr><w:pStyle w:val="${styleName}"/></w:pPr>` +
    `<w:r><w:t xml:space="preserve">${text}</w:t></w:r>` +
    `</w:p>`;
}

// ── Step 3: Replace the dynamic TOC field block ────────────────
// Current structure (between para 16 TOC-heading and para 20 page-break):
//   Para 17: empty spacing
//   Para 18: fldChar begin + instrText + fldChar separate
//   Para 19: fldChar end
// We keep para 17 (spacing) and replace paras 18-19 with static entries.

console.log("\nStep 2: Replacing dynamic TOC field with static entries...");

const FIELD_PARA =
  `<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/>` +
  `<w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText>` +
  `<w:fldChar w:fldCharType="separate"/></w:r></w:p>` +
  `<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`;

if (docXml.includes(FIELD_PARA)) {
  docXml = docXml.replace(FIELD_PARA, staticTocXml);
  console.log(`  ✓ Replaced dynamic TOC field with ${headings.length} static entries`);
} else {
  // Fallback: try regex to catch any variation
  const fieldRegex =
    /<w:p><w:r><w:fldChar w:fldCharType="begin"[^>]*\/>[\s\S]*?<w:fldChar w:fldCharType="end"[^>]*\/><\/w:r><\/w:p>/;
  if (fieldRegex.test(docXml)) {
    docXml = docXml.replace(fieldRegex, staticTocXml);
    console.log(`  ✓ Replaced dynamic TOC field (regex) with ${headings.length} static entries`);
  } else {
    console.error("  ✗ TOC field not found — check document structure");
    process.exit(1);
  }
}

// ── Step 4: Remove any remaining w:dirty from document ────────
console.log("\nStep 3: Removing any remaining w:dirty attributes...");
const beforeDirty = docXml;
docXml = docXml.replace(/ w:dirty="true"/g, "").replace(/ w:dirty="false"/g, "");
const dirtyRemoved = beforeDirty.length - docXml.length;
console.log(`  ✓ Removed w:dirty occurrences (${dirtyRemoved} chars removed)`);

// ── Step 5: Ensure updateFields=0 in settings ─────────────────
console.log("\nStep 4: Ensuring updateFields=0 in settings.xml...");
settings = settings
  .replace(/<w:updateFields[^/]*\/>/g, "")
  .replace(/<w:updateFields[^>]*>[^<]*<\/w:updateFields>/g, "");
settings = settings.replace(
  "</w:settings>",
  '<w:updateFields w:val="0"/></w:settings>'
);
console.log('  ✓ <w:updateFields w:val="0"/> confirmed in settings.xml');

// ── Validate ───────────────────────────────────────────────────
console.log("\nValidating XML...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ Balanced");

// Also confirm no w:dirty remains
const remainingDirty = (docXml.match(/w:dirty/g) || []).length;
console.log(`  w:dirty remaining: ${remainingDirty} (expected 0)`);

// ── Write + repack ─────────────────────────────────────────────
fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  docXml,
  "utf-8"
);
fs.writeFileSync(
  path.join(extractDir, "word", "settings.xml"),
  settings,
  "utf-8"
);

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_v4.zip");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`\nSize: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. Open in Word — no update dialog should appear,");
console.log("and the TOC page will show all section headings.");
