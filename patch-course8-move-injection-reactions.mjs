// patch-course8-move-injection-reactions.mjs
//
// 1. Extract the "Injection site reactions:" paragraph from §5.4/§5.5 and
//    insert it in Section 7, just before the "7.1 Mild reactions" heading.
// 2. In §5.6 "High rate of injection site reactions:" paragraph:
//    - Remove "A small firm lump at the injection site is expected (see Section 5.4)."
//      (now covered in full in Section 7 — redundant)
//    - Reword opening so "Large, weeping..." is self-contained.

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

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Step 1: Extract the "Injection site reactions:" paragraph ─────────────
  const ISR_ANCHOR = 'Injection site reactions:';
  const isrHit = xml.indexOf(ISR_ANCHOR);
  if (isrHit < 0) throw new Error('NOT FOUND: Injection site reactions:');
  const isrStart = findParaStart(xml, isrHit);
  if (isrStart < 0) throw new Error('No <w:p> for Injection site reactions:');
  const isrEnd = xml.indexOf('</w:p>', isrHit) + '</w:p>'.length;
  const isrParaXml = xml.slice(isrStart, isrEnd);
  console.log(`  Extracted "Injection site reactions:" para [${isrStart}–${isrEnd}] (${isrEnd - isrStart} chars)`);

  // Remove from current position
  xml = xml.slice(0, isrStart) + xml.slice(isrEnd);
  console.log('  Deleted from original position');

  // ── Step 2: Insert before "7.1 Mild reactions" heading ───────────────────
  // "7.1 Mild reactions are normal" also appears in the TOC — skip past it
  // by searching from well into the body (pos 150000 safely clears the TOC).
  const H71_ANCHOR = '7.1 Mild reactions are normal';
  const h71Hit = xml.indexOf(H71_ANCHOR, 150000);
  if (h71Hit < 0) throw new Error('NOT FOUND: 7.1 Mild reactions heading (body)');
  const h71ParaStart = findParaStart(xml, h71Hit);
  if (h71ParaStart < 0) throw new Error('No <w:p> for 7.1 heading');
  xml = xml.slice(0, h71ParaStart) + isrParaXml + xml.slice(h71ParaStart);
  console.log(`  Inserted before "7.1 Mild reactions" heading at pos ${h71ParaStart}`);

  // ── Step 3: Fix §5.6 "High rate" paragraph ───────────────────────────────
  // Remove the redundant "A small firm lump..." opener and reword so
  // "Large, weeping..." stands alone.
  const HR_OLD = ' A small firm lump at the injection site is expected (see Section 5.4). Large, weeping, or spreading reactions across the flock are not.';
  const HR_NEW = ' Large, weeping, or spreading reactions across the flock are not normal. For what an expected injection site reaction looks like, see Section 7.';
  if (!xml.includes(HR_OLD)) throw new Error('NOT FOUND: High rate paragraph opener');
  if (xml.split(HR_OLD).length - 1 > 1) throw new Error('NOT UNIQUE: High rate paragraph opener');
  xml = xml.split(HR_OLD).join(HR_NEW);
  console.log('  Updated "High rate" paragraph: removed redundant lump sentence, added Section 7 cross-ref');

  // ── SAX validation ────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
