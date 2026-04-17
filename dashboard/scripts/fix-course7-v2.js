/**
 * fix-course7-v2.js
 *
 * Six fixes for Course 7 docx:
 *  1. Heading2 font size: remove explicit sz=24 overrides → inherit style (15pt)
 *  2. Blank second page: delete TOC section (Para 16-21) so cover → content directly
 *  3. Number photos: prefix captions "Photo 1:", "Photo 2:", …
 *  4. Delete rId24 photo block (Disease spread pathways)
 *  5. Replace rId32 photo with Cross-species-diseases.png + update caption
 *  6. Explicitly set <w:updateFields w:val="0"/> in settings.xml
 *
 * Run: node dashboard/scripts/fix-course7-v2.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Paths ─────────────────────────────────────────────────────
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
const CROSS_SPECIES_PHOTO = path.resolve(ROOT, "Course 7", "Cross-species-diseases.png");

const WORK_DIR = path.join(os.tmpdir(), "course7_v2");

// ── Extract ───────────────────────────────────────────────────
console.log("Preparing work directory...");
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
let settings = fs.readFileSync(
  path.join(extractDir, "word", "settings.xml"),
  "utf-8"
);
let relsXml = fs.readFileSync(
  path.join(extractDir, "word", "_rels", "document.xml.rels"),
  "utf-8"
);

// ── Helper: walk paragraphs ───────────────────────────────────
function walkParas(xml, fn) {
  let result = "";
  let pos = 0;
  while (pos < xml.length) {
    const pStart = xml.indexOf("<w:p", pos);
    if (pStart === -1) {
      result += xml.slice(pos);
      break;
    }
    result += xml.slice(pos, pStart);
    const pEnd = xml.indexOf("</w:p>", pStart) + 6;
    if (pEnd < 6) { result += xml.slice(pStart); break; }
    const para = xml.slice(pStart, pEnd);
    result += fn(para);
    pos = pEnd;
  }
  return result;
}

// ── Helper: find last para start before `before` ─────────────
function lastParaStart(xml, before) {
  const a = xml.lastIndexOf("<w:p>", before);
  const b = xml.lastIndexOf("<w:p ", before);
  return Math.max(a, b);
}

// ── FIX 1: Remove explicit sz=24 from Heading2 paragraphs ────
console.log("\nFix 1: Heading2 font size → remove explicit sz=24 override...");
let h2Fixed = 0;
docXml = walkParas(docXml, (para) => {
  if (!para.includes('w:val="Heading2"')) return para;
  const before = para;
  // Remove <w:sz w:val="24"/> and <w:szCs w:val="24"/> inside runs
  let fixed = para
    .replace(/<w:sz w:val="24"\/>/g, "")
    .replace(/<w:szCs w:val="24"\/>/g, "");
  // Also remove from pPr-level rPr if present
  if (fixed !== before) h2Fixed++;
  return fixed;
});
console.log(`  ✓ Removed sz=24 override from ${h2Fixed} Heading2 paragraph(s)`);

// ── FIX 2: Remove TOC section (blank second page) ─────────────
// Delete these exact paragraph strings (Para 16-21 from inspection):
//   Para 16: TOC Heading1
//   Para 17: empty spacing
//   Para 18: TOC field begin
//   Para 19: TOC field end
//   Para 20: page break after TOC
//   Para 21: sectPr paragraph (section break between TOC and content)
console.log("\nFix 2: Remove TOC section (blank second page)...");

const TOC_PARAGRAPHS = [
  // Para 16 - Table of Contents Heading1
  `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">Table of Contents</w:t></w:r></w:p>`,
  // Para 17 - empty spacing
  `<w:p><w:pPr><w:spacing w:after="0" w:before="200"/></w:pPr></w:p>`,
  // Para 18 - TOC field
  `<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/><w:instrText xml:space="preserve">TOC \\h \\o &quot;1-3&quot;</w:instrText><w:fldChar w:fldCharType="separate"/></w:r></w:p>`,
  // Para 19 - field end
  `<w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`,
  // Para 20 - page break after TOC
  `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`,
];

for (const para of TOC_PARAGRAPHS) {
  if (docXml.includes(para)) {
    docXml = docXml.replace(para, "");
    console.log(`  ✓ Removed: ${para.substring(0, 80)}...`);
  } else {
    console.warn(`  ✗ NOT FOUND: ${para.substring(0, 80)}...`);
  }
}

// Para 21 - sectPr paragraph (search by content pattern, not exact match)
const sectPrParaMatch = docXml.match(
  /<w:p><w:pPr><w:sectPr><w:headerReference[^<]*<\/w:sectPr><\/w:pPr><\/w:p>/
);
if (sectPrParaMatch) {
  docXml = docXml.replace(sectPrParaMatch[0], "");
  console.log(`  ✓ Removed sectPr paragraph (section break)`);
} else {
  console.warn("  ✗ sectPr paragraph not found");
}

// ── FIX 4: Delete rId24 photo block + caption ─────────────────
// (Do Fix 4 before Fix 3 so photo numbering is correct)
console.log("\nFix 4: Delete rId24 photo (Disease spread pathways)...");

function removePhotoBlock(xml, rId) {
  const embedPat = `r:embed="${rId}"`;
  const pos = xml.indexOf(embedPat);
  if (pos === -1) {
    console.warn(`  ✗ ${rId} not found in document.xml`);
    return xml;
  }
  const pStart = lastParaStart(xml, pos);
  const pEnd = xml.indexOf("</w:p>", pos) + 6;
  const captionEnd = xml.indexOf("</w:p>", pEnd) + 6;
  console.log(`  ✓ Removed ${rId} photo block + caption`);
  return xml.slice(0, pStart) + xml.slice(captionEnd);
}

docXml = removePhotoBlock(docXml, "rId24");

// Remove rId24 from relationships
relsXml = relsXml.replace(
  new RegExp(`<Relationship[^>]*Id="rId24"[^>]*/relationships/image[^>]*/>`, "g"),
  ""
);
console.log("  ✓ Removed rId24 from relationships");

// Remove rId24 media file
const mediaDir = path.join(extractDir, "word", "media");
const rId24Media = path.join(mediaDir, "disease_spread_biosecurity.png");
if (fs.existsSync(rId24Media)) {
  fs.unlinkSync(rId24Media);
  console.log("  ✓ Deleted disease_spread_biosecurity.png from media");
} else {
  console.warn("  ✗ disease_spread_biosecurity.png not found in media");
}

// ── FIX 5: Replace rId32 photo with Cross-species-diseases.png ─
console.log("\nFix 5: Replace rId32 with Cross-species-diseases.png...");

// Remove old crd_ibv_respiratory.png and copy new file
const oldMedia = path.join(mediaDir, "crd_ibv_respiratory.png");
if (fs.existsSync(oldMedia)) {
  fs.unlinkSync(oldMedia);
  console.log("  ✓ Deleted crd_ibv_respiratory.png");
}

if (fs.existsSync(CROSS_SPECIES_PHOTO)) {
  const destName = "cross_species_diseases.png";
  fs.copyFileSync(CROSS_SPECIES_PHOTO, path.join(mediaDir, destName));
  const size = Math.round(fs.statSync(CROSS_SPECIES_PHOTO).size / 1024);
  console.log(`  ✓ Copied Cross-species-diseases.png → ${destName} (${size} KB)`);

  // Update rId32 relationship to point to new file
  relsXml = relsXml.replace(
    new RegExp(`(<Relationship[^>]*Id="rId32"[^>]*Target="media/)crd_ibv_respiratory\\.png("\\s*/>)`),
    `$1${destName}$2`
  );
  // Also try a more flexible replacement
  relsXml = relsXml.replace(
    /(<Relationship[^>]*Id="rId32"[^>]*Target="media\/)[^"]+("\/?>)/,
    `$1${destName}$2`
  );
  console.log("  ✓ Updated rId32 relationship Target");

  // Update caption for rId32 in document.xml
  const OLD_CAPTION =
    "Photo: Respiratory disease presentation \u2014 CRD can spread across species and represent an elevated cross-contamination risk on mixed-species operations.";
  const NEW_CAPTION =
    "Photo: Cross-species disease risk on mixed Canadian poultry operations \u2014 shared airspace, equipment, and proximity between waterfowl, turkeys, and broilers creates transmission pathways for Avian Influenza, Newcastle Disease, and Mycoplasma.";
  if (docXml.includes(OLD_CAPTION)) {
    docXml = docXml.replace(OLD_CAPTION, NEW_CAPTION);
    console.log("  ✓ Updated rId32 caption text");
  } else {
    // Try escaped version
    const escapedOld = OLD_CAPTION.replace(/\u2014/g, "\u2014");
    console.warn(`  ✗ Old caption not found — searching...`);
    // Find all captions near rId32
    const rId32Pos = docXml.indexOf('r:embed="rId32"');
    if (rId32Pos !== -1) {
      const captionSearchArea = docXml.slice(rId32Pos, rId32Pos + 2000);
      const photoMatch = captionSearchArea.match(/Photo:[^<]{5,200}/);
      if (photoMatch) {
        console.log("  Found nearby caption:", photoMatch[0].substring(0, 100));
        docXml = docXml.replace(photoMatch[0], NEW_CAPTION);
        console.log("  ✓ Updated caption (fuzzy match)");
      }
    }
  }
} else {
  console.error(`  ✗ Cross-species-diseases.png NOT FOUND at: ${CROSS_SPECIES_PHOTO}`);
}

// ── FIX 3: Number photos (after deletion so numbers are final) ─
console.log("\nFix 3: Number photos...");
let photoNum = 0;
let captionCount = 0;
docXml = walkParas(docXml, (para) => {
  // Caption paragraphs: italic, color 595959, contain "Photo:"
  if (para.includes("595959") && para.includes("Photo:")) {
    photoNum++;
    captionCount++;
    // Replace "Photo:" with "Photo N:"
    const updated = para.replace(/Photo:/, `Photo ${photoNum}:`);
    if (updated !== para) {
      return updated;
    }
  }
  return para;
});
console.log(`  ✓ Numbered ${captionCount} photo captions (Photo 1 – Photo ${photoNum})`);

// ── FIX 6: Explicitly disable field update in settings.xml ─────
console.log("\nFix 6: Set updateFields=0 in settings.xml...");
// Remove any existing updateFields (clean slate)
settings = settings
  .replace(/<w:updateFields[^/]*\/>/g, "")
  .replace(/<w:updateFields[^>]*>[^<]*<\/w:updateFields>/g, "");
// Insert explicit w:val="0" right before closing </w:settings>
settings = settings.replace(
  "</w:settings>",
  '<w:updateFields w:val="0"/></w:settings>'
);
console.log("  ✓ Added <w:updateFields w:val=\"0\"/> to settings.xml");

// ── Write patched files ───────────────────────────────────────
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
fs.writeFileSync(
  path.join(extractDir, "word", "_rels", "document.xml.rels"),
  relsXml,
  "utf-8"
);

// ── Validate XML ──────────────────────────────────────────────
console.log("\nValidating XML...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ XML paragraph tags balanced");

// ── Repack ────────────────────────────────────────────────────
console.log("\nRepacking docx...");
const newZip = path.join(WORK_DIR, "course7_v2.zip");
const newZipWin = newZip.replace(/\//g, "\\");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractWin}\\*' -DestinationPath '${newZipWin}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);

const finalSize = Math.round(fs.statSync(OUT_ROOT).size / 1024);
console.log(`\nDone. File size: ${finalSize} KB`);
console.log("Open in Word to verify all 6 fixes.");
