// patch-course8-serology-label.mjs
// Prepends bold "Post-vaccination serology:" label run to the serology paragraph.

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

  // Direct string replacement — the run structure confirmed in document XML is:
  //   <w:r><w:t xml:space="preserve">The best way to check...
  // Replace the run opener + text start to inject the bold label run before it.
  const OLD = '<w:r><w:t xml:space="preserve">The best way to check that an injection vaccine actually protected the flock';
  const NEW =
    '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Post-vaccination serology:</w:t></w:r>' +
    '<w:r><w:t xml:space="preserve"> The best way to check that an injection vaccine actually protected the flock';

  if (!xml.includes(OLD)) throw new Error('NOT FOUND: serology run opener');
  if (xml.split(OLD).length - 1 > 1) throw new Error('NOT UNIQUE: serology run opener');
  xml = xml.split(OLD).join(NEW);
  console.log('  Inserted bold "Post-vaccination serology:" label run');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
