// patch-course8-move-depression-para.mjs
// Moves "Birds showing significant post-vaccination depression or mortality:" from §5.6
// to Section 7, right after the "Injection site reactions:" paragraph and before the
// "7.1 Mild reactions are normal" heading.
// Placement logic:
//   - Injection site reactions paragraph → normal expected injection reaction
//   - THIS paragraph              → abnormal/serious injection reactions → call vet
//   - 7.1 Mild reactions…         → normal live respiratory reactions
// No redundancy cut needed: §7.4 mentions mortality only in respiratory context.

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

  // ── Step 1: Extract the "Birds showing..." paragraph from §5.6 ────────────
  const SRC_ANCHOR = 'Birds showing significant post-vaccination depression or mortality';
  const srcHit = xml.indexOf(SRC_ANCHOR);
  if (srcHit < 0) throw new Error('NOT FOUND: Birds showing paragraph');
  if (xml.split(SRC_ANCHOR).length - 1 > 1) throw new Error('NOT UNIQUE: Birds showing paragraph');

  const srcStart = findParaStart(xml, srcHit);
  if (srcStart < 0) throw new Error('No <w:p> for Birds showing paragraph');
  const srcEnd = xml.indexOf('</w:p>', srcHit) + '</w:p>'.length;
  const paraXml = xml.slice(srcStart, srcEnd);
  console.log('  Extracted "Birds showing..." para [' + srcStart + '-' + srcEnd + '] (' + (srcEnd - srcStart) + ' chars)');

  // Remove from §5.6
  xml = xml.slice(0, srcStart) + xml.slice(srcEnd);
  console.log('  Deleted from §5.6 Monitoring and Troubleshooting');

  // ── Step 2: Insert after the "Injection site reactions:" paragraph ────────
  // That paragraph ends just before "7.1 Mild reactions are normal" heading in
  // the body (skip TOC with offset 150000).
  const H71_ANCHOR = '7.1 Mild reactions are normal';
  const h71Hit = xml.indexOf(H71_ANCHOR, 150000);
  if (h71Hit < 0) throw new Error('NOT FOUND: 7.1 Mild reactions heading (body)');
  const h71ParaStart = findParaStart(xml, h71Hit);
  if (h71ParaStart < 0) throw new Error('No <w:p> for 7.1 heading');

  // "Injection site reactions:" paragraph immediately precedes the 7.1 heading.
  // We want to insert BETWEEN the ISR paragraph and the 7.1 heading,
  // i.e. right at h71ParaStart (after the ISR </w:p>).
  // Verify the ISR paragraph is indeed just before:
  const precedingText = xml.slice(Math.max(0, h71ParaStart - 500), h71ParaStart);
  if (!precedingText.includes('Injection site reactions:')) {
    throw new Error('Expected "Injection site reactions:" paragraph immediately before 7.1 heading — not found in preceding 500 chars');
  }

  // Insert the "Birds showing" paragraph before the 7.1 heading paragraph
  xml = xml.slice(0, h71ParaStart) + paraXml + xml.slice(h71ParaStart);
  console.log('  Inserted after "Injection site reactions:" paragraph (before 7.1 heading) at pos ' + h71ParaStart);

  // ── SAX validation ────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
