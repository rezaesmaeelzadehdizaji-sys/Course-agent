// patch-course8-lo-section8.mjs
// Replaces the three Section 8 LO bullets with shorter, farmer-friendly wording.

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
  console.log('  Fixed: ' + label);
  return xml.split(oldStr).join(newStr);
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  xml = replaceOnce(xml,
    'Explain how antibiotic resistance develops and why it matters for your flock\'s long-term health and your market access.',
    'Know what AMR is and why misusing antibiotics today can leave you with harder-to-treat bacteria tomorrow.',
    'LO 7: AMR'
  );

  xml = replaceOnce(xml,
    'Know the Canadian legal requirements for antibiotic use in commercial poultry: VCPR, Veterinary Health Certificate, and the prescription rules that took effect December 1, 2018.',
    'Know the rules before you treat: you need a valid VCPR with your vet, a Veterinary Health Certificate, and a prescription. No exceptions since December 2018.',
    'LO 8: VCPR/VHC'
  );

  xml = replaceOnce(xml,
    'Select the right treatment route for each situation, observe the correct withdrawal time, and keep complete treatment records.',
    'Choose the right delivery route — water, feed, or injectable — watch the withdrawal time on the label, and keep records your vet or inspector can read.',
    'LO 9: treatment routes'
  );

  saxValidate(xml);
  console.log('  SAX: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
