/**
 * fix-course7-formatting.js
 *
 * Applies six fixes to the Course 7 pre-built docx:
 *  1. Convert bulleted BodyText disease-title paragraphs → Heading2
 *  2. Remove "IBV" from the cross-species photo caption
 *  3. Remove bullets from explanation paragraphs inside Section 8
 *  4. Delete "Learning Objectives" and "Notes for Participants" H1 sections
 *  5. Remove blank second page (empty paragraphs between cover and TOC)
 *  6. Remove <w:updateFields/> from settings.xml (suppress Word's update dialog)
 *
 * Run: node dashboard/scripts/fix-course7-formatting.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Paths ─────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "../../");
const SRC_DOCX = path.resolve(
  ROOT,
  "7-Common Poultry Diseases \u2014 Practical Training for Farmers.docx"
);
const OUT_DASHBOARD = path.resolve(
  __dirname,
  "../public/docs/course-07-common-poultry-diseases.docx"
);
const WORK_DIR = path.join(os.tmpdir(), "course7_fix2");

// ── Helpers ───────────────────────────────────────────────────

/** Return [{pStart, pEnd, text, style, hasBullet}] for every paragraph */
function parseParagraphs(xml) {
  const paras = [];
  let pos = 0;
  while (pos < xml.length) {
    const pStart = xml.indexOf("<w:p>", pos);
    const pStartAttr = xml.indexOf("<w:p ", pos);
    let s = -1;
    if (pStart >= 0 && pStartAttr >= 0) s = Math.min(pStart, pStartAttr);
    else if (pStart >= 0) s = pStart;
    else if (pStartAttr >= 0) s = pStartAttr;
    if (s < 0) break;

    const e = xml.indexOf("</w:p>", s) + 6;
    const para = xml.slice(s, e);
    const texts = (para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map(
      (t) => t.replace(/<[^>]+>/g, "")
    );
    const text = texts.join("").trim();
    const styleM = para.match(/w:val="(Heading\d|BodyText|[^"]+)"/);
    const style = styleM ? styleM[1] : "";
    const hasBullet = para.includes("<w:numPr>");
    paras.push({ pStart: s, pEnd: e, text, style, hasBullet });
    pos = e;
  }
  return paras;
}

/** Convert a BodyText+bullet paragraph's pPr to Heading2 (remove numPr) */
function convertToHeading2(pPr) {
  // Replace style value
  let result = pPr.replace(
    /w:val="BodyText"/g,
    'w:val="Heading2"'
  );
  // Remove numPr block
  result = result.replace(/<w:numPr>[\s\S]*?<\/w:numPr>/g, "");
  // Remove any bold/italic rPr overrides that duplicate heading style
  return result;
}

/** Remove numPr from a paragraph's pPr */
function removeBullet(pPr) {
  return pPr.replace(/<w:numPr>[\s\S]*?<\/w:numPr>/g, "");
}

// ── Main ──────────────────────────────────────────────────────
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

let xml = fs.readFileSync(
  path.join(extractDir, "word", "document.xml"),
  "utf-8"
);

// ────────────────────────────────────────────────────────────
// FIX 1: Convert bulleted BodyText disease-title lines → Heading2
// Any BodyText + <w:numPr> paragraph whose text ends with ":"
// ────────────────────────────────────────────────────────────
console.log("\nFix 1: Converting disease title headings to Heading2...");
let fix1Count = 0;

// Walk paragraphs and replace pPr inline
let workXml = xml;
let searchPos = 0;
while (searchPos < workXml.length) {
  const pStart =
    workXml.indexOf("<w:p>", searchPos) >= 0 &&
    workXml.indexOf("<w:p ", searchPos) >= 0
      ? Math.min(
          workXml.indexOf("<w:p>", searchPos),
          workXml.indexOf("<w:p ", searchPos)
        )
      : workXml.indexOf("<w:p>", searchPos) >= 0
      ? workXml.indexOf("<w:p>", searchPos)
      : workXml.indexOf("<w:p ", searchPos);

  if (pStart < 0) break;

  const pEnd = workXml.indexOf("</w:p>", pStart) + 6;
  const para = workXml.slice(pStart, pEnd);

  const isBodyText = para.includes('w:val="BodyText"');
  const hasBullet = para.includes("<w:numPr>");
  const texts = (para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map((t) =>
    t.replace(/<[^>]+>/g, "")
  );
  const text = texts.join("").trim();

  // Only short lines are disease titles (< 80 chars); longer ones are body sentences ending in ":"
  if (isBodyText && hasBullet && text.endsWith(":") && text.length < 80) {
    // Replace pPr block
    const pPrMatch = para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/);
    if (pPrMatch) {
      const newPPr = convertToHeading2(pPrMatch[0]);
      const newPara = para.replace(pPrMatch[0], newPPr);
      workXml =
        workXml.slice(0, pStart) + newPara + workXml.slice(pEnd);
      console.log(`  ✓ → Heading2: "${text.slice(0, 60)}"`);
      fix1Count++;
      searchPos = pStart + newPara.length;
      continue;
    }
  }

  searchPos = pEnd;
}
console.log(`  Total converted: ${fix1Count}`);
xml = workXml;

