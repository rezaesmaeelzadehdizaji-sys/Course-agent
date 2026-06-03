// patch-course8-summary-fix.mjs
// patch-course8-summary-s7.mjs used `lastIndexOf('<w:p', anchorIdx)` to find the
// "Important Notes" paragraph start — but lastIndexOf matched <w:pBdr> (which
// also starts with <w:p) instead of the real <w:p> opener. As a result, the
// entire Section 7 block was injected INSIDE the Important Notes <w:pPr>,
// making all of Section 7 schema-children of Important Notes' pPr.
//
// SAX validates well-formed XML, but Word rejects this schema violation
// ("Word experienced an error trying to open the file").
//
// Fix: move the Important Notes <w:p><w:pPr> openers from before Section 7
// to right before the Important Notes <w:pBdr> (which is its proper position).

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Summary_Page_Course8_Vaccination.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Remove orphan <w:p><w:pPr> that was the Important Notes opener
  //       (currently sitting before Section 7 H1) ────────────────────────────
  const ORPHAN_PATTERN = '</w:p><w:p><w:pPr><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="4"/></w:pBdr><w:spacing w:after="120" w:before="320"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr><w:t xml:space="preserve">Section 7';
  const ORPHAN_FIX     = '</w:p><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="4"/></w:pBdr><w:spacing w:after="120" w:before="320"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr><w:t xml:space="preserve">Section 7';
  if (!xml.includes(ORPHAN_PATTERN)) throw new Error('Orphan opener pattern not found before Section 7 H1');
  xml = xml.replace(ORPHAN_PATTERN, ORPHAN_FIX);
  console.log('  Step 1: removed orphan <w:p><w:pPr> before Section 7 H1');

  // ── 2. Insert proper <w:p><w:pPr> before the Important Notes <w:pBdr> ────
  const IN_PATTERN = 'between flocks.</w:t></w:r></w:p><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="2"/></w:pBdr><w:spacing w:after="80" w:before="200"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">Important Notes';
  const IN_FIX     = 'between flocks.</w:t></w:r></w:p><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="2"/></w:pBdr><w:spacing w:after="80" w:before="200"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">Important Notes';
  if (!xml.includes(IN_PATTERN)) throw new Error('Important Notes header pattern not found');
  xml = xml.replace(IN_PATTERN, IN_FIX);
  console.log('  Step 2: inserted <w:p><w:pPr> before Important Notes <w:pBdr>');

  // ── 3. Strict SAX validation ─────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag  = (n) => {
    if (stopped) return;
    if (n.name === 'w:p') {
      const inP = stack.includes('w:p');
      const inPPr = stack.includes('w:pPr');
      if (inP || inPPr) { stopped = true; info = { issue: 'w:p inside p/pPr', pos: parser.position, stack: stack.slice(-8) }; return; }
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror    = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch(e) {}
  if (info) {
    console.error('  XML STILL INVALID:', info);
    const p = info.pos || 0;
    console.error('  Context:', JSON.stringify(xml.slice(Math.max(0,p-150), p+150)));
    throw new Error('Validation failed after fix');
  }
  if (stack.length !== 0) {
    console.error('  Stack not empty:', stack);
    throw new Error('Unclosed tags after fix');
  }
  console.log('  Step 3: strict SAX + schema-nesting validation: PASS');

  // ── 4. Verify no unescaped & ─────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 5. Write ─────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length/1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
