// patch-course8-response-depends.mjs
// Replaces the "The response depends on what is driving the severity..." paragraph
// in §7.4 with new farmer-flow text. Preserves italic E. coli and Mycoplasma.

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

const italic = t => '<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>' + t + '</w:t></w:r>';
const normal = t => '<w:r><w:t xml:space="preserve">' + t + '</w:t></w:r>';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // Old: three runs spanning the paragraph content
  const OLD =
    '<w:r><w:t xml:space="preserve">The response depends on what is driving the severity. Secondary bacterial airsacculitis needs antibiotic therapy targeting </w:t></w:r>' +
    '<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>E. coli</w:t></w:r>' +
    '<w:r><w:t>. Mycoplasma amplification requires antibiotics targeting Mycoplasma. Wrong vaccine strain or route needs diagnostic workup and a full program review with your veterinarian. None of those decisions should be made without veterinary involvement.</w:t></w:r>';

  const NEW =
    normal('What you do next depends on what is making the birds so sick. If you are seeing a lot of airsacs full of pus, you are likely dealing with a secondary ') +
    italic('E. coli') +
    normal(' problem and will need an antibiotic that hits ') +
    italic('E. coli') +
    normal('. If ') +
    italic('Mycoplasma') +
    normal(' is flaring up, you need an antibiotic that is effective against ') +
    italic('Mycoplasma') +
    normal(' instead. If the issue is that the wrong vaccine strain was used, or the wrong route, then you are looking at more testing and a full vaccine program review. None of these treatment or program changes should be made without your veterinarian involved.');

  if (!xml.includes(OLD)) throw new Error('NOT FOUND: response depends paragraph');
  if (xml.split(OLD).length - 1 > 1) throw new Error('NOT UNIQUE: response depends paragraph');
  xml = xml.split(OLD).join(NEW);
  console.log('  Replaced "response depends" paragraph');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
