// patch-course8-fix-orphan-wp.mjs
// Fix: two earlier patches inserted new <w:p> paragraphs without removing the
// original <w:p> opening tag, leaving orphan openers that Word rejects.
//
// Orphan 1: before CPC paragraph in Introduction
//   ...veterinary advice.</w:t></w:r></w:p><w:p><w:p><w:pPr>...CPC text...</w:p>
//   Extra <w:p> after the </w:p> needs to be removed.
//
// Orphan 2: before Photo 4.3 caption
//   <w:p w14:paraId="63BB7E2E" ...><w:p><w:pPr>...Photo 4.3...</w:p>
//   The w14-decorated <w:p ...> opener needs to be removed.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Orphan 1: CPC paragraph extra opener ──────────────────────────────────
  const ORPHAN1 = 'They are not a substitute for veterinary advice.</w:t></w:r></w:p><w:p><w:p><w:pPr><w:spacing w:after="160"';
  const FIX1    = 'They are not a substitute for veterinary advice.</w:t></w:r></w:p><w:p><w:pPr><w:spacing w:after="160"';
  if (!xml.includes(ORPHAN1)) throw new Error('Orphan 1 anchor (CPC paragraph) not found');
  xml = xml.replace(ORPHAN1, FIX1);
  console.log('  Fixed orphan 1: removed extra <w:p> before CPC paragraph');

  // ── Orphan 2: Photo 4.3 caption decorated opener ──────────────────────────
  const ORPHAN2 = '<w:p w14:paraId="63BB7E2E" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:p><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">Photo 4.3:';
  const FIX2    = '<w:p><w:pPr><w:spacing w:after="240"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:iCs/><w:color w:val="555555"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">Photo 4.3:';
  if (!xml.includes(ORPHAN2)) throw new Error('Orphan 2 anchor (Photo 4.3 decorated opener) not found');
  xml = xml.replace(ORPHAN2, FIX2);
  console.log('  Fixed orphan 2: removed decorated <w:p ...> opener before Photo 4.3 caption');

  // ── Validate XML with strict SAX ─────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let mismatchInfo = null;
  parser.onopentag  = (n) => { if (!stopped) stack.push(n.name); };
  parser.onclosetag = (n) => {
    if (stopped) return;
    if (stack[stack.length-1] !== n) {
      stopped = true;
      mismatchInfo = { closing: n, top: stack[stack.length-1], pos: parser.position };
    } else stack.pop();
  };
  parser.onerror = (e) => {
    if (!stopped) { stopped = true; mismatchInfo = { err: e.message, pos: parser.position }; }
  };
  try { parser.write(xml).close(); } catch(e) {}
  if (mismatchInfo) {
    console.error('  XML STILL INVALID:', mismatchInfo);
    const p = mismatchInfo.pos;
    console.error('  Context:', JSON.stringify(xml.slice(Math.max(0,p-200), p+200)));
    throw new Error('XML validation failed after fix');
  }
  if (stack.length !== 0) {
    console.error('  Unclosed tags remain at end:', stack);
    throw new Error('Unclosed tags after fix');
  }
  console.log('  Strict SAX validation: PASS (all tags balanced)');

  // ── Unescaped & check ────────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── Write ────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length/1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