// ────────────────────────────────────────────────────────────
// FIX 2: Remove "IBV" from cross-species photo caption
// ────────────────────────────────────────────────────────────
console.log("\nFix 2: Fixing cross-species photo caption...");
const badCaption =
  "CRD and IBV can spread across species";
const goodCaption =
  "CRD can spread across species";
if (xml.includes(badCaption)) {
  xml = xml.replace(badCaption, goodCaption);
  console.log("  ✓ Removed IBV from cross-species caption");
} else {
  // Try alternate escaping
  const badCaption2 = "CRD and IBV can spread";
  if (xml.includes(badCaption2)) {
    xml = xml.replace(badCaption2, "CRD can spread");
    console.log("  ✓ Removed IBV from cross-species caption (alt match)");
  } else {
    console.warn("  ✗ Caption text not found — check manually");
  }
}

// ────────────────────────────────────────────────────────────
// FIX 3: Remove bullets from explanation paragraphs in Section 8
// Section 8 = "8. Cross-Species Disease Concerns" (pos ~65684)
// Everything from that H1 to the next H1 ("9. Practical Disease Prevention")
// ────────────────────────────────────────────────────────────
console.log("\nFix 3: Removing bullets from Section 8 explanation paragraphs...");

function findH1Bounds(xml, searchText) {
  let pos = 0;
  while (pos < xml.length) {
    const s = xml.indexOf("<w:p>", pos) >= 0 && xml.indexOf("<w:p ", pos) >= 0
      ? Math.min(xml.indexOf("<w:p>", pos), xml.indexOf("<w:p ", pos))
      : xml.indexOf("<w:p>", pos) >= 0 ? xml.indexOf("<w:p>", pos)
      : xml.indexOf("<w:p ", pos);
    if (s < 0) break;
    const e = xml.indexOf("</w:p>", s) + 6;
    const para = xml.slice(s, e);
    if (para.includes("Heading1") && para.includes(searchText)) {
      return { start: s, end: e };
    }
    pos = e;
  }
  return null;
}

const sec8 = findH1Bounds(xml, "Cross-Species");
const sec9 = findH1Bounds(xml, "Practical Disease Prevention");

if (sec8 && sec9) {
  // Extract section 8 content (between sec8.end and sec9.start)
  const before = xml.slice(0, sec8.end);
  let sec8Content = xml.slice(sec8.end, sec9.start);
  const after = xml.slice(sec9.start);

  // Within sec8Content, remove numPr from BodyText paragraphs that do NOT end with ":"
  let sec8Fixed = "";
  let sp = 0;
  let removedCount = 0;
  while (sp < sec8Content.length) {
    const pS =
      sec8Content.indexOf("<w:p>", sp) >= 0 &&
      sec8Content.indexOf("<w:p ", sp) >= 0
        ? Math.min(
            sec8Content.indexOf("<w:p>", sp),
            sec8Content.indexOf("<w:p ", sp)
          )
        : sec8Content.indexOf("<w:p>", sp) >= 0
        ? sec8Content.indexOf("<w:p>", sp)
        : sec8Content.indexOf("<w:p ", sp);

    if (pS < 0) {
      sec8Fixed += sec8Content.slice(sp);
      break;
    }

    const pE = sec8Content.indexOf("</w:p>", pS) + 6;
    const para = sec8Content.slice(pS, pE);
    const isBodyText = para.includes('w:val="BodyText"');
    const hasBullet = para.includes("<w:numPr>");
    const texts = (para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map(
      (t) => t.replace(/<[^>]+>/g, "")
    );
    const text = texts.join("").trim();

    // After Fix 1, titles are now Heading2. Only BodyText+bullet paragraphs
    // that do NOT end with ":" are explanation paragraphs → remove bullet
    if (isBodyText && hasBullet && !text.endsWith(":")) {
      const pPrMatch = para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/);
      if (pPrMatch) {
        const newPPr = removeBullet(pPrMatch[0]);
        const newPara = para.replace(pPrMatch[0], newPPr);
        sec8Fixed += sec8Content.slice(sp, pS) + newPara;
        sp = pE;
        removedCount++;
        continue;
      }
    }

    sec8Fixed += sec8Content.slice(sp, pE);
    sp = pE;
  }

  xml = before + sec8Fixed + after;
  console.log(`  ✓ Removed bullets from ${removedCount} explanation paragraph(s) in Section 8`);
} else {
  console.warn(`  ✗ Could not locate Section 8 bounds`);
}

