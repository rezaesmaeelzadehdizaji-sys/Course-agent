// patch-course8-replace-section2-photos.mjs
//
// 1. Delete Photo 2.1 (hatchery cabinet image + caption paragraph)
// 2. Rename Photo 2.2 caption → Photo 2.1
// 3. Replace Photo 2.3 image with Course 8/hatchery spray cabin.png
// 4. Update Photo 2.3 caption and docPr → Photo 2.2
//
// After this patch: Section 2 has two photos:
//   Photo 2.1 — vaccinator in full PPE in barn (was Photo 2.2)
//   Photo 2.2 — hatchery spray cabinet (was Photo 2.3, new image)

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE      = 'Course 8/Vaccination_draft.docx';
const NEW_IMAGE = 'Course 8/hatchery spray cabin.png';
const NEW_MEDIA = 'word/media/image16.png';

// Read PNG dimensions from IHDR (bytes 16-23: width uint32BE, height uint32BE)
function pngDims(buf) {
  const sig = buf.slice(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('Not a valid PNG file: ' + NEW_IMAGE);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { w, h };
}

// EMU conversion: 1 inch = 914400 EMU.
// Display width: match Photo 2.2 width (5305425 = ~5.8")
const DISPLAY_WIDTH_EMU = 5305425;

const NEW_CAPTION = 'Photo 2.2: A hatchery spray cabinet delivering coarse droplets over day-old chicks in a transport tray which gives uniform coverage on every bird before they leave the hatchery. Newly hatched chicks in a hatchery after spray vaccination, showing blue dye droplets on their heads and bodies. Source: CPC Short Courses.';

// SAX validation
function saxValidate(xml) {
  const parser = sax.parser(true);
  const stack = []; let stopped = false; let info = null;
  parser.onopentag = n => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = () => { if (!stopped) stack.pop(); };
  parser.onerror = e => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) throw new Error('XML INVALID: ' + JSON.stringify(info));
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);
}

// Walk back from `pos` to the nearest <w:p> or <w:p > tag (not <w:pPr> etc.)
function findParaStart(xml, pos) {
  let idx = xml.lastIndexOf('<w:p', pos);
  while (idx >= 0) {
    const tag5 = xml.slice(idx, idx + 5);
    if (tag5 === '<w:p>' || tag5 === '<w:p ') return idx;
    idx = xml.lastIndexOf('<w:p', idx - 1);
  }
  return -1;
}

