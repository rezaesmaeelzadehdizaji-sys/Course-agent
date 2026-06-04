// patch-course8-remove-s75.mjs
// Removes Section 7.5 heading and its single body paragraph entirely.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const HEADING_ANCHOR = '7.5 The biosecurity link';
const BODY_ANCHOR    = 'Post-vaccination reactions are worse in barns with poor litter management and inadequate biosecurity.';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Remove heading paragraph (Heading2 occurrence, not the TOC entry) ───
  let searchPos = 0, hStart = -1, hEnd = -1;
  while (true) {
    const hIdx = xml.indexOf(HEADING_ANCHOR, searchPos);
    if (hIdx < 0) throw new Error('7.5 heading anchor not found');
    // Walk back to find the enclosing <w:p>
    let pStart = hIdx - 1;
    while (pStart >= 0) {
      if (xml[pStart] === '<') {
        const tag = xml.slice(pStart, xml.indexOf('>', pStart) + 1);
        if (tag === '<w:p>' || tag.startsWith('<w:p ')) break;
      }
      pStart--;
    }
    const pEnd = xml.indexOf('</w:p>', hIdx) + '</w:p>'.length;
    const para = xml.slice(pStart, pEnd);
    if (para.includes('Heading2')) { hStart = pStart; hEnd = pEnd; break; }
    searchPos = hIdx + 1;
  }
  if (hStart < 0) throw new Error('Heading2 paragraph for 7.5 not found');
  xml = xml.slice(0, hStart) + xml.slice(hEnd);
  console.log('  Step 1: removed 7.5 heading paragraph');

  // ── 2. Remove body paragraph ──────────────────────────────────────────────
  const bIdx = xml.indexOf(BODY_ANCHOR);
  if (bIdx < 0) throw new Error('Body paragraph anchor not found');
  if (xml.indexOf(BODY_ANCHOR, bIdx + 1) >= 0) throw new Error('Body anchor not unique');

  let bStart = -1; let pos = bIdx - 1;
  while (pos >= 0) {
    if (xml[pos] === '<') {
      const tag = xml.slice(pos, xml.indexOf('>', pos) + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) { bStart = pos; break; }
    }
    pos--;
  }
  if (bStart < 0) throw new Error('<w:p> for body not found');
  const bEnd = xml.indexOf('</w:p>', bIdx) + '</w:p>'.length;
  xml = xml.slice(0, bStart) + xml.slice(bEnd);
  console.log('  Step 2: removed 7.5 body paragraph');

  // ── 3. SAX validation ─────────────────────────────────────────────────────
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
  console.log('  Step 3: SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