// ────────────────────────────────────────────────────────────
// FIX 4: Delete "Learning Objectives" and "Notes for Participants" sections
// ────────────────────────────────────────────────────────────
console.log("\nFix 4: Deleting Learning Objectives and Notes for Participants...");

function deleteH1Section(xml, sectionSearchText, nextSectionSearchText) {
  const sec = findH1Bounds(xml, sectionSearchText);
  if (!sec) {
    console.warn(`  ✗ Section "${sectionSearchText}" not found`);
    return xml;
  }
  const next = findH1Bounds(xml, nextSectionSearchText);
  if (!next) {
    console.warn(`  ✗ Next section "${nextSectionSearchText}" not found`);
    return xml;
  }
  const deleted = xml.slice(sec.start, next.start);
  const charCount = deleted.length;
  console.log(
    `  ✓ Deleted "${sectionSearchText}" section (${charCount} chars, up to "${nextSectionSearchText}")`
  );
  return xml.slice(0, sec.start) + xml.slice(next.start);
}

// Delete "Learning Objectives" (next is "Notes for Participants")
xml = deleteH1Section(xml, "Learning Objectives", "Notes for Participants");
// Delete "Notes for Participants" (next is "Where to Keep Learning")
xml = deleteH1Section(xml, "Notes for Participants", "Where to Keep Learning");

// ────────────────────────────────────────────────────────────
// FIX 5: Remove blank second page
// The blank page is caused by extra empty paragraphs between the cover
// and the TOC. Find them and remove.
// Cover ends somewhere before the TOC H1 (~pos 5959 in original).
// After Fix 4 positions shifted, so use text anchors.
// ────────────────────────────────────────────────────────────
console.log("\nFix 5: Removing blank second page...");

