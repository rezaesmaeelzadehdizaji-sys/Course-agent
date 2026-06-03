// add-photo2-3-course8.mjs
// Embeds Photo 2.3 (chicks after spray vaccination) into Course 8 docx
// right after: "The key monitoring steps are before and after the run, not during it."

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC       = 'Course 8/Vaccination_draft.docx';
const OUT       = 'Course 8/Vaccination_draft.docx';
const IMG_SRC   = 'Course 8/chicks after spary vaccination.png';
const IMG_MEDIA = 'image_photo2_3_chicks_spray.png';
const CAPTION   = 'Photo 2.3: Newly hatched chicks in a hatchery after spray vaccination, showing blue dye droplets on their heads and bodies. Source: CPC Short Courses.';
const ANCHOR    = 'The key monitoring steps are before and after the run, not during it.';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Image dimensions ──────────────────────────────────────────────────────
  const imgBuf = fs.readFileSync(IMG_SRC);
  const pxW    = imgBuf.readUInt32BE(16);
  const pxH    = imgBuf.readUInt32BE(20);
  const wEmu   = Math.round(5.5 * 914400);                 // 5.5 inches wide
  const hEmu   = Math.round(wEmu * (pxH / pxW));
  console.log(`  Image: ${pxW}×${pxH}px → ${(wEmu/914400).toFixed(2)}"×${(hEmu/914400).toFixed(2)}"`);
  zip.file(`word/media/${IMG_MEDIA}`, imgBuf);

  // ── Relationship ──────────────────────────────────────────────────────────
  let relsXml = await zip.file('word/_rels/document.xml.rels').async('string');
  const usedRIds = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map(m => +m[1]);
  const rId = `rId${Math.max(0, ...usedRIds) + 1}`;
  relsXml = relsXml.replace(
    '</Relationships>',
    `<Relationship Id="${rId}" ` +
    `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" ` +
    `Target="media/${IMG_MEDIA}"/></Relationships>`
  );
  zip.file('word/_rels/document.xml.rels', relsXml);
  console.log(`  Relationship: ${rId}`);

  // ── Next docPr ID ─────────────────────────────────────────────────────────
  const usedDpIds = [...xml.matchAll(/\bdocPr\b[^>]*\bid="(\d+)"/g)].map(m => +m[1]);
  const dpId = Math.max(0, ...usedDpIds) + 1;
  console.log(`  docPr id: ${dpId}`);

  // ── Image paragraph ───────────────────────────────────────────────────────
  const imgParaXml =
    `<w:p>` +
    `<w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="60"/></w:pPr>` +
    `<w:r><w:drawing>` +
    `<wp:inline distT="0" distB="0" distL="0" distR="0">` +
    `<wp:extent cx="${wEmu}" cy="${hEmu}"/>` +
    `<wp:effectExtent l="0" t="0" r="0" b="0"/>` +
    `<wp:docPr id="${dpId}" name="Photo2_3" descr="${esc(CAPTION)}"/>` +
    `<wp:cNvGraphicFramePr>` +
    `<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>` +
    `</wp:cNvGraphicFramePr>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
    `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:nvPicPr>` +
    `<pic:cNvPr id="${dpId + 1}" name="${IMG_MEDIA}"/>` +
    `<pic:cNvPicPr/>` +
    `</pic:nvPicPr>` +
    `<pic:blipFill>` +
    `<a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>` +
    `<a:stretch><a:fillRect/></a:stretch>` +
    `</pic:blipFill>` +
    `<pic:spPr>` +
    `<a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `</pic:spPr>` +
    `</pic:pic></a:graphicData></a:graphic>` +
    `</wp:inline></w:drawing></w:r></w:p>`;

  // ── Caption paragraph ─────────────────────────────────────────────────────
  const captionXml =
    `<w:p>` +
    `<w:pPr><w:jc w:val="center"/><w:spacing w:before="40" w:after="240"/></w:pPr>` +
    `<w:r><w:rPr>` +
    `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>` +
    `<w:i/><w:iCs/>` +
    `<w:color w:val="595959"/>` +
    `<w:sz w:val="18"/><w:szCs w:val="18"/>` +
    `</w:rPr>` +
    `<w:t xml:space="preserve">${esc(CAPTION)}</w:t>` +
    `</w:r></w:p>`;

  // ── Find anchor and insert ─────────────────────────────────────────────────
  const anchorIdx = xml.indexOf(ANCHOR);
  if (anchorIdx < 0) throw new Error(`Anchor not found: "${ANCHOR}"`);
  const paraEnd = xml.indexOf('</w:p>', anchorIdx) + 6;
  console.log(`  Anchor at ${anchorIdx}, inserting at ${paraEnd}`);

  xml = xml.slice(0, paraEnd) + imgParaXml + captionXml + xml.slice(paraEnd);

  // ── Validate ──────────────────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} found`);

  // ── Write ─────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
