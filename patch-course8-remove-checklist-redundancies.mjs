// patch-course8-remove-checklist-redundancies.mjs
//
// Removes redundant items from the Section 2.8 monitoring checklist.
// All four removed items are already stated in earlier sections:
//   "Practice run with water..."         — 2.3 "Before vaccination day:" bullet 3
//   "Check spray pattern at a light..."  — 2.3 "Before vaccination day:" bullet 2
//   "Confirm fans are off before..."     — 2.5 "Turn off all fans before starting."
//   "Confirm the 20-minute hold..."      — 2.5 + Photo 2.1 caption
// Also removes the two sub-headings ("Before the run:" / "During and after the run:")
// since the surviving bird-watch bullet needs no heading.

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

// Walk back from pos to the nearest <w:p> or <w:p (not <w:pPr> etc.)
function findParaStart(xml, pos) {
  let idx = xml.lastIndexOf('<w:p', pos);
  while (idx >= 0) {
    const tag5 = xml.slice(idx, idx + 5);
    if (tag5 === '<w:p>' || tag5 === '<w:p ') return idx;
    idx = xml.lastIndexOf('<w:p', idx - 1);
  }
  return -1;
}

// Delete the paragraph whose <w:t> content contains the given anchor string.
// Returns the modified xml.
function deletePara(xml, anchorText, label) {
  const hit = xml.indexOf(anchorText);
  if (hit < 0) throw new Error(`ANCHOR NOT FOUND: ${label} — "${anchorText.slice(0, 60)}"`);
  const count = xml.split(anchorText).length - 1;
  if (count > 1) throw new Error(`ANCHOR NOT UNIQUE (${count}×): ${label}`);
  const pStart = findParaStart(xml, hit);
  if (pStart < 0) throw new Error(`Could not find <w:p> start for: ${label}`);
  const pEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
  console.log(`  Deleted [${pStart}–${pEnd}]: ${label}`);
  return xml.slice(0, pStart) + xml.slice(pEnd);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // Delete in reverse document order so earlier deletions don't shift positions
  // (we re-search after each deletion so order doesn't matter technically,
  //  but it's cleaner to process them sequentially and verify anchors exist first)

  // Verify all anchors present before touching anything
  const anchors = [
    ['Before the run:',          'sub-heading "Before the run:"'],
    ['Practice run with water',  'practice run bullet'],
    ['Check spray pattern at a light source', 'check spray pattern bullet'],
    ['Confirm fans are off before starting',  'confirm fans bullet'],
    ['During and after the run:', 'sub-heading "During and after the run:"'],
    ['Confirm the 20-minute ventilation hold', 'ventilation hold bullet'],
  ];
  for (const [anchor, label] of anchors) {
    if (!xml.includes(anchor)) throw new Error(`ANCHOR NOT FOUND: ${label} — "${anchor}"`);
  }
  console.log('All anchors verified. Starting deletions...\n');

  // Delete in document order (top to bottom)
  xml = deletePara(xml, 'Before the run:',                           'sub-heading "Before the run:"');
  xml = deletePara(xml, 'Practice run with water',                   'practice run bullet (redundant with §2.3)');
  xml = deletePara(xml, 'Check spray pattern at a light source',     'spray pattern bullet (redundant with §2.3)');
  xml = deletePara(xml, 'Confirm fans are off before starting',      'fans off bullet (redundant with §2.5)');
  xml = deletePara(xml, 'During and after the run:',                 'sub-heading "During and after the run:"');
  xml = deletePara(xml, 'Confirm the 20-minute ventilation hold',    'ventilation hold bullet (redundant with §2.5)');

  console.log('\nOK: All 6 redundant paragraphs deleted');

  saxValidate(xml);
  console.log('SAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\nDone. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log('\nSurviving in 2.8: bird-watch bullet + serology paragraph + common failures list');
}

run().catch(e => { console.error(e); process.exit(1); });
