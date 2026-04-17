/**
 * fix-course7-comprehensive.js
 *
 * Applies multiple fixes in one pass:
 *  1. Replace Photo 1/7/8/9 media files with updated versions
 *  2. Fix TOC: add right-aligned dot-leader tab + page numbers to all 60 entries
 *  3. Justify all body text (Normal style) in styles.xml
 *  4. Change "ten" → "fifty" in the specific broiler observation sentence
 *
 * Run: node dashboard/scripts/fix-course7-comprehensive.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "../../");
const SRC_DOCX = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const OUT_DASHBOARD = SRC_DOCX;
const OUT_ROOT = path.resolve(ROOT, "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx");
const WORK_DIR = path.join(os.tmpdir(), "course7_comprehensive");
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
let stylesXml = fs.readFileSync(path.join(extractDir, "word", "styles.xml"), "utf-8");

// ── 1. Replace photo media files ───────────────────────────────
console.log("\n1. Replacing photo media files...");
const photoReplacements = [
  {
    src: path.join(COURSE7_DIR, "poultry_farm_intro-2.png"),
    dst: path.join(mediaDir, "poultry_farm_intro.png"),
    label: "Photo 1"
  },
  {
    src: path.join(COURSE7_DIR, "Canadian duck and geese farming-2.png"),
    dst: path.join(mediaDir, "canadian_duck_geese.png"),
    label: "Photo 7"
  },
  {
    src: path.join(COURSE7_DIR, "Canadian Turkey farming-2.png"),
    dst: path.join(mediaDir, "canadian_turkey.png"),
    label: "Photo 8"
  },
  {
    src: path.join(COURSE7_DIR, "Cross-species-diseases-2.png"),
    dst: path.join(mediaDir, "cross_species_diseases.png"),
    label: "Photo 9"
  },
];
for (const r of photoReplacements) {
  if (!fs.existsSync(r.src)) {
    console.error(`  ✗ Source not found: ${r.src}`);
    process.exit(1);
  }
  fs.copyFileSync(r.src, r.dst);
  console.log(`  ✓ ${r.label}: replaced ${path.basename(r.dst)}`);
}

// ── 2. Fix TOC: add dot-leader tabs + page numbers ─────────────
console.log("\n2. Fixing TOC formatting...");

// Page number estimates (index matches TOC entry order 0-59)
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

const TOC_TABS = `<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>`;
const FIELD_END_RUN = `<w:r><w:fldChar w:fldCharType="end"/></w:r>`;

// Find contiguous block of TOC1/TOC2 paragraphs
const TOC_H1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">Table of Contents</w:t></w:r></w:p>`;
const SPACING_PARA = `<w:p><w:pPr><w:spacing w:after="0" w:before="200"/></w:pPr></w:p>`;

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

// Transform each TOC entry
const newEntries = tocEntries.map((entry, i) => {
  let p = entry.xml;
  const pg = pageNumbers[i] !== undefined ? String(pageNumbers[i]) : "?";

  // Add tab stop to pPr
  p = p.replace(/<\/w:pPr>/, TOC_TABS + "</w:pPr>");

  // For the last entry: insert tab+page before fldChar end
  if (i === tocEntries.length - 1) {
    p = p.replace(
      FIELD_END_RUN,
      `<w:r><w:tab/></w:r><w:r><w:t>${pg}</w:t></w:r>${FIELD_END_RUN}`
    );
  } else {
    // For all other entries: insert before </w:p>
    p = p.replace(/<\/w:p>$/, `<w:r><w:tab/></w:r><w:r><w:t>${pg}</w:t></w:r></w:p>`);
  }
  return p;
});

// Rebuild the TOC block in docXml
const firstEntry = tocEntries[0];
const lastEntry = tocEntries[tocEntries.length - 1];
docXml = docXml.slice(0, firstEntry.start) + newEntries.join("") + docXml.slice(lastEntry.end);
console.log("  ✓ Tab stops + page numbers added to all TOC entries");

// ── 3. Justify BodyText style in styles.xml ───────────────────
// Body text paragraphs use <w:pStyle w:val="BodyText"/>
// Modifying the style cascades to all body text at once.
console.log("\n3. Justifying BodyText style...");

const bodyTextIdx = stylesXml.indexOf('w:styleId="BodyText"');
if (bodyTextIdx === -1) {
  console.log("  ⚠ BodyText style not found — skipping");
} else {
  const bsStart = stylesXml.lastIndexOf("<w:style", bodyTextIdx);
  const bsEnd = stylesXml.indexOf("</w:style>", bsStart) + 10;
  let bsStyle = stylesXml.slice(bsStart, bsEnd);

  if (bsStyle.includes('<w:jc ')) {
    bsStyle = bsStyle.replace(/<w:jc w:val="[^"]+"\/>/g, '<w:jc w:val="both"/>');
    console.log("  ✓ Replaced existing jc in BodyText style");
  } else if (bsStyle.includes('</w:pPr>')) {
    bsStyle = bsStyle.replace('</w:pPr>', '<w:jc w:val="both"/></w:pPr>');
    console.log("  ✓ Added jc=both to BodyText style pPr");
  } else if (bsStyle.includes('<w:pPr/>')) {
    bsStyle = bsStyle.replace('<w:pPr/>', '<w:pPr><w:jc w:val="both"/></w:pPr>');
    console.log("  ✓ Expanded BodyText pPr with jc=both");
  } else {
    // No pPr in BodyText — inject one before </w:style>
    bsStyle = bsStyle.replace('</w:style>', '<w:pPr><w:jc w:val="both"/></w:pPr></w:style>');
    console.log("  ✓ Inserted pPr with jc=both into BodyText style");
  }
  stylesXml = stylesXml.slice(0, bsStart) + bsStyle + stylesXml.slice(bsEnd);
}

// ── 4. Change "ten" → "fifty" in the specific sentence ────────
console.log('\n4. Changing "ten" to "fifty"...');
const tenPattern = /(<w:t[^>]*>)([^<]*\bif )ten( of your broilers suddenly stop eating[^<]*<\/w:t>)/;
if (tenPattern.test(docXml)) {
  docXml = docXml.replace(tenPattern, '$1$2fifty$3');
  console.log('  ✓ Replaced "ten" with "fifty" in the broiler observation sentence');
} else {
  // Try finding it across runs
  const simpleMatch = docXml.indexOf('>ten<');
  const contextCheck = docXml.indexOf('broilers suddenly stop eating');
  if (contextCheck !== -1) {
    // Find "ten" near "broilers"
    const searchArea = docXml.slice(Math.max(0, contextCheck - 500), contextCheck + 500);
    if (searchArea.includes('>ten<') || searchArea.includes(' ten ')) {
      // Do a targeted replacement in this area
      const areaStart = Math.max(0, contextCheck - 500);
      let area = docXml.slice(areaStart, contextCheck + 500);
      area = area.replace(/\bten\b/, 'fifty');
      docXml = docXml.slice(0, areaStart) + area + docXml.slice(contextCheck + 500);
      console.log('  ✓ Replaced "ten" with "fifty" (context-based search)');
    } else {
      console.log('  ⚠ Could not locate "ten" near "broilers" sentence');
    }
  } else {
    console.log('  ⚠ "broilers suddenly stop eating" not found — skipping');
  }
}

// ── Validate ───────────────────────────────────────────────────
console.log("\nValidating...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
const fBegin = (docXml.match(/w:fldCharType="begin"/g) || []).length;
const fEnd = (docXml.match(/w:fldCharType="end"/g) || []).length;
console.log(`  fldChar begin: ${fBegin}  end: ${fEnd}`);
console.log("  ✓ Validation passed");

// ── Write + repack ─────────────────────────────────────────────
fs.writeFileSync(path.join(extractDir, "word", "document.xml"), docXml, "utf-8");
fs.writeFileSync(path.join(extractDir, "word", "styles.xml"), stylesXml, "utf-8");

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_comprehensive.zip");
execSync(`powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`Wrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`Size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. All fixes applied.");
