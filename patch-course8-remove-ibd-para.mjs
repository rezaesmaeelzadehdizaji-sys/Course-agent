// patch-course8-remove-ibd-para.mjs
// Removes the IBD/immunosuppression paragraph entirely.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const ANCHOR = 'Immunosuppression from IBD, Marek’s, or mycotoxins.';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // Try both curly and straight apostrophe
  let anchorIdx = xml.indexOf(ANCHOR);
  if (anchorIdx < 0) anchorIdx = xml.indexOf('Immunosuppression from IBD, Marek\'s, or mycotoxins.');
  if (anchorIdx < 0) anchorIdx = xml.indexOf('Immunosuppression from IBD, Marek');
  if (anchorIdx < 0) throw new Error('IBD paragraph anchor not found');
  if (xml.indexOf('Immunosuppression from IBD, Marek', anchorIdx + 1) >= 0) throw new Error('Anchor not unique');

  // Walk back to find <w:p> opener
  let pStart = -1;
  let pos = anchorIdx - 1;
  while (pos >= 0) {
    if (xml[pos] === '<') {
      const tagEnd = xml.indexOf('>', pos);
      const tag = xml.slice(pos, tagEnd + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) { pStart = pos; break; }
    }
    pos--;
  }
  if (pStart < 0) throw new Error('<w:p> opener not found');

  const pEnd = xml.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
  if (pEnd < 6) throw new Error('</w:p> not found');

  xml = xml.slice(0, pStart) + xml.slice(pEnd);
  console.log('  Removed IBD/immunosuppression paragraph');

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

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
