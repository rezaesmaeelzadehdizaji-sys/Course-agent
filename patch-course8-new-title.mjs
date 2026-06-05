// patch-course8-new-title.mjs
// Updates Course 8 title, subtitle, duration, date, and both header files.
// Cover page changes:
//   Title line 1: "Vaccination" → "Fundamentals of Poultry Vaccination & Treatment"
//   Title line 2: "water, spray, eye drop…" → cleared (blank spacing para)
//   Subtitle:     "Practical Vaccination Training…" → "Practical Vaccination and Treatment Training…"
//   Duration:     "1-Hour Lecture, 1.5-Hour Workshop (6 Sub-Courses)" → "2-Hour Lecture, 2-Hour Practical Session"
//   Date:         "May 2026" → "June 2026"
// Headers (both files): replace subtitle portion with new short title.
// NOTE: & in XML must be &amp; — all replacements handle this correctly.

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
  if (xml.split(oldStr).length - 1 > 1) throw new Error('NOT UNIQUE: ' + label);
  console.log('  Updated: ' + label);
  return xml.split(oldStr).join(newStr);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // 1. Title line 1: "Vaccination" (cover page, sz=52 para) → new full title
  //    Must use &amp; for the ampersand in XML.
  xml = replaceOnce(xml,
    '<w:t>Vaccination</w:t>',
    '<w:t>Fundamentals of Poultry Vaccination &amp; Treatment</w:t>',
    'Cover title line 1');

  // 2. Title line 2: clear the old sub-title line ("water, spray, eye drop...")
  xml = replaceOnce(xml,
    '<w:t>water, spray, eye drop, wing web, injection, in-ovo</w:t>',
    '<w:t></w:t>',
    'Cover title line 2 (cleared)');

  // 3. Subtitle paragraph
  xml = replaceOnce(xml,
    '<w:t>Practical Vaccination Training for Canadian Poultry Farms</w:t>',
    '<w:t>Practical Vaccination and Treatment Training for Canadian Poultry Farms</w:t>',
    'Cover subtitle');

  // 4. Duration
  xml = replaceOnce(xml,
    '<w:t>Duration: 1-Hour Lecture, 1.5-Hour Workshop (6 Sub-Courses)</w:t>',
    '<w:t>Duration: 2-Hour Lecture, 2-Hour Practical Session</w:t>',
    'Duration line');

  // 5. Date
  xml = replaceOnce(xml,
    '<w:t>May 2026</w:t>',
    '<w:t>June 2026</w:t>',
    'Date line');

  saxValidate(xml);
  console.log('  document.xml SAX: PASS');
  zip.file('word/document.xml', xml);

  // 6. Both header files
  const OLD_HEADER = 'Vaccination – water, wing web, eye drop, spray, injection';
  const NEW_HEADER = 'Fundamentals of Poultry Vaccination &amp; Treatment';
  for (const hf of ['word/header1.xml', 'word/header2.xml']) {
    let hxml = await zip.file(hf).async('string');
    if (!hxml.includes(OLD_HEADER)) throw new Error('NOT FOUND in ' + hf + ': header title');
    hxml = hxml.split(OLD_HEADER).join(NEW_HEADER);
    // Validate header XML
    const badH = hxml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
    if (badH) throw new Error('Unescaped & in ' + hf);
    zip.file(hf, hxml);
    console.log('  Updated header: ' + hf);
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
