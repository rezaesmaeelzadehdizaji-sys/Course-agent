/**
 * patch-course7-photos.js
 *
 * Patches the Course 7 pre-built docx to embed real clinical photos after
 * the "Broilers" and "Layers & Breeders" disease sections.
 * Also copies the patched file to the root course 7 docx.
 *
 * Run: node dashboard/scripts/patch-course7-photos.js
 *
 * No external dependencies — uses only Node.js built-ins + PowerShell (Windows).
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

const WORK_DIR = path.join(require("os").tmpdir(), "course7_patch");

// ── Photos to inject ──────────────────────────────────────────
// Each photo specifies which H1 section to follow and its caption.
const PHOTOS = [
  {
    file: "broiler_house.jpg",
    ext: "jpeg",
    rId: "rId19",
    imgId: 19,
    // Match text contains "4. Common Diseases in Broilers"
    sectionText: "4. Common Diseases in Broilers",
    caption:
      "Photo: Inside a commercial broiler house. Even distribution of active birds across the full floor is a sign of optimal air quality and temperature. Source: USDA, Public Domain.",
  },
  {
    file: "lame_broiler.jpg",
    ext: "jpeg",
    rId: "rId20",
    imgId: 20,
    // Insert after broiler_house (append to same section insert point, second image)
    sectionText: "4. Common Diseases in Broilers",
    caption:
      "Photo: A commercial broiler with significant leg impairment (Gait Score 3\u20134). Leg disorders are a leading cause of welfare concerns and carcass downgrades in broilers. Source: Glass Walls Project (Israel), CC BY-SA 4.0.",
    second: true,
  },
  {
    file: "feather_loss.jpg",
    ext: "jpeg",
    rId: "rId21",
    imgId: 21,
    sectionText: "5. Common Diseases in Layers",
    caption:
      "Photo: Significant feather loss on back and neck in a laying hen \u2014 the classic appearance of feather pecking damage. Affected birds are at risk of cannibalism and skin infections. Source: Wikimedia Commons, CC BY 1.0.",
  },
  {
    file: "cyanosis_chickens.jpg",
    ext: "jpeg",
    rId: "rId22",
    imgId: 22,
    sectionText: "5. Common Diseases in Layers",
    caption:
      "Photo: Cyanosis (blue-purple discolouration of comb, wattles, and feet) in chickens. Multiple cyanotic birds in a flock is a same-day veterinary emergency. Source: Otwarte Klatki / Wikimedia Commons, CC BY 2.0.",
    second: true,
  },
];

// ── Image dimensions in EMU (440 × 280 px at 96 DPI) ─────────
const CX = Math.round((440 / 96) * 914400); // 4193000
const CY = Math.round((280 / 96) * 914400); // 2669000

// ── Helpers ───────────────────────────────────────────────────

function drawingXml(rId, imgId, caption) {
  const drawing = `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="80"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${CX}" cy="${CY}"/><wp:docPr id="${imgId}" name="Img${imgId}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${imgId}" name="" descr=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" cstate="none"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${CX}" cy="${CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

  const esc = caption
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const capPara = `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="280"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:i/><w:sz w:val="20"/><w:color w:val="595959"/></w:rPr><w:t xml:space="preserve">${esc}</w:t></w:r></w:p>`;

  return drawing + capPara;
}

function relationshipXml(rId, mediaFile) {
  return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaFile}"/>`;
}

// ── Main ──────────────────────────────────────────────────────

console.log("Preparing work directory...");
if (fs.existsSync(WORK_DIR)) {
  fs.rmSync(WORK_DIR, { recursive: true });
}
fs.mkdirSync(WORK_DIR, { recursive: true });

// Copy docx → work dir as .zip and expand
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
execSync(
  `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${WORK_DIR}\\extracted' -Force"`
);

const extracted = path.join(WORK_DIR, "extracted");

// ── Patch document.xml ────────────────────────────────────────
console.log("Patching document.xml...");
let docXml = fs.readFileSync(
  path.join(extracted, "word", "document.xml"),
  "utf-8"
);

// For sections with a single insert point, find the H1 paragraph closing tag
// and insert both images right after it.
// For sections with second:true, skip (they were injected with the first photo).

// Group photos by section
const bySection = {};
for (const photo of PHOTOS) {
  if (!bySection[photo.sectionText]) bySection[photo.sectionText] = [];
  bySection[photo.sectionText].push(photo);
}

for (const [sectionText, photos] of Object.entries(bySection)) {
  // Build insertion XML for all photos in this section
  let insertXml = "";
  for (const photo of photos) {
    insertXml += drawingXml(photo.rId, photo.imgId, photo.caption);
  }

  // Find the H1 paragraph containing this section text.
  // Strategy: find <w:pStyle w:val="Heading1"/> within a paragraph that also
  // contains the target text, then insert after its </w:p>.
  const lines = docXml.split("</w:p>");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].includes('w:val="Heading1"') &&
      lines[i].includes(sectionText)
    ) {
      lines[i] = lines[i] + "</w:p>" + insertXml;
      found = true;
      break;
    }
  }
  if (found) {
    docXml = lines.join("</w:p>");
    // Restore the final </w:p> split marker (join adds </w:p> between segments
    // but not after the last one — that's fine since the last segment ends with </w:body></w:document>)
    console.log(`  ✓ Injected ${photos.length} photo(s) after "${sectionText}..."`);
  } else {
    console.warn(`  ✗ Section not found: "${sectionText}"`);
  }
}

fs.writeFileSync(path.join(extracted, "word", "document.xml"), docXml, "utf-8");

// ── Copy media files ──────────────────────────────────────────
console.log("Copying media files...");
for (const photo of PHOTOS) {
  const src = path.join(IMAGES_DIR, photo.file);
  const dst = path.join(extracted, "word", "media", photo.file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`  ✓ ${photo.file}`);
  } else {
    console.warn(`  ✗ ${photo.file} not found at ${src}`);
  }
}

// ── Patch relationships ───────────────────────────────────────
console.log("Patching relationships...");
const relsPath = path.join(extracted, "word", "_rels", "document.xml.rels");
let relsXml = fs.readFileSync(relsPath, "utf-8");
// Insert new relationships before </Relationships>
const newRels = PHOTOS.map((p) =>
  relationshipXml(p.rId, p.file)
).join("");
relsXml = relsXml.replace("</Relationships>", newRels + "</Relationships>");
fs.writeFileSync(relsPath, relsXml, "utf-8");

// ── Patch [Content_Types].xml for jpeg ───────────────────────
const ctPath = path.join(extracted, "[Content_Types].xml");
let ctXml = fs.readFileSync(ctPath, "utf-8");
if (!ctXml.includes('Extension="jpeg"')) {
  ctXml = ctXml.replace(
    "</Types>",
    '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>'
  );
  fs.writeFileSync(ctPath, ctXml, "utf-8");
  console.log("  ✓ Added jpeg content type");
}

// ── Repack as docx ────────────────────────────────────────────
console.log("Repacking docx...");
const newZip = path.join(WORK_DIR, "course7_new.zip");
// PowerShell: compress the extracted folder contents into a zip
execSync(
  `powershell -Command "Compress-Archive -Path '${extracted}\\*' -DestinationPath '${newZip}' -Force"`
);

// Copy to both destinations
fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);

console.log("\nDone. Open in Word — photos embedded, TOC auto-updates on open.");
