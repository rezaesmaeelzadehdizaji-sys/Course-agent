// patch-course8-add-ndv-photo.mjs
// Inserts Photo 1.4 (NDV conjunctivitis in a human eye) into §1 of Course 8.
// The photo goes immediately after the PPE warning sentence that ends §1 personal-safety bullet.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE      = 'Course 8/Vaccination_draft.docx';
const PHOTO_SRC = 'Course 8/conjunctivitis due to the NDV vaccine contatct.jpg';
const NEW_RID   = 'rId28';
const NEW_MEDIA = 'word/media/image15.jpg';
const DOC_PR_ID = '1586940450';   // one higher than existing max
// Image is 300×399 px (portrait). Display at 2.5" wide, proportional height.
const IMG_CX    = '2286000';      // 2.5 inches in EMU
const IMG_CY    = '3040380';      // 2,286,000 × (399/300)

// Anchor: end of the paragraph that contains the NDV eye-protection warning
const ANCHOR_END = 'without eye protection.</w:t></w:r></w:p>';

const CAPTION = 'Photo 1.4: Conjunctivitis in a human eye following contact with a live Newcastle Disease Virus (NDV) vaccine. Source: CPC Short Courses.';

function imageParagraph() {
  return (
    '<w:p>' +
      '<w:pPr><w:spacing w:after="120"/><w:jc w:val="center"/></w:pPr>' +
      '<w:r><w:rPr><w:noProof/></w:rPr>' +
        '<w:drawing>' +
          '<wp:inline distT="0" distB="0" distL="0" distR="0">' +
            `<wp:extent cx="${IMG_CX}" cy="${IMG_CY}"/>` +
            '<wp:effectExtent l="0" t="0" r="0" b="0"/>' +
            `<wp:docPr id="${DOC_PR_ID}" name="Photo 1.4"/>` +
            '<wp:cNvGraphicFramePr>' +
              '<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>' +
            '</wp:cNvGraphicFramePr>' +
            '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
              '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
                '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
                  '<pic:nvPicPr>' +
                    '<pic:cNvPr id="0" name=""/>' +
                    '<pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr>' +
                  '</pic:nvPicPr>' +
                  '<pic:blipFill>' +
                    `<a:blip r:embed="${NEW_RID}"/>` +
                    '<a:srcRect/>' +
                    '<a:stretch><a:fillRect/></a:stretch>' +
                  '</pic:blipFill>' +
                  '<pic:spPr bwMode="auto">' +
                    '<a:xfrm><a:off x="0" y="0"/>' +
                      `<a:ext cx="${IMG_CX}" cy="${IMG_CY}"/>` +
                    '</a:xfrm>' +
                    '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>' +
                  '</pic:spPr>' +
                '</pic:pic>' +
              '</a:graphicData>' +
            '</a:graphic>' +
          '</wp:inline>' +
        '</w:drawing>' +
      '</w:r>' +
    '</w:p>'
  );
}

function captionParagraph(text) {
  return (
    '<w:p>' +
      '<w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr>' +
      '<w:r>' +
        '<w:rPr><w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>' +
        `<w:t>${text}</w:t>` +
      '</w:r>' +
    '</w:p>'
  );
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml  = await zip.file('word/document.xml').async('string');
  let rels = await zip.file('word/_rels/document.xml.rels').async('string');

  // ── Verify anchor ──────────────────────────────────────────────────────────
  const anchorCount = xml.split(ANCHOR_END).length - 1;
  if (anchorCount === 0) throw new Error('ANCHOR NOT FOUND: ' + ANCHOR_END.slice(0, 70));
  if (anchorCount > 1)   throw new Error(`ANCHOR NOT UNIQUE (${anchorCount}x)`);

  // ── Insert image + caption paragraphs after anchor paragraph ───────────────
  const insertAt = xml.indexOf(ANCHOR_END) + ANCHOR_END.length;
  xml = xml.slice(0, insertAt) + imageParagraph() + captionParagraph(CAPTION) + xml.slice(insertAt);
  console.log('OK: Inserted image paragraph and caption');

  // ── Add relationship ────────────────────────────────────────────────────────
  if (rels.includes(NEW_RID)) throw new Error(NEW_RID + ' already exists in rels file');
  const newRel = `<Relationship Id="${NEW_RID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image15.jpg"/>`;
  rels = rels.replace('</Relationships>', newRel + '</Relationships>');
  console.log('OK: Added relationship ' + NEW_RID + ' → media/image15.jpg');

  // ── Embed image binary ─────────────────────────────────────────────────────
  const photoBuf = fs.readFileSync(PHOTO_SRC);
  zip.file(NEW_MEDIA, photoBuf);
  console.log('OK: Embedded image (' + photoBuf.length + ' bytes) as ' + NEW_MEDIA);

  // ── Update zip entries ─────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  zip.file('word/_rels/document.xml.rels', rels);

  // ── SAX validation ─────────────────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack  = [];
  let stopped  = false;
  let info     = null;
  parser.onopentag = n => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = () => { if (!stopped) stack.pop(); };
  parser.onerror    = e => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('\nSAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── Write output ───────────────────────────────────────────────────────────
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\nDone. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
