// patch-course8-lo-section8.mjs
// Fixes em dash in Section 8 LO 9.

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

  const OLD = 'Choose the right delivery route — water, feed, or injectable — watch the withdrawal time on the label, and keep records your vet or inspector can read.';
  const NEW = 'Choose the right delivery route for the situation: water, feed, or injectable. Watch the withdrawal time on the label and keep records your vet or inspector can read.';

  if (!xml.includes(OLD)) throw new Error('NOT FOUND: LO 9 with em dash');
  xml = xml.split(OLD).join(NEW);
  console.log('  Fixed em dash in LO 9');

  // Belt-and-braces: confirm zero em dashes remain in body text
  const emDashes = (xml.match(/—/g) || []).length;
  if (emDashes > 0) throw new Error('Em dashes still present: ' + emDashes);
  console.log('  Em dash count: 0 (PASS)');

  saxValidate(xml);
  console.log('  SAX: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
