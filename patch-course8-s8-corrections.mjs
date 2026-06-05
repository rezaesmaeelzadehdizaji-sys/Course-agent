// patch-course8-s8-corrections.mjs
// Comprehensive corrections to Section 8 content, references, and TOC page numbers.
//
// FIXES:
//  1. Ref [23]: Title "2023 Annual Report" → "2023: Key and Integrated Findings" (verified on canada.ca)
//  2. Ref [24]: "in Animals" → "in animals" (matches actual page title); remove "2023" (live web page, no pub year)
//  3. Injectable bullet: last sentence "where pulling water temporarily is not feasible" is misleading — rewrite
//  4. Categories sentence: "Health Canada antimicrobial importance Categories" → cleaner phrasing
//  5. TOC page numbers: Section 8 entries from "47" to correct estimates; Recommended Journals 46→49; References 46→50

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

function replaceOnce(xml, oldStr, newStr, label) {
  if (!xml.includes(oldStr)) throw new Error('NOT FOUND: ' + label);
  const count = xml.split(oldStr).length - 1;
  if (count > 1) throw new Error('NOT UNIQUE (' + count + ' occurrences): ' + label);
  console.log('  Fixed: ' + label);
  return xml.split(oldStr).join(newStr);
}

// Position-based page number update in TOC (finds PAGEREF anchor, then replaces nearest <w:t>PAGE</w:t>)
function updateTocPage(xml, anchor, newPage) {
  const pref = xml.indexOf('PAGEREF ' + anchor + ' ');
  if (pref < 0) throw new Error('TOC anchor NOT FOUND: ' + anchor);
  const sep = xml.indexOf('fldCharType="separate"', pref);
  if (sep < 0) throw new Error('TOC separate marker not found after: ' + anchor);
  const wtStart = xml.indexOf('<w:t>', sep);
  const wtEnd = xml.indexOf('</w:t>', wtStart);
  const oldPage = xml.slice(wtStart + 5, wtEnd);
  const result = xml.slice(0, wtStart + 5) + newPage + xml.slice(wtEnd);
  console.log('  TOC ' + anchor + ': ' + oldPage + ' → ' + newPage);
  return result;
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ---- 1. Fix reference [23] title ----
  xml = replaceOnce(xml,
    '(CIPARS) 2023 Annual Report. Ottawa: PHAC; 2023.',
    '(CIPARS) 2023: Key and Integrated Findings. Ottawa: PHAC; 2023.',
    'Ref [23] title (Annual Report → Key and Integrated Findings)');

  // ---- 2. Fix reference [24] — lowercase "animals", remove year ----
  xml = replaceOnce(xml,
    'Antimicrobials in Animals. Ottawa: Health Canada; 2023 [cited 2026 Jun].',
    'Antimicrobials in animals. Ottawa: Health Canada [cited 2026 Jun].',
    'Ref [24] Animals→animals, remove 2023');

  // ---- 3. Fix injectable bullet: last sentence is misleading ----
  xml = replaceOnce(xml,
    'Long-acting injectables are practical in layer or breeder operations where pulling water temporarily is not feasible.',
    'Long-acting formulations reduce the number of individual handlings needed and are a practical option in breeder and layer operations.',
    'Injectable bullet: rewrite last sentence');

  // ---- 4. Fix categories sentence — awkward "antimicrobial importance" phrasing ----
  xml = replaceOnce(xml,
    'This covers Health Canada antimicrobial importance Categories I, II, and III, which includes nearly all antibiotics',
    'This covers all antimicrobials that Health Canada classifies as medically important: Categories I, II, and III, which include nearly all antibiotics',
    'Categories I-III sentence: cleaner phrasing');

  // ---- 5. Update TOC page numbers ----
  // Apply from lowest to highest anchor index so early fixes do not shift positions of later ones.
  // (All TOC anchors are at pos 59000-65000, all body changes are at 269000+, so no cross-interference.)
  xml = updateTocPage(xml, '_Toc231132536', '46');  // Section 8 H1
  xml = updateTocPage(xml, '_Toc231132537', '46');  // 8.1
  xml = updateTocPage(xml, '_Toc231132538', '47');  // 8.2
  xml = updateTocPage(xml, '_Toc231132539', '48');  // 8.3
  xml = updateTocPage(xml, '_Toc231132540', '48');  // 8.4
  xml = updateTocPage(xml, '_Toc231132528', '49');  // Recommended Peer-Reviewed Journals
  xml = updateTocPage(xml, '_Toc231132529', '50');  // References

  // ---- 6. SAX validate ----
  saxValidate(xml);
  console.log('\n  SAX: PASS');

  // ---- 7. Post-verify key strings ----
  const checks = [
    ['CIPARS) 2023: Key and Integrated Findings', true],
    ['CIPARS) 2023 Annual Report', false],           // must be GONE
    ['Antimicrobials in animals. Ottawa: Health Canada [cited 2026 Jun]', true],
    ['Antimicrobials in Animals. Ottawa: Health Canada; 2023', false],  // must be GONE
    ['Long-acting formulations reduce the number of individual handlings', true],
    ['pulling water temporarily is not feasible', false],              // must be GONE
    ['Health Canada classifies as medically important: Categories I, II, and III', true],
    ['Health Canada antimicrobial importance Categories', false],       // must be GONE
  ];
  let pass = true;
  checks.forEach(([str, shouldExist]) => {
    const found = xml.includes(str);
    const ok = found === shouldExist;
    if (!ok) { console.error('  FAIL [' + (shouldExist ? 'should exist' : 'should be gone') + ']: ' + str); pass = false; }
    else console.log('  OK [' + (shouldExist ? 'present' : 'removed') + ']: ' + str.slice(0, 60));
  });
  if (!pass) throw new Error('Post-verify failed');

  // ---- 8. Write ----
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
