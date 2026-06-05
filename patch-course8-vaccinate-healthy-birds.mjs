// patch-course8-vaccinate-healthy-birds.mjs
// Rewrites the "vaccinate only healthy birds" paragraph in §7.2.

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

  const OLD = ' The CPC Learning Centre General Principles of Vaccination guide is unambiguous: vaccinate only healthy birds, and never vaccinate a flock that is already stressed or diseased at the time of vaccination [1]. A bird whose immune system is already fighting a field challenge will react harder to the vaccine and protect less. If birds are showing respiratory signs or other illness before the scheduled vaccination day, call your veterinarian before opening any vials.';

  const NEW = ' The CPC Learning Centre General Principles of Vaccination guide is very clear: only vaccinate healthy birds, and never vaccinate a flock that is already stressed or sick [1]. When a bird’s immune system is busy fighting a field bug, it will often react harder to the vaccine and still end up less protected. If you see coughing, rattles, nasal discharge, or any other signs of illness before vaccine day, call your veterinarian before you open any vials.';

  if (!xml.includes(OLD)) throw new Error('NOT FOUND: vaccinate healthy birds paragraph');
  if (xml.split(OLD).length - 1 > 1) throw new Error('NOT UNIQUE: vaccinate healthy birds paragraph');
  xml = xml.split(OLD).join(NEW);
  console.log('  Rewrote "vaccinate only healthy birds" paragraph');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
