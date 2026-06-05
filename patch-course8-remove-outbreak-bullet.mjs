// patch-course8-remove-outbreak-bullet.mjs
// Removes §4.7 "Vaccination in face of active Fowl Pox outbreak:" paragraph.
// The emergency vaccination concept and protocol are already covered in §4.1.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

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

function findParaStart(xml, pos) {
  let idx = xml.lastIndexOf('<w:p', pos);
  while (idx >= 0) {
    const tag5 = xml.slice(idx, idx + 5);
    if (tag5 === '<w:p>' || tag5 === '<w:p ') return idx;
    idx = xml.lastIndexOf('<w:p', idx - 1);
  }
  return -1;
}

function deletePara(xml, anchor, label) {
  const hit = xml.indexOf(anchor);
  if (hit < 0) throw new Error(`NOT FOUND: ${label}`);
  if (xml.split(anchor).length - 1 > 1) throw new Error(`NOT UNIQUE: ${label}`);
  const pStart = findParaStart(xml, hit);
  if (pStart < 0) throw new Error(`No <w:p> start for: ${label}`);
  const pEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
  console.log(`  Deleted para [${pStart}–${pEnd}]: ${label}`);
  return xml.slice(0, pStart) + xml.slice(pEnd);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  xml = deletePara(xml,
    'Vaccination in face of active Fowl Pox outbreak:',
    '§4.7 — "Vaccination in face of active Fowl Pox outbreak:" (concept already covered in §4.1)');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
