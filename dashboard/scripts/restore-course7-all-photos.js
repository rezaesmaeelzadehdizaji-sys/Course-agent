/**
 * restore-course7-all-photos.js
 *
 * Restores the pre-reference state (af144e0) and re-embeds all ~30 disease
 * photos from "D:\Course agent\Course 7\" at their correct H1 / H2 positions.
 *
 * The script:
 *  1. Checks out the af144e0 dashboard docx as the base
 *  2. Adds 27 disease-specific photos (the ones that were in the user's
 *     manually-edited version before the reference-insertion scripts ran)
 *  3. Writes both output paths
 *
 * Run: node dashboard/scripts/restore-course7-all-photos.js
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "../../");
const COURSE7_DIR = path.resolve(ROOT, "Course 7");

// ── Use the af144e0 pre-reference base ──────────────────────────
// Checked out below; if you already have the correct file, comment out the
// git-checkout line and point SRC_DOCX at it directly.
const SRC_DOCX = path.resolve(ROOT, "_af144e0_base.docx");
const OUT_DASHBOARD = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const OUT_ROOT = path.resolve(ROOT, "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx");
const WORK_DIR = path.join(os.tmpdir(), "course7_restore_photos");

// ── Step 0: Extract the pre-reference base from git ────────────
console.log("Extracting af144e0 base from git...");
execSync(`git -C "${ROOT.replace(/\//g, "\\")}" show af144e0:"dashboard/public/docs/course-07-common-poultry-diseases.docx" > "${SRC_DOCX.replace(/\//g, "\\")}"`);
console.log("  ✓ af144e0 base written to " + SRC_DOCX);

// ── Image dimensions (500×320 px @ 96 dpi → EMU) ───────────────
const CX = Math.round((500 / 96) * 914400); // 4762500
const CY = Math.round((320 / 96) * 914400); // 3048000

// ── OOXML helpers ───────────────────────────────────────────────
function xmlEscape(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function photoBlock(rId, imgId, caption) {
  const esc = xmlEscape(caption);
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

// Find end of the FIRST Heading1 paragraph containing sectionText
function findH1ParaEnd(xml, sectionText) {
  let pos = 0;
  while (pos < xml.length) {
    const pS = xml.indexOf("<w:p", pos);
    if (pS === -1) break;
    const pE = xml.indexOf("</w:p>", pS);
    if (pE === -1) break;
    const para = xml.slice(pS, pE + 6);
    if (para.includes('Heading1') && para.includes(sectionText)) {
      return pS + para.length;
    }
    pos = pE + 6;
  }
  return -1;
}

// Find end of the FIRST Heading2 paragraph containing sectionText (after afterPos)
function findH2ParaEnd(xml, sectionText, afterPos) {
  let pos = afterPos || 0;
  while (pos < xml.length) {
    const pS = xml.indexOf("<w:p", pos);
    if (pS === -1) break;
    const pE = xml.indexOf("</w:p>", pS);
    if (pE === -1) break;
    const para = xml.slice(pS, pE + 6);
    if (para.includes('Heading2') && para.includes(sectionText)) {
      return pS + para.length;
    }
    pos = pE + 6;
  }
  return -1;
}

// ── Photo list ─────────────────────────────────────────────────
// Each entry: { file, mediaFile, rId, imgId, insertAt, anchor, caption }
// insertAt: "H1" or "H2"
// anchor:   text that appears in the heading
// For H2, we also specify h2After so we search only within the right section
const PHOTOS = [
  // NOTE: disease_spread_biosecurity.png no longer exists on disk — skip
  // ─── Section 3: Biosecurity Basics ────────────────────────────
  {
    file: "biosecurity_door_closed_chicks.png",
    rId: "rId33", imgId: 33,
    insertAt: "H1", anchor: "Biosecurity Basics",
    caption: "Photo: Barn door closed to protect chicks — controlled access and clear entry/exit protocols are the foundation of effective biosecurity."
  },
  // ─── Section 4: Broilers — H1 level ───────────────────────────
  {
    file: "sick_chicks_broiler_barn.png",
    rId: "rId34", imgId: 34,
    insertAt: "H1", anchor: "Common Diseases in Broilers",
    caption: "Photo: Sick chicks in a commercial broiler barn — huddling, lethargy, and increased mortality are early indicators requiring immediate assessment."
  },
  // ─── Section 4: Broilers — H2 level ───────────────────────────
  {
    file: "coccidiosis_v4_fixed.png",
    rId: "rId35", imgId: 35,
    insertAt: "H2", anchor: "Coccidiosis:",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Coccidiosis lesions in the intestine — haemorrhagic inflammation of the intestinal mucosa is characteristic of Eimeria infections in broilers."
  },
  {
    file: "omphalitis_blue_paper.png_preview.jpeg",
    mediaFile: "omphalitis_yolk_sac.jpg",
    rId: "rId36", imgId: 36,
    insertAt: "H2", anchor: "Yolk sac",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Omphalitis / yolk sac infection — an unabsorbed, discoloured yolk sac in a day-old chick is the hallmark finding at post-mortem."
  },
  {
    file: "crd_ibv_respiratory.png",
    rId: "rId37", imgId: 37,
    insertAt: "H2", anchor: "CRD (Chronic Respiratory Disease)",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Tracheal lesions associated with CRD/IBV — mucosal thickening, excess mucus, and haemorrhage are consistent with Mycoplasma and Infectious Bronchitis Virus co-infection."
  },
  {
    file: "IBD_final_droppings.png",
    mediaFile: "ibd_droppings.png",
    rId: "rId38", imgId: 38,
    insertAt: "H2", anchor: "IBD (Infectious Bursal Disease):",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Watery diarrhoea and soiled vent associated with IBD (Gumboro disease) — birds are 3–6 weeks old and show sudden elevated mortality."
  },
  {
    file: "ibh_broiler_outbreak.png",
    rId: "rId39", imgId: 39,
    insertAt: "H2", anchor: "IBH (Inclusion Body Hepatitis):",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Swollen, pale liver with haemorrhagic areas — Inclusion Body Hepatitis caused by fowl adenovirus typically presents at 3–5 weeks in broilers."
  },
  {
    file: "ascites_bigger_belly.png",
    rId: "rId40", imgId: 40,
    insertAt: "H2", anchor: "Ascites",
    h2Section: "Common Diseases in Broilers",
    caption: "Photo: Broiler with ascites (water belly) — abdominal fluid accumulation secondary to right ventricular failure is a significant cause of condemnation in fast-growing broilers."
  },
  // ─── Section 5: Layers and Breeders — H2 level ────────────────
  {
    file: "NE_droppings_final.png",
    mediaFile: "ne_droppings.png",
    rId: "rId41", imgId: 41,
    insertAt: "H2", anchor: "Necrotic enteritis",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Necrotic enteritis lesions — diphtheritic membrane and haemorrhagic necrosis of the small intestinal mucosa caused by Clostridium perfringens."
  },
  {
    file: "fowl_cholera_matte_wattles.png",
    rId: "rId42", imgId: 42,
    insertAt: "H2", anchor: "Fowl cholera",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Swollen, cyanotic wattles in a hen with fowl cholera — Pasteurella multocida septicaemia causes rapid vascular compromise in affected birds."
  },
  {
    file: "Marek.png",
    mediaFile: "marek_disease.png",
    rId: "rId43", imgId: 43,
    insertAt: "H2", anchor: "Marek",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Marek's disease — unilateral leg paralysis caused by lymphomatous infiltration of the sciatic nerve is the most recognizable field presentation."
  },
  {
    file: "ILT_breeder_farm.png",
    rId: "rId44", imgId: 44,
    insertAt: "H2", anchor: "Infectious Laryngotracheitis",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Haemorrhagic tracheal exudate from a bird with ILT — blood-tinged mucus and severe respiratory distress are hallmarks of virulent ILT strains."
  },
  {
    file: "Cage Fatigue_layer_farm.PNG",
    mediaFile: "cage_fatigue_layer.png",
    rId: "rId45", imgId: 45,
    insertAt: "H2", anchor: "Layer osteoporosis",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Layer hen with osteoporosis / cage layer fatigue — bone fragility and keel deformities are common in peak-production hens with inadequate calcium or vitamin D3."
  },
  {
    file: "IBV_layer_farm.png",
    rId: "rId46", imgId: 46,
    insertAt: "H2", anchor: "Infectious Bronchitis (IBV):",
    h2Section: "Common Diseases in Layers",
    caption: "Photo: Layer barn affected by Infectious Bronchitis — wrinkled or soft-shelled eggs, a drop in production, and respiratory signs are the triad of IBV in laying flocks."
  },
  // NOTE: aMPV_floor_natural2.png no longer exists on disk — skip
  // ─── Section 6: Ducks and Geese — H2 level ────────────────────
  {
    file: "Limberneck diseases.png",
    mediaFile: "limberneck_botulism.png",
    rId: "rId48", imgId: 48,
    insertAt: "H2", anchor: "Botulism:",
    h2Section: "Common Diseases in Ducks",
    caption: "Photo: Duck with limberneck (botulism) — flaccid paralysis of the neck muscles caused by Clostridium botulinum type C toxin, most often associated with decaying organic matter in ponds."
  },
  {
    file: "duck_viral_enteritis_fixed.png",
    rId: "rId49", imgId: 49,
    insertAt: "H2", anchor: "Duck Viral Enteritis",
    h2Section: "Common Diseases in Ducks",
    caption: "Photo: Duck Viral Enteritis (Duck Plague) — haemorrhagic intestinal lesions and greenish diarrhoea with high mortality in adult ducks and geese."
  },
  {
    file: "duck_virus_hepatitis.png",
    rId: "rId50", imgId: 50,
    insertAt: "H2", anchor: "Duck Virus Hepatitis",
    h2Section: "Common Diseases in Ducks",
    caption: "Photo: Duck Virus Hepatitis — haemorrhagic liver spots in a duckling under 3 weeks old; DVH causes acute, high-mortality outbreaks in young ducklings."
  },
  {
    file: "derzsys_duck_farm.png",
    rId: "rId51", imgId: 51,
    insertAt: "H2", anchor: "Derzsy",
    h2Section: "Common Diseases in Ducks",
    caption: "Photo: Goslings affected by Derzsy's Disease (Goose Parvovirus) — stunted growth, ascites, and myocarditis are hallmarks of this highly lethal parvoviral infection."
  },
  {
    file: "riemerellosis_fixed_onehead.png",
    rId: "rId52", imgId: 52,
    insertAt: "H2", anchor: "Riemerellosis",
    h2Section: "Common Diseases in Ducks",
    caption: "Photo: Duck with torticollis caused by Riemerellosis (Riemerella anatipestifer) — fibrinous pericarditis, perihepatitis, and neurological signs are characteristic findings."
  },
  // ─── Section 7: Turkeys — H2 level ────────────────────────────
  {
    file: "HE_turkey_farm.png",
    rId: "rId53", imgId: 53,
    insertAt: "H2", anchor: "Hemorrhagic Enteritis",
    h2Section: "Common Diseases in Turkeys",
    caption: "Photo: Haemorrhagic Enteritis in turkeys — bloody droppings and intestinal haemorrhage caused by Turkey Adenovirus 3 typically in 6–12 week birds."
  },
  {
    file: "blackhead_subtle_head.png",
    rId: "rId54", imgId: 54,
    insertAt: "H2", anchor: "Blackhead Disease",
    h2Section: "Common Diseases in Turkeys",
    caption: "Photo: Turkey with Blackhead Disease (Histomoniasis) — yellow-sulphur-coloured liver lesions are pathognomonic; the darkened head cyanosis is variable in field cases."
  },
  {
    file: "MG_turkey_v3.png",
    rId: "rId55", imgId: 55,
    insertAt: "H2", anchor: "Mycoplasma gallisepticum",
    h2Section: "Common Diseases in Turkeys",
    caption: "Photo: Turkey flock affected by Mycoplasma gallisepticum (MG) — frothy eyes, nasal discharge, and feed conversion losses are the primary production impacts."
  },
  // ─── Section 8: Cross-Species — H2 level ──────────────────────
  {
    file: "ppmv1_pigeon_opisthotonos_v3.png",
    rId: "rId56", imgId: 56,
    insertAt: "H2", anchor: "Pigeon Paramyxovirus",
    h2Section: "Cross-Species Disease Concerns",
    caption: "Photo: Pigeon with opisthotonos caused by PPMV-1 — neurotropic paramyxovirus infection produces torticollis and twisting; wild feral pigeons are the primary reservoir."
  },
  // ─── Section 10: Reacting to Disease — H1 level ───────────────
  {
    file: "early_disease_detection_flock.png",
    rId: "rId57", imgId: 57,
    insertAt: "H1", anchor: "Reacting to Disease",
    caption: "Photo: Early disease detection in a commercial flock — systematic daily observation of bird behaviour, feed/water consumption, and mortality trends is your first line of on-farm diagnosis."
  },
];

// ── Extract ────────────────────────────────────────────────────
console.log("\nExtracting...");
if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });
const zipPath = path.join(WORK_DIR, "c7.zip");
fs.copyFileSync(SRC_DOCX, zipPath);
const extractDir = path.join(WORK_DIR, "extracted");
execSync(`powershell -Command "Expand-Archive -Path '${zipPath.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`);

const mediaDir = path.join(extractDir, "word", "media");
let docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");
const relsPath = path.join(extractDir, "word", "_rels", "document.xml.rels");
let relsXml = fs.readFileSync(relsPath, "utf-8");

// ── Insert photos ──────────────────────────────────────────────
console.log("\nInserting photos...");
let insertedCount = 0;

for (const photo of PHOTOS) {
  const mediaName = photo.mediaFile || photo.file;

  // Skip if rId already in the document (idempotent)
  if (docXml.includes(`r:embed="${photo.rId}"`)) {
    console.log(`  → ${photo.rId} already present — skipping`);
    continue;
  }

  let insertPos = -1;
  if (photo.insertAt === "H1") {
    insertPos = findH1ParaEnd(docXml, photo.anchor);
    if (insertPos === -1) {
      console.warn(`  ✗ H1 not found: "${photo.anchor}" — skipping ${photo.file}`);
      continue;
    }
  } else {
    // H2: find the heading within the document
    insertPos = findH2ParaEnd(docXml, photo.anchor, 0);
    if (insertPos === -1) {
      console.warn(`  ✗ H2 not found: "${photo.anchor}" — skipping ${photo.file}`);
      continue;
    }
  }

  docXml = docXml.slice(0, insertPos) + photoBlock(photo.rId, photo.imgId, photo.caption) + docXml.slice(insertPos);
  insertedCount++;
  console.log(`  ✓ ${photo.insertAt} "${photo.anchor}" ← ${photo.file}`);
}

console.log(`\n  Total inserted: ${insertedCount}`);

// ── Compress + copy media files ────────────────────────────────
// Resize to max 1200×900 and save as JPEG (85% quality) to keep
// docx under GitHub's 100 MB file limit.
console.log("\nCompressing and copying media files...");
let mediaCount = 0;

const psResizeScript = (srcWin, dstWin) => `
Add-Type -AssemblyName System.Drawing;
$src='${srcWin}'; $dst='${dstWin}';
$img=[System.Drawing.Image]::FromFile($src);
$maxW=1200; $maxH=900;
$r=[Math]::Min($maxW/$img.Width,$maxH/$img.Height);
if($r -ge 1){$r=1};
$nW=[int]($img.Width*$r); $nH=[int]($img.Height*$r);
$bmp=New-Object System.Drawing.Bitmap $nW,$nH;
$g=[System.Drawing.Graphics]::FromImage($bmp);
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;
$g.DrawImage($img,0,0,$nW,$nH);
$g.Dispose();$img.Dispose();
$enc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|Where-Object{$_.MimeType -eq 'image/jpeg'};
$p=New-Object System.Drawing.Imaging.EncoderParameters(1);
$p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,85L);
$bmp.Save($dst,$enc,$p);$bmp.Dispose();
`.trim().replace(/\n/g, " ");

for (const photo of PHOTOS) {
  if (!docXml.includes(`r:embed="${photo.rId}"`)) continue;
  const src = path.join(COURSE7_DIR, photo.file);
  if (!fs.existsSync(src)) {
    console.warn(`  ✗ Source not found: ${src}`);
    continue;
  }
  // Always write as .jpg in media (rename if needed)
  const mediaNameBase = (photo.mediaFile || photo.file).replace(/\.[^.]+$/, ".jpg");
  const dst = path.join(mediaDir, mediaNameBase);

  // Update rels target to use the .jpg name
  const oldTarget = `media/${photo.mediaFile || photo.file}`;
  const newTarget = `media/${mediaNameBase}`;
  relsXml = relsXml.replace(new RegExp(oldTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newTarget);

  const srcWin = src.replace(/\//g, "\\");
  const dstWin = dst.replace(/\//g, "\\");
  try {
    execSync(`powershell -Command "${psResizeScript(srcWin, dstWin)}"`);
    const origKb = Math.round(fs.statSync(src).size / 1024);
    const newKb = Math.round(fs.statSync(dst).size / 1024);
    console.log(`  ✓ ${photo.file} → ${mediaNameBase} (${origKb} KB → ${newKb} KB)`);
    mediaCount++;
  } catch (e) {
    console.warn(`  ✗ Compress failed for ${photo.file}: ${e.message}`);
    // Fall back to raw copy
    fs.copyFileSync(src, dst);
    console.warn(`    (raw copy fallback)`);
    mediaCount++;
  }
}
console.log(`  Total media processed: ${mediaCount}`);

// ── Add relationships (using compressed .jpg target names) ─────
console.log("\nAdding relationships...");
const newRels = PHOTOS
  .filter(p => docXml.includes(`r:embed="${p.rId}"`))
  .filter(p => !relsXml.includes(`Id="${p.rId}"`))
  .map(p => {
    const mediaNameBase = (p.mediaFile || p.file).replace(/\.[^.]+$/, ".jpg");
    return `<Relationship Id="${p.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaNameBase}"/>`;
  })
  .join("");
relsXml = relsXml.replace("</Relationships>", newRels + "</Relationships>");
fs.writeFileSync(relsPath, relsXml, "utf-8");
console.log(`  ✓ Relationships updated`);

// ── Validate ────────────────────────────────────────────────────
console.log("\nValidating...");
fs.writeFileSync(path.join(extractDir, "word", "document.xml"), docXml, "utf-8");
const openWp = (docXml.match(/<w:p[ >]/g) || []).length;
const closeWp = (docXml.match(/<\/w:p>/g) || []).length;
console.log(`  w:p open: ${openWp}  close: ${closeWp}`);
if (openWp !== closeWp) { console.error("  ✗ Mismatched <w:p> tags — aborting"); process.exit(1); }
console.log("  ✓ XML valid");

// Spot-check all rIds present
let allPresent = true;
for (const p of PHOTOS) {
  if (!docXml.includes(`r:embed="${p.rId}"`)) {
    console.warn(`  ✗ ${p.rId} missing from final XML`);
    allPresent = false;
  }
}
if (allPresent) console.log(`  ✓ All ${PHOTOS.length} photo rIds confirmed`);

// ── Repack ─────────────────────────────────────────────────────
console.log("\nRepacking...");
const newZip = path.join(WORK_DIR, "course7_restored.zip");
execSync(`powershell -Command "Compress-Archive -Path '${extractDir.replace(/\//g, "\\")}\\*' -DestinationPath '${newZip.replace(/\//g, "\\")}' -Force"`);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`Wrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, OUT_ROOT);
console.log(`Wrote: ${OUT_ROOT}`);
console.log(`Size: ${Math.round(fs.statSync(OUT_ROOT).size / 1024)} KB`);

// ── Clean up temp base file ────────────────────────────────────
fs.unlinkSync(SRC_DOCX);

console.log(`\nDone. ${insertedCount} photos restored from Course 7 folder.`);
