/**
 * patch-course7-orig-photos.js
 *
 * Replaces the 4 wrong Course-3 photos in the reformatted Course 7 docx
 * with the 10 original Course 7 photos, placed at their correct sections.
 *
 * Run: node dashboard/scripts/patch-course7-orig-photos.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Paths ─────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "../../");
const ORIG_PHOTOS_DIR = path.resolve(ROOT, "Course 7");
const SRC_DOCX = path.resolve(
  ROOT,
  "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx"
);
const OUT_DASHBOARD = path.resolve(
  __dirname,
  "../public/docs/course-07-common-poultry-diseases.docx"
);
const OUT_ROOT = SRC_DOCX;

const WORK_DIR = path.join(os.tmpdir(), "course7_patch3");

// ── rIds to remove (wrong Course 3 photos from previous patch) ────
const REMOVE_RIDS = ["rId19", "rId20", "rId21", "rId22"];

// ── Original Course 7 photos to inject ───────────────────────────
// Each photo is inserted right after the matching H1 heading.
// Sections with multiple photos list them in order — all go after the same H1.
const PHOTOS = [
  // Introduction
  {
    file: "poultry_farm_intro.png",
    rId: "rId23",
    imgId: 23,
    sectionText: "Introduction",
    caption:
      "Photo: Commercial poultry operation — recognizing disease early is the single highest-leverage skill a Canadian poultry farmer can develop.",
  },
  // Section 2 — two photos
  {
    file: "disease_spread_biosecurity.png",
    rId: "rId24",
    imgId: 24,
    sectionText: "How Disease Gets Into Your Barn",
    caption:
      "Photo: Disease spread pathways — shared equipment, vehicles, and human foot traffic are the primary routes of introduction into a barn.",
  },
  {
    file: "contaminated outside.jpg",
    mediaFile: "contaminated_outside.jpg",
    rId: "rId25",
    imgId: 25,
    sectionText: "How Disease Gets Into Your Barn",
    caption:
      "Photo: Contaminated outdoor environment near a barn entry point. Wild birds and surface water are significant disease vectors for commercial flocks.",
  },
  // Section 3
  {
    file: "biosecurity_danish_bench.png",
    rId: "rId26",
    imgId: 26,
    sectionText: "Biosecurity Basics",
    caption:
      "Photo: Danish entry system (biosecurity bench) at a barn entrance — the physical divide between the clean and dirty zones is a foundational biosecurity control.",
  },
  // Section 4 — two photos
  {
    file: "sick_broiler_coccidiosis.png",
    rId: "rId27",
    imgId: 27,
    sectionText: "Common Diseases in Broilers",
    caption:
      "Photo: Broiler showing signs consistent with coccidiosis — bloody droppings, reduced feed intake, and huddling are early warning signs that warrant immediate investigation.",
  },
  {
    file: "disease_detection_broiler.png",
    rId: "rId28",
    imgId: 28,
    sectionText: "Common Diseases in Broilers",
    caption:
      "Photo: Early disease detection in a commercial broiler house — daily observation of flock distribution and behaviour is your primary on-farm diagnostic tool.",
  },
  // Section 5
  {
    file: "layer barn \u06F3.png",
    mediaFile: "layer_barn_3.png",
    rId: "rId29",
    imgId: 29,
    sectionText: "Layers and Breeders",
    caption:
      "Photo: Commercial laying hen barn. Feather condition, eggshell quality, and production rate are the primary health indicators to monitor in layer flocks.",
  },
  // Section 6
  {
    file: "Canadian duck and geese farming.png",
    mediaFile: "canadian_duck_geese.png",
    rId: "rId30",
    imgId: 30,
    sectionText: "Ducks and Geese",
    caption:
      "Photo: Canadian duck and geese farming. Waterfowl are natural reservoirs for avian influenza and require heightened biosecurity protocols, especially during migratory seasons.",
  },
  // Section 7
  {
    file: "Canadian Turkey farming.png",
    mediaFile: "canadian_turkey.png",
    rId: "rId31",
    imgId: 31,
    sectionText: "Common Diseases in Turkeys",
    caption:
      "Photo: Commercial turkey production in Canada. Turkeys are highly susceptible to Hemorrhagic Enteritis, Newcastle Disease, and respiratory pathogens.",
  },
  // Section 8
  {
    file: "crd_ibv_respiratory.png",
    rId: "rId32",
    imgId: 32,
    sectionText: "Cross-Species",
    caption:
      "Photo: Respiratory disease presentation — CRD and IBV can spread across species and represent an elevated cross-contamination risk on mixed-species operations.",
  },
];

// ── Image dimensions in EMU (500 × 320 px at 96 DPI) ─────────
const CX = Math.round((500 / 96) * 914400); // 4762500
const CY = Math.round((320 / 96) * 914400); // 3048000

// ── Build drawing + caption XML block ────────────────────────
function photoBlock(rId, imgId, caption) {
  const esc = caption
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return (
    `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="80"/></w:pPr>` +
    `<w:r><w:drawing>` +
    `<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">` +
    `<wp:extent cx="${CX}" cy="${CY}"/>` +
    `<wp:docPr id="${imgId}" name="Img${imgId}"/>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
    `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:nvPicPr>` +
    `<pic:cNvPr id="${imgId}" name="" descr=""/>` +
    `<pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr>` +
    `</pic:nvPicPr>` +
    `<pic:blipFill>` +
    `<a:blip r:embed="${rId}" cstate="none"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch>` +
    `</pic:blipFill>` +
    `<pic:spPr bwMode="auto">` +
    `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${CX}" cy="${CY}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `</pic:spPr>` +
    `</pic:pic></a:graphicData></a:graphic>` +
    `</wp:inline></w:drawing></w:r></w:p>` +
    `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="280"/></w:pPr>` +
    `<w:r><w:rPr>` +
    `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
    `<w:i/><w:sz w:val="20"/><w:color w:val="595959"/>` +
    `</w:rPr><w:t xml:space="preserve">${esc}</w:t></w:r></w:p>`
  );
}

// ── Find end of an H1 paragraph containing target text ───────
function findH1ParaEnd(xml, sectionText) {
  let pos = 0;
  while (pos < xml.length) {
    const pStart = xml.indexOf("<w:p", pos);
    if (pStart === -1) break;
    const pEnd = xml.indexOf("</w:p>", pStart);
    if (pEnd === -1) break;
    const para = xml.slice(pStart, pEnd + 6);
    if (
      para.includes('w:val="Heading1"') &&
      para.includes(sectionText)
    ) {
      return pStart + para.length;
    }
    pos = pEnd + 6;
  }
  return -1;
}

// ── Find the nearest paragraph opening (<w:p> or <w:p >) before `before` ─
function lastParaStart(xml, before) {
  const a = xml.lastIndexOf("<w:p>", before);
  const b = xml.lastIndexOf("<w:p ", before);
  return Math.max(a, b);
}

// ── Remove a drawing paragraph + its following caption paragraph ─
function removePhotoBlock(xml, rId) {
  const embedPat = `r:embed="${rId}"`;
  const pos = xml.indexOf(embedPat);
  if (pos === -1) {
    console.warn(`  ✗ ${rId} not found in document.xml — skipping removal`);
    return xml;
  }

  const pStart = lastParaStart(xml, pos);
  const pEnd = xml.indexOf("</w:p>", pos) + 6;

  // The caption paragraph immediately follows
  const captionEnd = xml.indexOf("</w:p>", pEnd) + 6;

  console.log(`  ✓ Removed ${rId} drawing + caption`);
  return xml.slice(0, pStart) + xml.slice(captionEnd);
}

// ── Main ──────────────────────────────────────────────────────
console.log("Preparing work directory...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });

// Extract docx
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
const zipWin = zipPath.replace(/\//g, "\\");
const extractWin = extractDir.replace(/\//g, "\\");
execSync(
  `powershell -Command "Expand-Archive -Path '${zipWin}' -DestinationPath '${extractWin}' -Force"`
);

// ── Load document.xml ────────────────────────────────────────
let docXml = fs.readFileSync(
  path.join(extractDir, "word", "document.xml"),
  "utf-8"
);

// ── Step 1: Remove wrong Course 3 photos ─────────────────────
console.log("\nRemoving wrong Course 3 photos...");
for (const rId of REMOVE_RIDS) {
  docXml = removePhotoBlock(docXml, rId);
}

// ── Step 2: Insert original Course 7 photos ──────────────────
console.log("\nInserting original Course 7 photos...");

// Group photos by section so all photos for a section go in together
const bySection = new Map();
for (const photo of PHOTOS) {
  if (!bySection.has(photo.sectionText))
    bySection.set(photo.sectionText, []);
  bySection.get(photo.sectionText).push(photo);
}

for (const [sectionText, photos] of bySection) {
  const insertPos = findH1ParaEnd(docXml, sectionText);
  if (insertPos === -1) {
    console.warn(`  ✗ H1 not found: "${sectionText}"`);
    continue;
  }
  const block = photos
    .map((p) => photoBlock(p.rId, p.imgId, p.caption))
    .join("");
  docXml =
    docXml.slice(0, insertPos) + block + docXml.slice(insertPos);
  console.log(
    `  ✓ Inserted ${photos.length} photo(s) after "${sectionText}"`
  );
}

fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  docXml,
  "utf-8"
);

// ── Step 3: Copy media files ──────────────────────────────────
console.log("\nCopying media files...");
const mediaDir = path.join(extractDir, "word", "media");

// Remove old wrong media files
for (const badFile of [
  "broiler_house.jpg",
  "lame_broiler.jpg",
  "feather_loss.jpg",
  "cyanosis_chickens.jpg",
]) {
  const badPath = path.join(mediaDir, badFile);
  if (fs.existsSync(badPath)) {
    fs.unlinkSync(badPath);
    console.log(`  ✗ Removed ${badFile}`);
  }
}

// Copy new photos (use mediaFile as destination name if provided, else original name)
for (const photo of PHOTOS) {
  const src = path.join(ORIG_PHOTOS_DIR, photo.file);
  const dest = path.join(mediaDir, photo.mediaFile || photo.file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const size = Math.round(fs.statSync(src).size / 1024);
    const destName = photo.mediaFile || photo.file;
    console.log(`  ✓ ${photo.file} → ${destName} (${size} KB)`);
  } else {
    console.warn(`  ✗ ${photo.file} not found in ${ORIG_PHOTOS_DIR}`);
  }
}

// ── Step 4: Patch relationships ───────────────────────────────
console.log("\nPatching relationships...");
const relsPath = path.join(
  extractDir,
  "word",
  "_rels",
  "document.xml.rels"
);
let relsXml = fs.readFileSync(relsPath, "utf-8");

// Remove old wrong relationship entries
for (const rId of REMOVE_RIDS) {
  relsXml = relsXml.replace(
    new RegExp(
      `<Relationship[^>]*Id="${rId}"[^>]*/relationships/image[^>]*/>`,
      "g"
    ),
    ""
  );
  console.log(`  ✓ Removed relationship ${rId}`);
}

// Add new relationship entries (use mediaFile name if provided)
const newRels = PHOTOS.map(
  (p) =>
    `<Relationship Id="${p.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${p.mediaFile || p.file}"/>`
).join("");
relsXml = relsXml.replace("</Relationships>", newRels + "</Relationships>");
fs.writeFileSync(relsPath, relsXml, "utf-8");
console.log(`  ✓ Added ${PHOTOS.length} new image relationships`);

// ── Step 5: Validate XML ──────────────────────────────────────
console.log("\nValidating patched document.xml...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ XML paragraph tags balanced");

// Verify all new rIds are present
for (const photo of PHOTOS) {
  if (!docXml.includes(`r:embed="${photo.rId}"`)) {
    console.error(`  ✗ ${photo.rId} missing from document.xml`);
    process.exit(1);
  }
}
console.log(`  ✓ All ${PHOTOS.length} new image rIds present in document.xml`);

// Verify old rIds are gone
for (const rId of REMOVE_RIDS) {
  if (docXml.includes(`r:embed="${rId}"`)) {
    console.error(`  ✗ ${rId} still present — removal failed`);
    process.exit(1);
  }
}
console.log(`  ✓ All ${REMOVE_RIDS.length} wrong photo rIds removed`);

// ── Step 6: Repack as docx ────────────────────────────────────
console.log("\nRepacking docx...");
const newZip = path.join(WORK_DIR, "course7_new.zip");
const newZipWin = newZip.replace(/\//g, "\\");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractWin}\\*' -DestinationPath '${newZipWin}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(
  `\nDone. File size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`
);
console.log("Open in Word — TOC auto-updates on open.");
