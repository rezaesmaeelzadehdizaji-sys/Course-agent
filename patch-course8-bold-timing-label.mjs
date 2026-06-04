// patch-course8-bold-timing-label.mjs
// Makes "Timing on injection day: " bold in Section 5 by splitting the run.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  const LABEL  = 'Timing on injection day: ';
  const ANCHOR = LABEL + 'unlike water vaccination';

  // ── 1. Find the anchor text ────────────────────────────────────────────────
  const textIdx = xml.indexOf(ANCHOR);
  if (textIdx < 0) throw new Error('Anchor not found');
  if (xml.indexOf(ANCHOR, textIdx + 1) >= 0) throw new Error('Anchor not unique');

  // ── 2. Find enclosing <w:t> opener ────────────────────────────────────────
  const tStart = xml.lastIndexOf('<w:t', textIdx);
  if (tStart < 0) throw new Error('<w:t> opener not found');
  const tTagEnd = xml.indexOf('>', tStart);
  const tTagName = xml.slice(tStart, tTagEnd + 1);
  if (!tTagName.startsWith('<w:t')) throw new Error('Wrong tag before anchor: ' + tTagName);

  // ── 3. Find enclosing <w:r> opener (walk back from tStart) ────────────────
  let rStart = -1;
  let pos = tStart - 1;
  while (pos >= 0) {
    if (xml[pos] === '<') {
      const tagEnd = xml.indexOf('>', pos);
      const tag = xml.slice(pos, tagEnd + 1);
      if (tag === '<w:r>' || tag.startsWith('<w:r ')) { rStart = pos; break; }
    }
    pos--;
  }
  if (rStart < 0) throw new Error('<w:r> opener not found before <w:t>');

  // ── 4. Find end of run ────────────────────────────────────────────────────
  const tCloseIdx = xml.indexOf('</w:t>', tTagEnd);
  const rCloseIdx = xml.indexOf('</w:r>', tCloseIdx);
  if (tCloseIdx < 0 || rCloseIdx < 0) throw new Error('Run close tags not found');
  const rEnd = rCloseIdx + '</w:r>'.length;

  // ── 5. Build replacement ──────────────────────────────────────────────────
  const runOpener = xml.slice(rStart, tStart); // preserves original rPr if any
  const fullText  = xml.slice(tTagEnd + 1, tCloseIdx);
  if (!fullText.startsWith(LABEL)) throw new Error('Text does not start with label: ' + fullText.slice(0, 60));
  const rest = fullText.slice(LABEL.length);

  const newContent =
    `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>${LABEL}</w:t></w:r>` +
    `${runOpener}<w:t xml:space="preserve">${rest}</w:t></w:r>`;

  xml = xml.slice(0, rStart) + newContent + xml.slice(rEnd);
  console.log('  Split: "Timing on injection day: " bolded, body run preserved');

  // ── 6. SAX + schema-nesting validation ────────────────────────────────────
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

  // ── 7. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
