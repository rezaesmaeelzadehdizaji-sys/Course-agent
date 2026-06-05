// patch-course8-three-edits.mjs
//
// 1. Delete "Fowl Pox is a slow-spreading poxvirus disease. " from §4.1 paragraph opener
// 2. Delete the second safety bullet: "After the session, disinfect the applicator..."
// 3. Remove duplicate "No take:" and "Excessive reaction:" paragraphs (second occurrences, in §4.7)

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
  const pStart = findParaStart(xml, hit);
  if (pStart < 0) throw new Error(`No <w:p> start for: ${label}`);
  const pEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
  console.log(`  Deleted para [${pStart}–${pEnd}]: ${label}`);
  return xml.slice(0, pStart) + xml.slice(pEnd);
}

// Delete the SECOND occurrence of a paragraph containing anchor text
function deleteSecondPara(xml, anchor, label) {
  const first = xml.indexOf(anchor);
  if (first < 0) throw new Error(`NOT FOUND (first): ${label}`);
  const second = xml.indexOf(anchor, first + anchor.length);
  if (second < 0) throw new Error(`NOT FOUND (second occurrence): ${label} — only one instance exists`);
  const pStart = findParaStart(xml, second);
  if (pStart < 0) throw new Error(`No <w:p> start for second occurrence of: ${label}`);
  const pEnd = xml.indexOf('</w:p>', second) + '</w:p>'.length;
  console.log(`  Deleted second-occurrence para [${pStart}–${pEnd}]: ${label}`);
  return xml.slice(0, pStart) + xml.slice(pEnd);
}

function replaceOnce(xml, old, replacement, label) {
  if (!xml.includes(old)) throw new Error(`NOT FOUND: ${label}`);
  if (xml.split(old).length - 1 > 1) throw new Error(`NOT UNIQUE: ${label}`);
  console.log(`  Replaced: ${label}`);
  return xml.split(old).join(replacement);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Item 1: Delete "Fowl Pox is a slow-spreading poxvirus disease. " ────────
  xml = replaceOnce(xml,
    'Fowl Pox is a slow-spreading poxvirus disease. ',
    '',
    '§4.1 — "Fowl Pox is a slow-spreading poxvirus disease." sentence deleted');

  // ── Item 2: Delete second safety bullet (disinfect applicator after session) ─
  xml = deletePara(xml,
    'After the session, disinfect the applicator with 70% isopropyl alcohol',
    '§4 safety bullet — "After the session, disinfect the applicator..." (second point removed)');

  // ── Item 3a: Delete §4.7 "No takes at all:" paragraph (concept in §4.5 "No take:") ──
  xml = deletePara(xml,
    'No takes at all:',
    '§4.7 "No takes at all:" — same concept as §4.5 "No take:", §4.5 version kept');

  // ── Item 3b: Delete §4.7 "High rate of excessive reactions:" paragraph ──────
  xml = deletePara(xml,
    'High rate of excessive reactions:',
    '§4.7 "High rate of excessive reactions:" — same concept as §4.5 "Excessive reaction:", §4.5 version kept');

  // ── SAX validation ────────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
