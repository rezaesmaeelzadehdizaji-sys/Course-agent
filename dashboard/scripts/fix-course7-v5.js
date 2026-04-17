/**
 * fix-course7-v5.js
 *
 *  Restore a proper dynamic TOC field with pre-populated cache entries.
 *
 *  v4 problem: TOC1/TOC2 paragraphs were OUTSIDE the fldChar block → plain text.
 *  v5 fix (correct approach):
 *    - fldChar begin + instrText + fldChar separate go at the START of the
 *      FIRST TOC entry paragraph (same paragraph, first run — no blank line)
 *    - fldChar end goes at the END of the LAST TOC entry paragraph
 *    - No separate fldChar paragraphs → no extra blank lines
 *  This creates a real Word TOC field with visible entries, no update dialog,
 *  no blank TOC page.
 *
 * Run: node dashboard/scripts/fix-course7-v5.js
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
const WORK_DIR = path.join(os.tmpdir(), "course7_v5");

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

// ── Locate the TOC area ────────────────────────────────────────
console.log("\nLocating TOC area...");

const TOC_H1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">Table of Contents</w:t></w:r></w:p>`;
const SPACING_PARA = `<w:p><w:pPr><w:spacing w:after="0" w:before="200"/></w:pPr></w:p>`;
const PAGE_BREAK_PARA = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

// Strip any prior fldChar wrapping — handle three possible states:
//   A) v3 empty field: separate fldChar-begin para + fldChar-end para (no TOC entries between)
//   B) v5-first-run: separate fldChar-begin para + 60 TOC entries + fldChar-end para
//   C) v5-injected: fldChar runs inlined at start/end of first/last TOC entry

const OLD_FIELD_BEGIN_PARA =
  `<w:p><w:r>` +
  `<w:fldChar w:fldCharType="begin"/>` +
  `<w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText>` +
  `<w:fldChar w:fldCharType="separate"/>` +
  `</w:r></w:p>`;
const OLD_FIELD_END_PARA = `<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`;

// Also handle v3 empty-field structure (dirty flag variant)
const OLD_FIELD_BEGIN_DIRTY =
  `<w:p><w:r>` +
  `<w:fldChar w:fldCharType="begin" w:dirty="true"/>` +
  `<w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText>` +
  `<w:fldChar w:fldCharType="separate"/>` +
  `</w:r></w:p>`;

// IMPORTANT: remove separate paragraphs FIRST (before inline regex) to avoid
// corrupting their content
let strippedSeparate = false;
for (const old of [OLD_FIELD_BEGIN_PARA, OLD_FIELD_BEGIN_DIRTY]) {
  if (docXml.includes(old)) {
    docXml = docXml.replace(old, "");
    console.log("  ✓ Removed existing fldChar-begin paragraph");
    strippedSeparate = true;
    break;
  }
}
if (docXml.includes(OLD_FIELD_END_PARA)) {
  docXml = docXml.replace(OLD_FIELD_END_PARA, "");
  if (strippedSeparate) console.log("  ✓ Removed existing fldChar-end paragraph");
}

// Only apply inline regex strip if no separate paragraphs were found (case C)
if (!strippedSeparate) {
  const beforeInline = docXml.length;
  docXml = docXml.replace(
    /<w:r><w:fldChar w:fldCharType="begin"\/><w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;<\/w:instrText><w:fldChar w:fldCharType="separate"\/><\/w:r>/g,
    ""
  );
  docXml = docXml.replace(
    /<w:r><w:fldChar w:fldCharType="end"\/><\/w:r>/g,
    ""
  );
  if (docXml.length !== beforeInline) {
    console.log("  ✓ Stripped inline fldChar runs from TOC entries");
  } else {
    console.log("  ℹ No existing fldChar wrapping found — proceeding fresh");
  }
}

// ── Find the contiguous block of TOC1/TOC2 paragraphs ─────────
const tocH1Pos = docXml.indexOf(TOC_H1);
if (tocH1Pos === -1) {
  console.error("  ✗ TOC Heading1 not found — aborting");
  process.exit(1);
}
const spacingPos = docXml.indexOf(SPACING_PARA, tocH1Pos);
if (spacingPos === -1) {
  console.error("  ✗ Spacing para not found after TOC heading — aborting");
  process.exit(1);
}

const afterSpacing = spacingPos + SPACING_PARA.length;
let scanPos = afterSpacing;
const tocEntries = []; // { start, end, xml }

while (scanPos < docXml.length) {
  const pS = docXml.indexOf("<w:p", scanPos);
  if (pS === -1) break;
  if (pS !== scanPos) break; // gap between paragraphs — stop

  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;

  const p = docXml.slice(pS, pE);
  if (p.includes('w:val="TOC1"') || p.includes('w:val="TOC2"')) {
    tocEntries.push({ start: pS, end: pE, xml: p });
    scanPos = pE;
  } else {
    break;
  }
}

console.log(`  ✓ Found ${tocEntries.length} TOC entries`);
if (tocEntries.length === 0) {
  console.error("  ✗ No TOC entries found — aborting");
  process.exit(1);
}

const firstEntry = tocEntries[0];
const lastEntry = tocEntries[tocEntries.length - 1];

// Confirm page break follows immediately after last TOC entry
const afterLastToc = lastEntry.end;
const nextChunk = docXml.slice(afterLastToc, afterLastToc + PAGE_BREAK_PARA.length);
if (nextChunk !== PAGE_BREAK_PARA) {
  console.warn("  ⚠ Expected page break after last TOC entry, got:", nextChunk.substring(0, 80));
}

// ── Inject fldChar begin into first entry paragraph ───────────
// Insert right after <w:pPr>...</w:pPr> (or right after <w:p> if no pPr)
// We put: <w:r>fldChar-begin + instrText + fldChar-separate</w:r>
// as the first run inside the paragraph.
const FIELD_OPEN_RUN =
  `<w:r>` +
  `<w:fldChar w:fldCharType="begin"/>` +
  `<w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText>` +
  `<w:fldChar w:fldCharType="separate"/>` +
  `</w:r>`;

const FIELD_CLOSE_RUN = `<w:r><w:fldChar w:fldCharType="end"/></w:r>`;

// Find end of <w:pPr>...</w:pPr> in first entry, or end of <w:p> tag
function insertAfterPPr(paraXml) {
  const pprEnd = paraXml.indexOf("</w:pPr>");
  if (pprEnd !== -1) {
    const insertAt = pprEnd + 8; // after </w:pPr>
    return paraXml.slice(0, insertAt) + FIELD_OPEN_RUN + paraXml.slice(insertAt);
  }
  // No pPr — insert after opening <w:p> or <w:p ...>
  const pTagEnd = paraXml.indexOf(">") + 1;
  return paraXml.slice(0, pTagEnd) + FIELD_OPEN_RUN + paraXml.slice(pTagEnd);
}

function insertBeforeClose(paraXml) {
  const closeTag = "</w:p>";
  const pos = paraXml.lastIndexOf(closeTag);
  return paraXml.slice(0, pos) + FIELD_CLOSE_RUN + closeTag;
}

const firstEntryModified = insertAfterPPr(firstEntry.xml);
const lastEntryModified = insertBeforeClose(lastEntry.xml);

// If first === last (only one entry), combine both modifications
let newTocBlock = "";
if (tocEntries.length === 1) {
  // Apply both to the same paragraph
  let combined = insertAfterPPr(firstEntry.xml);
  combined = insertBeforeClose(combined);
  newTocBlock = combined;
} else {
  newTocBlock =
    firstEntryModified +
    tocEntries.slice(1, -1).map(e => e.xml).join("") +
    lastEntryModified;
}

// Replace the entire TOC block in docXml
docXml =
  docXml.slice(0, firstEntry.start) +
  newTocBlock +
  docXml.slice(lastEntry.end);

console.log("  ✓ fldChar begin inserted into first TOC entry paragraph");
console.log("  ✓ fldChar end inserted into last TOC entry paragraph");

// ── Strip w:dirty ──────────────────────────────────────────────
const beforeLen = docXml.length;
docXml = docXml.replace(/ w:dirty="true"/g, "").replace(/ w:dirty="false"/g, "");
console.log(`  ✓ Removed w:dirty attributes (${beforeLen - docXml.length} chars)`);

// ── Ensure updateFields=0 ──────────────────────────────────────
console.log("\nEnsuring updateFields=0 in settings.xml...");
settings = settings
  .replace(/<w:updateFields[^/]*\/>/g, "")
  .replace(/<w:updateFields[^>]*>[^<]*<\/w:updateFields>/g, "");
settings = settings.replace(
  "</w:settings>",
  '<w:updateFields w:val="0"/></w:settings>'
);
console.log('  ✓ <w:updateFields w:val="0"/> confirmed');

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

const dirtyLeft = (docXml.match(/w:dirty/g) || []).length;
console.log(`  w:dirty remaining: ${dirtyLeft} (expected 0)`);

const fieldBeginCount = (docXml.match(/w:fldCharType="begin"/g) || []).length;
const fieldSepCount = (docXml.match(/w:fldCharType="separate"/g) || []).length;
const fieldEndCount = (docXml.match(/w:fldCharType="end"/g) || []).length;
console.log(`  fldChar begin: ${fieldBeginCount}  separate: ${fieldSepCount}  end: ${fieldEndCount} (should each be 1)`);

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
const newZip = path.join(WORK_DIR, "course7_v5.zip");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`\nSize: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. TOC is a real field with pre-populated entries.");
console.log("No blank TOC page, no update dialog.");
console.log("Right-click TOC → 'Update Field' to add page numbers.");
