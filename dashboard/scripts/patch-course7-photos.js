/**
 * patch-course7-photos.js
 *
 * Patches the Course 7 pre-built docx to embed real clinical photos after
 * the "Broilers" and "Layers & Breeders" disease sections.
 *
 * Run: node dashboard/scripts/patch-course7-photos.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Paths ─────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "../../");
const IMAGES_DIR = path.resolve(__dirname, "../public/images");
const SRC_DOCX = path.resolve(
  ROOT,
  "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx"
);
const OUT_DASHBOARD = path.resolve(
  __dirname,
  "../public/docs/course-07-common-poultry-diseases.docx"
);
const OUT_ROOT = SRC_DOCX;

const WORK_DIR = path.join(os.tmpdir(), "course7_patch2");

// ── Photos to inject ──────────────────────────────────────────
const PHOTOS = [
  {
    file: "broiler_house.jpg",
    rId: "rId19",
    imgId: 19,
    sectionText: "4. Common Diseases in Broilers",
    caption:
      "Photo: Inside a commercial broiler house. Even distribution of active birds across the full floor is a sign of optimal air quality and temperature. Source: USDA, Public Domain.",
  },
  {
    file: "lame_broiler.jpg",
    rId: "rId20",
    imgId: 20,
    sectionText: "4. Common Diseases in Broilers",
    caption:
      "Photo: A commercial broiler with significant leg impairment (Gait Score 3\u20134). Leg disorders are a leading cause of welfare concerns and carcass downgrades in broilers. Source: Glass Walls Project (Israel), CC BY-SA 4.0.",
  },
  {
    file: "feather_loss.jpg",
    rId: "rId21",
    imgId: 21,
    sectionText: "5. Common Diseases in Layers",
    caption:
      "Photo: Significant feather loss on back and neck in a laying hen \u2014 the classic appearance of feather pecking damage. Source: Wikimedia Commons, CC BY 1.0.",
  },
  {
    file: "cyanosis_chickens.jpg",
    rId: "rId22",
    imgId: 22,
    sectionText: "5. Common Diseases in Layers",
    caption:
      "Photo: Cyanosis in chickens. Multiple cyanotic birds is a same-day veterinary emergency. Source: Otwarte Klatki / Wikimedia Commons, CC BY 2.0.",
  },
];

// ── Image dimensions in EMU (440 × 280 px at 96 DPI) ─────────
const CX = Math.round((440 / 96) * 914400); // 4193000
const CY = Math.round((280 / 96) * 914400); // 2669000

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
// Returns the index just after the closing </w:p> of the match, or -1.
function findH1ParaEnd(xml, sectionText) {
  // Paragraphs are contiguous in the XML (no newlines inside <w:p>).
  // Walk forward looking for a <w:p that contains Heading1 + sectionText.
  let pos = 0;
  while (pos < xml.length) {
    const pStart = xml.indexOf("<w:p", pos);
    if (pStart === -1) break;

    // Find the matching </w:p>
    // Paragraphs can nest <w:p> in structured doc tags; count depth.
    // In practice, w:p does NOT nest, so just find the next </w:p>.
    const pEnd = xml.indexOf("</w:p>", pStart);
    if (pEnd === -1) break;

    const para = xml.slice(pStart, pEnd + 6); // includes </w:p>

    if (
      para.includes('w:val="Heading1"') &&
      para.includes(sectionText)
    ) {
      return pStart + para.length; // position right after </w:p>
    }

    pos = pEnd + 6;
  }
  return -1;
}

// ── Main ──────────────────────────────────────────────────────
console.log("Preparing work directory...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });

// Extract docx (rename to .zip first — required by Expand-Archive)
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
execSync(
  `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`
);

// ── Patch document.xml ────────────────────────────────────────
console.log("Patching document.xml...");
let docXml = fs.readFileSync(
  path.join(extractDir, "word", "document.xml"),
  "utf-8"
);

// Group photos by section so we insert all photos for a section together
const bySection = new Map();
for (const photo of PHOTOS) {
  if (!bySection.has(photo.sectionText)) bySection.set(photo.sectionText, []);
  bySection.get(photo.sectionText).push(photo);
}

// Process sections in order; after each insertion, recalculate positions
for (const [sectionText, photos] of bySection) {
  const insertPos = findH1ParaEnd(docXml, sectionText);
  if (insertPos === -1) {
    console.warn(`  ✗ H1 not found: "${sectionText}"`);
    continue;
  }

  // Build combined block for all photos in this section
  const block = photos.map((p) => photoBlock(p.rId, p.imgId, p.caption)).join("");

  // Precise string insertion — no split/join, no orphaned tags
  docXml = docXml.slice(0, insertPos) + block + docXml.slice(insertPos);

  console.log(`  ✓ Injected ${photos.length} photo(s) after "${sectionText}..."`);
}

fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  docXml,
  "utf-8"
);

// ── Copy media files ──────────────────────────────────────────
console.log("Copying media files...");
const mediaDir = path.join(extractDir, "word", "media");
for (const photo of PHOTOS) {
  const src = path.join(IMAGES_DIR, photo.file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(mediaDir, photo.file));
    console.log(`  ✓ ${photo.file}`);
  } else {
    console.warn(`  ✗ ${photo.file} not found`);
  }
}

// ── Patch relationships ───────────────────────────────────────
console.log("Patching relationships...");
const relsPath = path.join(extractDir, "word", "_rels", "document.xml.rels");
let relsXml = fs.readFileSync(relsPath, "utf-8");
const newRels = PHOTOS.map(
  (p) =>
    `<Relationship Id="${p.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${p.file}"/>`
).join("");
relsXml = relsXml.replace("</Relationships>", newRels + "</Relationships>");
fs.writeFileSync(relsPath, relsXml, "utf-8");

// ── Patch [Content_Types].xml ─────────────────────────────────
const ctPath = path.join(extractDir, "[Content_Types].xml");
let ctXml = fs.readFileSync(ctPath, "utf-8");
if (!ctXml.includes('Extension="jpeg"')) {
  ctXml = ctXml.replace(
    "</Types>",
    '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>'
  );
  fs.writeFileSync(ctPath, ctXml, "utf-8");
  console.log("  ✓ Added jpeg content type");
}

// ── Validate XML before repacking ────────────────────────────
console.log("Validating patched document.xml...");
const closingWp = (docXml.match(/<\/w:p>/g) || []).length;
const openingWp = (docXml.match(/<w:p[ >]/g) || []).length;
console.log(`  w:p open: ${openingWp}  close: ${closingWp}`);
if (closingWp !== openingWp) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ XML paragraph tags balanced");

// ── Repack as docx ────────────────────────────────────────────
console.log("Repacking docx...");
const newZip = path.join(WORK_DIR, "course7_new.zip");
// Use Compress-Archive on the contents of the extracted folder
execSync(
  `powershell -Command "Compress-Archive -Path '${extractDir}\\*' -DestinationPath '${newZip}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log("\nDone. Open in Word — TOC auto-updates on open.");
