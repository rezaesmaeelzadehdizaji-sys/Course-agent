/**
 * fix-course7-v3.js
 *
 *  1. Restore the Table of Contents (was wrongly deleted in v2)
 *  2. Delete the sectPr paragraph — this is the actual blank page cause
 *  3. Rename "Diseases That Don't Pick Favourites" → "Cross-Species Disease Risks"
 *
 * Run: node dashboard/scripts/fix-course7-v3.js
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
const WORK_DIR = path.join(os.tmpdir(), "course7_v3");

// ── Extract ────────────────────────────────────────────────────
console.log("Extracting...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
const zipWin = zipPath.replace(/\//g, "\\");
const extractWin = extractDir.replace(/\//g, "\\");
execSync(
  `powershell -Command "Expand-Archive -Path '${zipWin}' -DestinationPath '${extractWin}' -Force"`
);

let docXml = fs.readFileSync(
  path.join(extractDir, "word", "document.xml"),
  "utf-8"
);

// ── FIX 1 + 2: Restore TOC and delete sectPr blank page ───────
// Current structure (after v2):
//   Para 15: <w:p><w:r><w:br w:type="page"/></w:r></w:p>   ← cover page break
//   Para 16: <w:p><w:pPr><w:sectPr>...</w:sectPr></w:pPr></w:p>  ← blank page culprit
//   Para 17: Introduction heading
//
// Target structure:
//   Para 15: cover page break (unchanged)
//   NEW:     TOC Heading1
//   NEW:     empty spacing
//   NEW:     TOC field
//   NEW:     field end
//   NEW:     page break (TOC → content)
//   Para 17: Introduction heading  (sectPr deleted)

console.log("\nFix 1+2: Restore TOC + delete sectPr blank-page paragraph...");

const COVER_PAGE_BREAK = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
const SECT_PR_PARA =
  `<w:p><w:pPr><w:sectPr><w:headerReference w:type="default" r:id="rId9"/>` +
  `<w:headerReference w:type="first" r:id="rId10"/>` +
  `<w:footerReference w:type="default" r:id="rId11"/>` +
  `<w:footerReference w:type="first" r:id="rId12"/>` +
  `<w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>` +
  `<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800" w:header="720" w:footer="720" w:gutter="0"/>` +
  `<w:pgNumType/>` +
  `<w:titlePg w:val="false"/>` +
  `<w:docGrid w:linePitch="360"/>` +
  `</w:sectPr></w:pPr></w:p>`;

const TOC_BLOCK =
  // TOC Heading1
  `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">Table of Contents</w:t></w:r></w:p>` +
  // empty spacing
  `<w:p><w:pPr><w:spacing w:after="0" w:before="200"/></w:pPr></w:p>` +
  // TOC field
  `<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/><w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText><w:fldChar w:fldCharType="separate"/></w:r></w:p>` +
  // field end
  `<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>` +
  // page break to content
  `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

// The sequence to replace: cover page break + sectPr para
// Replace that pair with: cover page break + TOC block (no sectPr)
const TARGET = COVER_PAGE_BREAK + SECT_PR_PARA;
if (docXml.includes(TARGET)) {
  docXml = docXml.replace(TARGET, COVER_PAGE_BREAK + TOC_BLOCK);
  console.log("  ✓ Replaced cover-break+sectPr with cover-break+TOC (sectPr deleted)");
} else {
  // Fallback: try to find sectPr para alone and handle separately
  console.warn("  ✗ Combined target not found — trying individual approach");
  if (docXml.includes(SECT_PR_PARA)) {
    docXml = docXml.replace(SECT_PR_PARA, TOC_BLOCK);
    console.log("  ✓ Replaced sectPr paragraph with TOC block");
  } else {
    // Regex fallback for the sectPr paragraph
    const sectPrRegex =
      /<w:p><w:pPr><w:sectPr>[\s\S]*?<\/w:sectPr><\/w:pPr><\/w:p>/;
    if (sectPrRegex.test(docXml)) {
      docXml = docXml.replace(sectPrRegex, TOC_BLOCK);
      console.log("  ✓ Replaced sectPr paragraph (regex) with TOC block");
    } else {
      console.error("  ✗ sectPr paragraph not found — manual inspection needed");
    }
  }
}

// ── FIX 3: Rename informal section heading ────────────────────
console.log("\nFix 3: Rename 'Diseases That Don\u2019t Pick Favourites'...");

const OLD_TITLES = [
  // curly apostrophe (Unicode)
  "Diseases That Don\u2019t Pick Favourites",
  // straight apostrophe fallback
  "Diseases That Don't Pick Favourites",
  // XML-escaped apostrophe
  "Diseases That Don&apos;t Pick Favourites",
];
const NEW_TITLE = "Cross-Species Disease Risks";

let renamed = false;
for (const old of OLD_TITLES) {
  if (docXml.includes(old)) {
    docXml = docXml.replace(old, NEW_TITLE);
    console.log(`  ✓ Renamed: "${old}" → "${NEW_TITLE}"`);
    renamed = true;
    break;
  }
}
if (!renamed) {
  // Try partial match
  const partialMatch = docXml.match(/Diseases That Don[^<]{0,20}Pick Favour[^<]*/);
  if (partialMatch) {
    docXml = docXml.replace(partialMatch[0], NEW_TITLE);
    console.log(`  ✓ Renamed (partial): "${partialMatch[0]}" → "${NEW_TITLE}"`);
  } else {
    console.warn("  ✗ Heading not found — may already be renamed or have different encoding");
  }
}

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

// ── Write + repack ─────────────────────────────────────────────
fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  docXml,
  "utf-8"
);

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_v3.zip");
const newZipWin = newZip.replace(/\//g, "\\");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractWin}\\*' -DestinationPath '${newZipWin}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`\nSize: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
