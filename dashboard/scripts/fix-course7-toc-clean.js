/**
 * fix-course7-toc-clean.js
 *
 * Cleans up the duplicated TOC tabs/page-numbers (caused by running the
 * comprehensive script multiple times) and replaces Photo 3.
 *
 * For each TOC entry:
 *   1. Strip all <w:tabs> blocks from pPr
 *   2. Strip all <w:r><w:tab/></w:r> runs
 *   3. Strip all bare page-number runs: <w:r><w:t>DIGITS</w:t></w:r>
 *      that were added by the tab script (identified by position after tab run)
 *   4. Re-add single correct <w:tabs> in pPr
 *   5. Re-add single tab + page number before </w:p> (or before fldChar end)
 *
 * Also replaces Photo 3 media file.
 *
 * Run: node dashboard/scripts/fix-course7-toc-clean.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "../../");
const SRC_DOCX = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const OUT_DASHBOARD = SRC_DOCX;
const OUT_ROOT = path.resolve(ROOT, "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx");
const WORK_DIR = path.join(os.tmpdir(), "course7_tocclean");
const COURSE7_DIR = path.resolve(ROOT, "Course 7");

// ── Extract ────────────────────────────────────────────────────
console.log("Extracting...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
execSync(`powershell -Command "Expand-Archive -Path '${zipPath.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`);

const mediaDir = path.join(extractDir, "word", "media");
let docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");

// ── 1. Replace Photo 3 ─────────────────────────────────────────
console.log("\n1. Replacing Photo 3...");
const photo3src = path.join(COURSE7_DIR, "bench_stepover_final.png");
const photo3dst = path.join(mediaDir, "biosecurity_danish_bench.png");
if (!fs.existsSync(photo3src)) {
  console.error(`  ✗ Source not found: ${photo3src}`);
  process.exit(1);
}
fs.copyFileSync(photo3src, photo3dst);
console.log("  ✓ Photo 3: replaced biosecurity_danish_bench.png");

// ── 2. Find contiguous TOC entries ────────────────────────────
console.log("\n2. Finding TOC entries...");

const TOC_H1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">Table of Contents</w:t></w:r></w:p>`;
const SPACING_PARA = `<w:p><w:pPr><w:spacing w:after="0" w:before="200"/></w:pPr></w:p>`;
const FIELD_END_RUN = `<w:r><w:fldChar w:fldCharType="end"/></w:r>`;

const tocH1Pos = docXml.indexOf(TOC_H1);
if (tocH1Pos === -1) { console.error("TOC heading not found"); process.exit(1); }
const spacingPos = docXml.indexOf(SPACING_PARA, tocH1Pos);
if (spacingPos === -1) { console.error("Spacing para not found"); process.exit(1); }

const afterSpacing = spacingPos + SPACING_PARA.length;
let scanPos = afterSpacing;
const tocEntries = [];

while (scanPos < docXml.length) {
  const pS = docXml.indexOf("<w:p", scanPos);
  if (pS === -1 || pS !== scanPos) break;
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
console.log(`  Found ${tocEntries.length} TOC entries`);

// ── 3. Page number table ───────────────────────────────────────
const pageNumbers = [
  4,  // Introduction
  4,  // 1. Why Knowing Your Bird's Diseases Pays Off
  6,  // 2. How Disease Gets Into Your Barn
  7,  // 3. Biosecurity Basics: The First Line of Defence
  8,  // 4. Common Diseases in Broilers, What to Watch For
  9,  // Coccidiosis
  9,  // Yolk sac infection
  10, // CRD/IBV
  10, // IBD
  10, // IBH
  11, // Ascites
  11, // 5. Common Diseases in Layers and Breeders
  12, // Coccidiosis in pullets
  12, // Necrotic enteritis
  12, // Fowl cholera
  13, // Marek's disease
  13, // ILT
  13, // Layer osteoporosis
  14, // Infectious Bronchitis (IBV)
  14, // Avian Metapneumovirus (aMPV)
  14, // Bacterial peritonitis and salpingitis
  15, // Practical Prevention
  16, // 6. Common Diseases in Ducks and Geese
  16, // Avian Influenza (ducks)
  17, // Avian Cholera
  17, // Botulism
  17, // Duck Viral Enteritis
  18, // Duck Virus Hepatitis
  18, // Derzsy's Disease
  18, // Riemerellosis
  19, // 7. Common Diseases in Turkeys
  19, // Diseases to Watch For
  19, // Avian Influenza (turkeys)
  20, // aMPV / Turkey Rhinotracheitis
  20, // Hemorrhagic Enteritis
  20, // Blackhead Disease
  21, // Reovirus
  21, // Colibacillosis
  21, // Mycoplasma gallisepticum
  22, // Keeping Your Flock Safe
  22, // 8. Cross-Species Disease Concerns
  23, // Cross-Species Disease Risks
  23, // Avian Influenza (cross)
  23, // Newcastle Disease
  24, // Pigeon Paramyxovirus
  24, // aMPV (cross)
  24, // Mycoplasma gallisepticum (cross)
  25, // Avian Cholera (cross)
  25, // Managing Cross-Species Risk on Your Farm
  25, // 9. Practical Disease Prevention
  26, // 10. Reacting to Disease
  26, // What to Do When Birds Get Sick
  27, // 11. Summary and Discussion
  27, // What It All Comes Down To
  27, // Discussion Questions for the Group
  28, // Where to Keep Learning
  28, // Key Peer-Reviewed Journals Consulted
  28, // Key Institutional, Government & Industry Resources
  29, // Surveillance & Epidemiology Reports
  29, // Selected Scientific Articles & Book Chapters
];

const TOC_TAB_STOP = `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>`;

// ── 4. Clean + rebuild each entry ─────────────────────────────
console.log("\n3. Cleaning and rebuilding TOC entries...");

function cleanEntry(xml) {
  // Step 1: Remove ALL <w:tabs>...</w:tabs> blocks (could be 1, 2, or 3 of them)
  xml = xml.replace(/<w:tabs>[\s\S]*?<\/w:tabs>/g, '');

  // Step 2: Remove ALL patterns of tab-run + page-number-run added by script
  //   Pattern: <w:r><w:tab/></w:r><w:r><w:t>DIGITS</w:t></w:r>
  xml = xml.replace(/<w:r><w:tab\/><\/w:r><w:r><w:t>\d+<\/w:t><\/w:r>/g, '');

  // Step 3: Remove any lingering lone tab runs (just in case)
  xml = xml.replace(/<w:r><w:tab\/><\/w:r>/g, '');

  return xml;
}

const newEntries = tocEntries.map((entry, i) => {
  let p = cleanEntry(entry.xml);
  const pg = pageNumbers[i] !== undefined ? String(pageNumbers[i]) : '?';

  // Add single tab stop to pPr
  p = p.replace(/<\/w:pPr>/, TOC_TAB_STOP + '</w:pPr>');

  const tabPageRun = `<w:r><w:tab/></w:r><w:r><w:t>${pg}</w:t></w:r>`;

  if (i === tocEntries.length - 1) {
    // Last entry: insert before fldChar end run
    p = p.replace(FIELD_END_RUN, tabPageRun + FIELD_END_RUN);
  } else {
    // All others: insert before </w:p>
    p = p.replace(/<\/w:p>$/, tabPageRun + '</w:p>');
  }
  return p;
});

// Verify no double tabs in result
const doubleTabCheck = newEntries[1];
const tabCount = (doubleTabCheck.match(/<w:r><w:tab\/><\/w:r>/g) || []).length;
console.log(`  Spot check entry[1] tab run count: ${tabCount} (expected 1)`);
const tabsBlockCount = (doubleTabCheck.match(/<w:tabs>/g) || []).length;
console.log(`  Spot check entry[1] <w:tabs> block count: ${tabsBlockCount} (expected 1)`);

// Replace the entire TOC block in docXml
const firstEntry = tocEntries[0];
const lastEntry = tocEntries[tocEntries.length - 1];
docXml = docXml.slice(0, firstEntry.start) + newEntries.join('') + docXml.slice(lastEntry.end);

console.log(`  ✓ Rebuilt ${newEntries.length} TOC entries cleanly`);

// ── 5. Validate ────────────────────────────────────────────────
console.log("\nValidating...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) { console.error("  ✗ Mismatched tags"); process.exit(1); }
const fBegin = (docXml.match(/w:fldCharType="begin"/g) || []).length;
const fEnd = (docXml.match(/w:fldCharType="end"/g) || []).length;
console.log(`  fldChar begin: ${fBegin}  end: ${fEnd}`);
console.log("  ✓ Validated");

// ── 6. Write + repack ──────────────────────────────────────────
fs.writeFileSync(path.join(extractDir, "word", "document.xml"), docXml, "utf-8");

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_tocclean.zip");
execSync(`powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`Wrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`Size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. TOC cleaned (single tab/page per entry), Photo 3 replaced.");
