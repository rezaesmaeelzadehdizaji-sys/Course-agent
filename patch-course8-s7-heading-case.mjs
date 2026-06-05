// patch-course8-s7-heading-case.mjs
// Fixes Section 7 H2 heading style to match Sections 1-6:
//   Title Case + double space after the section number.
// Updates both the body headings and the TOC cached entries.

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

const FIXES = [
  ['7.1 Mild reactions are normal',                    '7.1  Mild Reactions Are Normal'],
  ['7.2 What makes a reaction worse than expected',    '7.2  What Makes a Reaction Worse than Expected'],
  ['7.3 Do not stack live vaccines on an active reaction', '7.3  Do Not Stack Live Vaccines on an Active Reaction'],
  ['7.4 When to call your veterinarian',               '7.4  When to Call Your Veterinarian'],
];

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  FIXES.forEach(([oldText, newText]) => {
    const count = xml.split(oldText).length - 1;
    if (count === 0) throw new Error('NOT FOUND: ' + oldText);
    // Expect exactly 2 occurrences: one in TOC, one in body heading
    if (count > 2) throw new Error('MORE THAN 2 occurrences (' + count + '): ' + oldText);
    xml = xml.split(oldText).join(newText);
    console.log('  [' + count + ' replaced] "' + oldText + '"');
    console.log('           -> "' + newText + '"');
  });

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