async function run() {
  // ── Load new image ─────────────────────────────────────────────────────────
  if (!fs.existsSync(NEW_IMAGE)) throw new Error('New image not found: ' + NEW_IMAGE);
  const newImgBuf = fs.readFileSync(NEW_IMAGE);
  const { w: imgW, h: imgH } = pngDims(newImgBuf);
  const displayCY = Math.round(DISPLAY_WIDTH_EMU * imgH / imgW);
  console.log(`New image: ${imgW}×${imgH} px → display ${DISPLAY_WIDTH_EMU} × ${displayCY} EMU`);

  // ── Load docx ──────────────────────────────────────────────────────────────
  const zip  = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml    = await zip.file('word/document.xml').async('string');
  let rels   = await zip.file('word/_rels/document.xml.rels').async('string');

  // ──────────────────────────────────────────────────────────────────────────
  // Step 1: Delete Photo 2.1 (image paragraph + caption paragraph)
  // ──────────────────────────────────────────────────────────────────────────

  // Find image paragraph via rId14
  const rid14pos = xml.indexOf('r:embed="rId14"');
  if (rid14pos < 0) throw new Error('ANCHOR NOT FOUND: r:embed="rId14" (Photo 2.1 image)');
  const imgStart = findParaStart(xml, rid14pos);
  if (imgStart < 0) throw new Error('Could not locate <w:p> start for Photo 2.1 image paragraph');
  const imgEnd = xml.indexOf('</w:p>', rid14pos) + '</w:p>'.length;
  if (imgEnd < rid14pos) throw new Error('Could not locate </w:p> for Photo 2.1 image paragraph');
  console.log(`Photo 2.1 image para: ${imgStart}–${imgEnd}`);

  // Find caption paragraph via unique anchor text
  const capAnchor = 'Photo 2.1: A hatchery spray cabinet';
  const capHit = xml.indexOf(capAnchor, imgEnd);
  if (capHit < 0) throw new Error('ANCHOR NOT FOUND: Photo 2.1 caption text');
  if (capHit - imgEnd > 500) throw new Error(`Caption anchor too far from image para (${capHit - imgEnd} chars gap)`);
  const capStart = findParaStart(xml, capHit);
  if (capStart < 0) throw new Error('Could not locate <w:p> start for Photo 2.1 caption');
  const capEnd = xml.indexOf('</w:p>', capHit) + '</w:p>'.length;
  console.log(`Photo 2.1 caption para: ${capStart}–${capEnd}`);

  // Sanity: image para end === caption para start (adjacent paragraphs)
  if (imgEnd !== capStart) {
    console.warn(`  WARNING: image end (${imgEnd}) !== caption start (${capStart}) — gap of ${capStart - imgEnd} chars`);
  }

  // Delete both paragraphs at once
  xml = xml.slice(0, imgStart) + xml.slice(capEnd);
  console.log('OK Step 1: Photo 2.1 image paragraph and caption deleted');

  // ──────────────────────────────────────────────────────────────────────────
  // Step 2: Rename Photo 2.2 caption → Photo 2.1
  // ──────────────────────────────────────────────────────────────────────────

  const cap22anchor = 'Photo 2.2: A vaccinator in full PPE';
  if (!xml.includes(cap22anchor)) throw new Error('ANCHOR NOT FOUND: Photo 2.2 caption text');
  const cap22count = xml.split(cap22anchor).length - 1;
  if (cap22count > 1) throw new Error(`Photo 2.2 caption anchor not unique (${cap22count}×)`);
  xml = xml.split(cap22anchor).join('Photo 2.1: A vaccinator in full PPE');
  console.log('OK Step 2: Photo 2.2 caption renamed to Photo 2.1');

  // ──────────────────────────────────────────────────────────────────────────
  // Step 3: Update Photo 2.3 image reference, dimensions, and docPr
  // ──────────────────────────────────────────────────────────────────────────

  // 3a. Update rId27 relationship to point at new media file
  const rId27relOld = /(<Relationship Id="rId27"[^>]+Target=")[^"]+(")/;
  if (!rId27relOld.test(rels)) throw new Error('ANCHOR NOT FOUND: rId27 relationship in rels file');
  rels = rels.replace(rId27relOld, `$1media/image16.png$2`);
  console.log('OK Step 3a: rId27 relationship target updated to media/image16.png');

  // 3b. Embed new image binary
  zip.file(NEW_MEDIA, newImgBuf);
  console.log(`OK Step 3b: Embedded ${newImgBuf.length} bytes as ${NEW_MEDIA}`);

  // 3c. Update drawing dimensions (wp:extent and a:ext — both use same cx/cy)
  const OLD_CX = '5029200';
  const OLD_CY = '2830429';
  const NEW_CX = String(DISPLAY_WIDTH_EMU);
  const NEW_CY = String(displayCY);

  // wp:extent — unique to Photo 2.3 (Photo 2.2 has cx=5305425)
  const extentOld = `<wp:extent cx="${OLD_CX}" cy="${OLD_CY}"/>`;
  if (!xml.includes(extentOld)) throw new Error('ANCHOR NOT FOUND: Photo 2.3 wp:extent dimensions');
  const extentCount = xml.split(extentOld).length - 1;
  if (extentCount > 1) throw new Error(`wp:extent anchor not unique (${extentCount}×)`);
  xml = xml.split(extentOld).join(`<wp:extent cx="${NEW_CX}" cy="${NEW_CY}"/>`);
  console.log(`OK Step 3c: wp:extent updated ${OLD_CX}×${OLD_CY} → ${NEW_CX}×${NEW_CY}`);

  // a:ext — same dimensions, also unique to Photo 2.3
  const aextOld = `<a:ext cx="${OLD_CX}" cy="${OLD_CY}"/>`;
  if (!xml.includes(aextOld)) throw new Error('ANCHOR NOT FOUND: Photo 2.3 a:ext dimensions');
  xml = xml.split(aextOld).join(`<a:ext cx="${NEW_CX}" cy="${NEW_CY}"/>`);
  console.log(`OK Step 3c: a:ext updated`);

  // 3d. Update wp:docPr attributes (name and descr)
  const docPrOld = `<wp:docPr id="1586940449" name="Photo2_3" descr="Photo 2.3: Newly hatched chicks in a hatchery after spray vaccination, showing blue dye droplets on their heads and bodies. Source: CPC Short Courses."/>`;
  if (!xml.includes(docPrOld)) throw new Error('ANCHOR NOT FOUND: Photo 2.3 wp:docPr element');
  const escapedNewCaption = NEW_CAPTION.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const docPrNew = `<wp:docPr id="1586940449" name="Photo2_2" descr="${escapedNewCaption}"/>`;
  xml = xml.split(docPrOld).join(docPrNew);
  console.log('OK Step 3d: wp:docPr name and descr updated');

  // 3e. Update pic:cNvPr name attribute
  const cNvPrOld = `<pic:cNvPr id="1586940450" name="image_photo2_3_chicks_spray.png"/>`;
  if (!xml.includes(cNvPrOld)) throw new Error('ANCHOR NOT FOUND: Photo 2.3 pic:cNvPr element');
  xml = xml.split(cNvPrOld).join(`<pic:cNvPr id="1586940450" name="hatchery_spray_cabin.png"/>`);
  console.log('OK Step 3e: pic:cNvPr name updated');

  // ──────────────────────────────────────────────────────────────────────────
  // Step 4: Update Photo 2.3 caption text → Photo 2.2
  // ──────────────────────────────────────────────────────────────────────────

  const capOldText = 'Photo 2.3: Newly hatched chicks in a hatchery after spray vaccination, showing blue dye droplets on their heads and bodies. Source: CPC Short Courses.';
  if (!xml.includes(capOldText)) throw new Error('ANCHOR NOT FOUND: Photo 2.3 caption text in <w:t>');
  const capTextCount = xml.split(capOldText).length - 1;
  if (capTextCount > 1) throw new Error(`Caption text not unique (${capTextCount}×)`);
  xml = xml.split(capOldText).join(NEW_CAPTION);
  console.log('OK Step 4: Photo 2.3 caption text updated to Photo 2.2');

  // ──────────────────────────────────────────────────────────────────────────
  // SAX validation
  // ──────────────────────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  // Verify no "Photo 2.1" image references remain (rId14 should be gone)
  if (xml.includes('rId14')) throw new Error('FAIL: rId14 still present in document XML after deletion');
  // Verify "Photo 2.3" label is gone from body text (docPr descr is an attribute, OK to have it updated)
  const capLabelMatches = [...xml.matchAll(/<w:t[^>]*>[^<]*Photo 2\.3[^<]*<\/w:t>/g)];
  if (capLabelMatches.length > 0) {
    console.warn(`  WARNING: "Photo 2.3" still appears in ${capLabelMatches.length} <w:t> element(s)`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Write output
  // ──────────────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  zip.file('word/_rels/document.xml.rels', rels);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\nDone. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log('\nPhoto renumbering summary:');
  console.log('  Deleted: Photo 2.1 (old hatchery cabinet diagram)');
  console.log('  Photo 2.2 → Photo 2.1 (PPE vaccinator in barn)');
  console.log('  Photo 2.3 → Photo 2.2 (new hatchery spray cabin image)');
}

run().catch(e => { console.error(e); process.exit(1); });
