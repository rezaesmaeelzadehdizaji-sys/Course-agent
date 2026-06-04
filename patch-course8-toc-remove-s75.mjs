// patch-course8-toc-remove-s75.mjs
// Removes the "7.5 The biosecurity link" cached TOC entry from the SDT.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';
const ANCHOR = '7.5 The biosecurity link';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Find the SDT block ─────────────────────────────────────────────────
  const sdtStart = xml.indexOf('<w:sdt>');
  const sdtEnd   = xml.indexOf('</w:sdt>') + '</w:sdt>'.length;
  if (sdtStart < 0 || sdtEnd < 8) throw new Error('SDT not found');
  let sdt = xml.slice(sdtStart, sdtEnd);

  // ── 2. Find the TOC paragraph containing the anchor ──────────────────────
  const anchorIdx = sdt.indexOf(ANCHOR);
  if (anchorIdx < 0) throw new Error('TOC entry anchor not found in SDT');
  if (sdt.indexOf(ANCHOR, anchorIdx + 1) >= 0) throw new Error('TOC anchor not unique in SDT');

  // Walk back to find <w:p>
  let pStart = anchorIdx - 1;
  while (pStart >= 0) {
    if (sdt[pStart] === '<') {
      const tag = sdt.slice(pStart, sdt.indexOf('>', pStart) + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) break;
    }
    pStart--;
  }
  const pEnd = sdt.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
  if (pStart < 0 || pEnd < 6) throw new Error('Paragraph boundaries not found');

  const removed = sdt.slice(pStart, pEnd);
  console.log('  Removing TOC entry:', [...removed.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(m => m[1]).join(''));

  sdt = sdt.slice(0, pStart) + sdt.slice(pEnd);

  // ── 3. Splice patched SDT back into xml ───────────────────────────────────
  xml = xml.slice(0, sdtStart) + sdt + xml.slice(sdtEnd);

  // ── 4. SAX validation ─────────────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror    = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 5. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
