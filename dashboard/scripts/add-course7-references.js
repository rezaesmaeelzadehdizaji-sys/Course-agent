/**
 * add-course7-references.js
 *
 * Adds three references that were used in the scientific verification report
 * but were not present in the document's reference section:
 *
 *   1. Bell, D. D., & Weaver, W. D., Jr. (Eds.). (2002). Commercial chicken
 *      meat and egg production (5th ed.). Springer.
 *      → Selected Scientific Articles & Book Chapters (before Blake 2020)
 *
 *   2. Conway, D. P., & McKenzie, M. E. (2007). Poultry coccidiosis:
 *      Diagnostic and testing procedures (3rd ed.). Blackwell Publishing.
 *      → Selected Scientific Articles & Book Chapters (after Cobb-Vantress, before Dhama)
 *
 *   3. Elanco Animal Health. (n.d.). Broiler disease reference guide.
 *      Elanco Animal Health.
 *      → Key Institutional, Government & Industry Resources (before FAO)
 *
 * Run: node dashboard/scripts/add-course7-references.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "../../");
const SRC_DOCX = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const OUT_DASHBOARD = SRC_DOCX;
const OUT_ROOT = path.resolve(ROOT, "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx");
const WORK_DIR = path.join(os.tmpdir(), "course7_addrefs");

// ── Extract ────────────────────────────────────────────────────
console.log("Extracting...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
execSync(`powershell -Command "Expand-Archive -Path '${zipPath.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`);

let docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");

// ── Helper: build a Bibliography-style paragraph ───────────────
function bibPara(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Bibliography"/></w:pPr><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

// ── 1. Bell & Weaver (2002) ────────────────────────────────────
// Insert before the Blake (2020) paragraph in Selected Scientific Articles
console.log("\n1. Adding Bell & Weaver (2002)...");
const BELL_TEXT = "Bell, D. D., & Weaver, W. D., Jr. (Eds.). (2002). Commercial chicken meat and egg production (5th ed.). Springer.";
const BLAKE_ANCHOR = "Blake, D. P., Knox, J.,";

if (docXml.includes(BELL_TEXT)) {
  console.log("   Already present — skipping");
} else {
  const blakeIdx = docXml.indexOf(BLAKE_ANCHOR);
  if (blakeIdx === -1) { console.error("   ✗ Blake anchor not found"); process.exit(1); }
  // Find start of Blake's <w:p>
  const blakePStart = docXml.lastIndexOf("<w:p>", blakeIdx);
  if (blakePStart === -1) { console.error("   ✗ Blake <w:p> not found"); process.exit(1); }
  docXml = docXml.slice(0, blakePStart) + bibPara(BELL_TEXT) + docXml.slice(blakePStart);
  console.log("   ✓ Inserted before Blake (2020)");
}

// ── 2. Conway & McKenzie (2007) ────────────────────────────────
// Insert after the last Cobb-Vantress entry (before Dhama)
console.log("\n2. Adding Conway & McKenzie (2007)...");
const CONWAY_TEXT = "Conway, D. P., & McKenzie, M. E. (2007). Poultry coccidiosis: Diagnostic and testing procedures (3rd ed.). Blackwell Publishing.";
const COBB_ANCHOR = "Cobb-Vantress. (2021). Cobb broiler management guide. Cobb-Vantress Inc.";

if (docXml.includes(CONWAY_TEXT)) {
  console.log("   Already present — skipping");
} else {
  const cobbIdx = docXml.lastIndexOf(COBB_ANCHOR);
  if (cobbIdx === -1) { console.error("   ✗ Cobb anchor not found"); process.exit(1); }
  // Find end of that Cobb paragraph
  const cobbPEnd = docXml.indexOf("</w:p>", cobbIdx) + 6;
  if (cobbPEnd < 6) { console.error("   ✗ Cobb </w:p> not found"); process.exit(1); }
  docXml = docXml.slice(0, cobbPEnd) + bibPara(CONWAY_TEXT) + docXml.slice(cobbPEnd);
  console.log("   ✓ Inserted after last Cobb-Vantress entry (before Dhama)");
}

// ── 3. Elanco Animal Health broiler disease reference guide ────
// Insert before the FAO institutional entry
console.log("\n3. Adding Elanco Animal Health reference...");
const ELANCO_TEXT = "Elanco Animal Health. (n.d.). Broiler disease reference guide. Elanco Animal Health.";
const FAO_INST_ANCHOR = "Food and Agriculture Organization of the United Nations (FAO). Avian influenza \u2014 One Health resources and surveillance. www.fao.org";

if (docXml.includes(ELANCO_TEXT)) {
  console.log("   Already present — skipping");
} else {
  const faoIdx = docXml.indexOf(FAO_INST_ANCHOR);
  if (faoIdx === -1) { console.error("   ✗ FAO institutional anchor not found"); process.exit(1); }
  const faoPStart = docXml.lastIndexOf("<w:p>", faoIdx);
  if (faoPStart === -1) { console.error("   ✗ FAO <w:p> not found"); process.exit(1); }
  docXml = docXml.slice(0, faoPStart) + bibPara(ELANCO_TEXT) + docXml.slice(faoPStart);
  console.log("   ✓ Inserted before FAO institutional entry");
}

// ── Validate ────────────────────────────────────────────────────
console.log("\nValidating...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) { console.error("  ✗ Mismatched tags — aborting"); process.exit(1); }
console.log("  ✓ Validated");

// Spot-check
["Bell, D. D., & Weaver", "Conway, D. P., & McKenzie", "Elanco Animal Health"].forEach(t => {
  console.log(`  ${docXml.includes(t) ? "✓" : "✗"} ${t}`);
});

// ── Write + repack ──────────────────────────────────────────────
fs.writeFileSync(path.join(extractDir, "word", "document.xml"), docXml, "utf-8");

console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_addrefs.zip");
execSync(`powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`Wrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`Size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);
console.log("\nDone. 3 references added.");
