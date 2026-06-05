// patch-course8-vaccine-labels.mjs
// 1. Add bold "After live vaccines administration:" label before the live respiratory
//    vaccine reaction paragraph.
// 2. Rename "Injection site reactions:" → "Injection site reactions after killed
//    vaccines administration:"

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

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Add "After live vaccines administration:" label ────────────────────
  // Confirmed XML: <w:r><w:t xml:space="preserve">Every live respiratory vaccine...
  const LIVE_OLD = '<w:r><w:t xml:space="preserve">Every live respiratory vaccine you give the flock';
  const LIVE_NEW =
    '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>After live vaccines administration:</w:t></w:r>' +
    '<w:r><w:t xml:space="preserve"> Every live respiratory vaccine you give the flock';

  if (!xml.includes(LIVE_OLD)) throw new Error('NOT FOUND: live vaccine paragraph opener');
  if (xml.split(LIVE_OLD).length - 1 > 1) throw new Error('NOT UNIQUE: live vaccine paragraph opener');
  xml = xml.split(LIVE_OLD).join(LIVE_NEW);
  console.log('  Added "After live vaccines administration:" label');

  // ── 2. Rename "Injection site reactions:" ────────────────────────────────
  // Confirmed XML: <w:t>Injection site reactions:</w:t>
  const ISR_OLD = '<w:t>Injection site reactions:</w:t>';
  const ISR_NEW = '<w:t>Injection site reactions after killed vaccines administration:</w:t>';

  if (!xml.includes(ISR_OLD)) throw new Error('NOT FOUND: Injection site reactions label');
  if (xml.split(ISR_OLD).length - 1 > 1) throw new Error('NOT UNIQUE: Injection site reactions label');
  xml = xml.split(ISR_OLD).join(ISR_NEW);
  console.log('  Renamed to "Injection site reactions after killed vaccines administration:"');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