// Find the cover page end: the last non-empty paragraph before TOC H1
const tocBounds = findH1Bounds(xml, "Table of Contents");
if (tocBounds) {
  // Look at all paragraphs between start of body and TOC H1
  // The cover has: logo, title text, sub-title, course badge, date
  // Then there may be empty paragraphs creating the blank page
  // Strategy: find the last paragraph with actual text before TOC,
  // then remove any empty/near-empty paragraphs between it and TOC.

  // Find where the body starts (<w:body>)
  const bodyStart = xml.indexOf("<w:body>") + 8;

  // Collect all paragraphs before TOC
  let coverParas = [];
  let sp = bodyStart;
  while (sp < tocBounds.start) {
    const pS =
      xml.indexOf("<w:p>", sp) >= 0 && xml.indexOf("<w:p ", sp) >= 0
        ? Math.min(xml.indexOf("<w:p>", sp), xml.indexOf("<w:p ", sp))
        : xml.indexOf("<w:p>", sp) >= 0
        ? xml.indexOf("<w:p>", sp)
        : xml.indexOf("<w:p ", sp);
    if (pS < 0 || pS >= tocBounds.start) break;
    const pE = xml.indexOf("</w:p>", pS) + 6;
    if (pE > tocBounds.start) break;
    const para = xml.slice(pS, pE);
    const texts = (para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map(
      (t) => t.replace(/<[^>]+>/g, "")
    );
    const text = texts.join("").trim();
    const hasPageBreak = para.includes("w:pageBreakBefore") ||
                         para.includes("w:type=\"page\"") ||
                         para.includes("w:val=\"page\"");
    coverParas.push({ pS, pE, text, hasPageBreak });
    sp = pE;
  }

  // Find all paragraphs that are empty AND follow a page break
  // The blank page is a set of empty paragraphs after a page-break paragraph
  // Remove empty paragraphs that appear after a page break and before TOC
  let pageBreakSeen = false;
  let toRemove = [];
  for (const p of coverParas) {
    if (p.hasPageBreak) {
      pageBreakSeen = true;
    } else if (pageBreakSeen && p.text === "") {
      toRemove.push({ start: p.pS, end: p.pE });
    } else if (pageBreakSeen && p.text !== "") {
      pageBreakSeen = false; // content after break, not blank page
    }
  }

  if (toRemove.length > 0) {
    // Remove from last to first to preserve positions
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const { start, end } = toRemove[i];
      xml = xml.slice(0, start) + xml.slice(end);
    }
    console.log(`  ✓ Removed ${toRemove.length} blank paragraph(s) creating the blank page`);
  } else {
    // Alternative: look for <w:br w:type="page"/> and remove extra empty paras
    // that follow it within cover page region
    const pageBreakTag = 'w:type="page"';
    const pbPos = xml.indexOf(pageBreakTag);
    if (pbPos > 0 && pbPos < tocBounds.start) {
      // Find the paragraph containing the page break
      const pbParaEnd = xml.indexOf("</w:p>", pbPos) + 6;
      // Remove empty paragraphs between pbParaEnd and TOC
      let removeStart = pbParaEnd;
      let removeCount = 0;
      while (removeStart < tocBounds.start) {
        const nextP =
          xml.indexOf("<w:p>", removeStart) >= 0 &&
          xml.indexOf("<w:p ", removeStart) >= 0
            ? Math.min(
                xml.indexOf("<w:p>", removeStart),
                xml.indexOf("<w:p ", removeStart)
              )
            : xml.indexOf("<w:p>", removeStart) >= 0
            ? xml.indexOf("<w:p>", removeStart)
            : xml.indexOf("<w:p ", removeStart);
        if (nextP < 0 || nextP >= tocBounds.start) break;
        const nextPEnd = xml.indexOf("</w:p>", nextP) + 6;
        const para = xml.slice(nextP, nextPEnd);
        const texts = (para.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map(
          (t) => t.replace(/<[^>]+>/g, "")
        );
        const text = texts.join("").trim();
        if (text === "") {
          xml = xml.slice(0, nextP) + xml.slice(nextPEnd);
          removeCount++;
          // don't advance removeStart — the next para is now at nextP
        } else {
          removeStart = nextPEnd;
        }
      }
      if (removeCount > 0) {
        console.log(`  ✓ Removed ${removeCount} blank paragraph(s) after page break`);
      } else {
        console.log("  ℹ No blank paragraphs found near page break — blank page may be from section break");
      }
    } else {
      console.log("  ℹ No page break found before TOC — skipping blank page fix");
    }
  }
} else {
  console.warn("  ✗ TOC heading not found");
}

// ────────────────────────────────────────────────────────────
// Validate paragraph balance
// ────────────────────────────────────────────────────────────
const openCount = (xml.match(/<w:p[ >]/g) || []).length;
const closeCount = (xml.match(/<\/w:p>/g) || []).length;
console.log(`\nXML validation: <w:p> open=${openCount} close=${closeCount}`);
if (openCount !== closeCount) {
  console.error("  ✗ Mismatched <w:p> tags — aborting");
  process.exit(1);
}
console.log("  ✓ Paragraph tags balanced");

// Write document.xml
fs.writeFileSync(
  path.join(extractDir, "word", "document.xml"),
  xml,
  "utf-8"
);

// ────────────────────────────────────────────────────────────
// FIX 6: Remove <w:updateFields/> from settings.xml
// ────────────────────────────────────────────────────────────
console.log("\nFix 6: Suppressing Word update-fields dialog...");
const settingsPath = path.join(extractDir, "word", "settings.xml");
let settings = fs.readFileSync(settingsPath, "utf-8");
if (settings.includes("<w:updateFields/>") || settings.includes("<w:updateFields />")) {
  settings = settings
    .replace(/<w:updateFields\/>/g, "")
    .replace(/<w:updateFields \/>/g, "");
  fs.writeFileSync(settingsPath, settings, "utf-8");
  console.log("  ✓ Removed <w:updateFields/> — no dialog on open");
} else {
  console.log("  ℹ <w:updateFields/> not found (already removed or absent)");
}

// ────────────────────────────────────────────────────────────
// Repack
// ────────────────────────────────────────────────────────────
console.log("\nRepacking docx...");
const newZip = path.join(WORK_DIR, "course7_fixed.zip");
const newZipWin = newZip.replace(/\//g, "\\");
execSync(
  `powershell -Command "Compress-Archive -Path '${extractWin}\\*' -DestinationPath '${newZipWin}' -Force"`
);

fs.copyFileSync(newZip, OUT_DASHBOARD);
console.log(`\nWrote: ${OUT_DASHBOARD}`);
fs.copyFileSync(newZip, SRC_DOCX);
console.log(`Wrote: ${SRC_DOCX}`);
const sizeMB = (fs.statSync(SRC_DOCX).size / (1024 * 1024)).toFixed(1);
console.log(`\nDone. File size: ${sizeMB} MB`);
