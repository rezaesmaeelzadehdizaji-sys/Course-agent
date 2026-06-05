// patch-course8-full-redundancy-sweep.mjs
// Removes 6 cross-section redundancies identified in the full document review.
//
// Changes:
//  1. §1.5 step 6 — delete "Record the serial number..." list bullet (§1.3 already has it)
//  2. §3.2 IBV — remove CPC "highly transmissible" quote (verbatim repeat from §1.2)
//  3. §4 intro — remove "That visible take is what makes..." sentence (restated at §4.5 opener)
//  4. §5.3 — remove "Oil emulsion vaccines cannot be frozen. A single temperature..." (repeat
//            of §5.3 cold-chain paragraph above; practical storage tips that follow are kept)
//  5. §5.5 — remove "Change needles regularly." (protocol is in §5.3; reason sentence kept)
//  6. §5.6 — replace "A small firm lump is expected." with §5.4 cross-ref

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

// Delete the paragraph containing the anchor text
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

// Replace old with new, must appear exactly once
function replaceOnce(xml, old, replacement, label) {
  if (!xml.includes(old)) throw new Error(`NOT FOUND: ${label}`);
  if (xml.split(old).length - 1 > 1) throw new Error(`NOT UNIQUE: ${label}`);
  console.log(`  Replaced: ${label}`);
  return xml.split(old).join(replacement);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Item 1: Delete §1.5 record-keeping list bullet ───────────────────────
  xml = deletePara(xml,
    'Record the serial number and expiry date of every vial used',
    '§1.5 step 6 — record serial/expiry (already in §1.3)');

  // ── Item 2: Remove §3.2 IBV CPC quote sentence ───────────────────────────
  // Sentence: "The CPC Learning Centre IBV Disease Profile notes that IBV is
  //            [quote] [9]. "
  // Strategy: splice from "The CPC Learning Centre IBV Disease Profile notes"
  //           to "[9]. " (next occurrence after that position)
  {
    const SENT_START = 'The CPC Learning Centre IBV Disease Profile notes that IBV is ';
    const SENT_END   = '[9]. ';
    const startIdx = xml.indexOf(SENT_START);
    if (startIdx < 0) throw new Error('NOT FOUND: §3.2 IBV quote sentence start');
    const endSearch = xml.indexOf(SENT_END, startIdx);
    if (endSearch < 0) throw new Error('NOT FOUND: §3.2 IBV quote sentence end [9].');
    const endIdx = endSearch + SENT_END.length;
    xml = xml.slice(0, startIdx) + xml.slice(endIdx);
    console.log('  Removed: §3.2 IBV "highly transmissible" quote (verbatim repeat from §1.2)');
  }

  // ── Item 3: Remove §4 intro "visible take" sentence ──────────────────────
  xml = replaceOnce(xml,
    ' That visible take is what makes wing web vaccination different from every mass-vaccination method: it gives you proof, bird by bird, that immunity was stimulated.',
    '',
    '§4 intro — "That visible take..." sentence (restated at §4.5 opener)');

  // ── Item 4: Remove repeated "cannot be frozen" opener from §5.3 ──────────
  // The first cold-chain paragraph already says "They must never be frozen."
  // The second paragraph below repeats it then adds practical storage tips.
  // Remove only the repeat opener; keep the storage tips.
  xml = replaceOnce(xml,
    'Oil emulsion vaccines cannot be frozen. A single temperature excursion below 0°C destroys the product. Store them',
    'Store oil emulsion vaccines',
    '§5.3 — second "cannot be frozen" sentence (already in cold-chain paragraph above)');

  // ── Item 5: Remove "Change needles regularly." from §5.5 ─────────────────
  // The specific change-interval (every 1,000 birds) is already in §5.3.
  // Keep the reason sentence; remove the vague directive.
  xml = replaceOnce(xml,
    'Change needles regularly. A dull needle causes more tissue trauma and increases post-injection reaction rates',
    'A dull needle causes more tissue trauma and increases post-injection reaction rates',
    '§5.5 — "Change needles regularly." (protocol already in §5.3)');

  // ── Item 6: Tighten §5.6 lump sentence with §5.4 cross-ref ──────────────
  xml = replaceOnce(xml,
    'A small firm lump is expected. Large, weeping, or spreading reactions across the flock are not.',
    'A small firm lump at the injection site is expected (see Section 5.4). Large, weeping, or spreading reactions across the flock are not.',
    '§5.6 — replace bare "lump expected" with §5.4 cross-ref');

  // ── SAX validation ────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  // ── Write output ──────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
