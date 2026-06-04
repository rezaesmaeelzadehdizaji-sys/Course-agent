// patch-course8-remove-biosec-quote.mjs
// In Section 7.5, removes the CPC quote + "Good vaccination and good biosecurity..."
// leaving only: "Post-vaccination reactions are worse in barns with poor litter
// management and inadequate biosecurity."

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const OLD = 'Post-vaccination reactions are worse in barns with poor litter management and inadequate biosecurity. The CPC Learning Centre General Principles of Vaccination guide connects this directly: if disease agents build up from flock to flock without proper cleanout and disinfection, the challenge can overwhelm even a well-vaccinated bird, and post-vaccine respiratory problems increase [1]. Good vaccination and good biosecurity are not alternatives to each other. They work together, and the flock’s reaction profile after vaccination is one of the clearest indicators of how well both are performing.';

const NEW = 'Post-vaccination reactions are worse in barns with poor litter management and inadequate biosecurity.';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // Also try straight apostrophe in case encoding differs
  let found = xml.includes(OLD);
  let findStr = OLD;
  if (!found) {
    findStr = OLD.replace('’', "'");
    found = xml.includes(findStr);
  }
  if (!found) throw new Error('Section 7.5 paragraph anchor not found');
  if ((xml.split(findStr).length - 1) > 1) throw new Error('Anchor not unique');

  xml = xml.replace(findStr, NEW);
  console.log('  Replaced: trimmed Section 7.5 to opening sentence only');

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

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
