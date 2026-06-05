// patch-course8-serology-para.mjs
// Replaces the serology/titer paragraph in §7 (or wherever it sits) with new farmer-flow text.

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

function findParaStart(xml, pos) {
  let idx = xml.lastIndexOf('<w:p', pos);
  while (idx >= 0) {
    const tag5 = xml.slice(idx, idx + 5);
    if (tag5 === '<w:p>' || tag5 === '<w:p ') return idx;
    idx = xml.lastIndexOf('<w:p', idx - 1);
  }
  return -1;
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  const ANCHOR = 'The most reliable way to confirm that injection vaccination achieved adequate flock protection';
  const hit = xml.indexOf(ANCHOR);
  if (hit < 0) throw new Error('NOT FOUND: serology paragraph anchor');
  if (xml.split(ANCHOR).length - 1 > 1) throw new Error('NOT UNIQUE: serology paragraph anchor');

  const pStart = findParaStart(xml, hit);
  if (pStart < 0) throw new Error('No <w:p> start for serology paragraph');
  const pEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
  console.log('  Found serology paragraph [' + pStart + '–' + pEnd + '] (' + (pEnd - pStart) + ' chars)');

  // Extract pPr from existing paragraph so formatting is preserved
  const existingPara = xml.slice(pStart, pEnd);
  const pPrMatch = existingPara.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch ? pPrMatch[0] : '<w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>';
  console.log('  Preserved pPr: ' + pPr.slice(0, 80) + '...');

  // Extract rsid attrs from the opening tag for fidelity
  const openTag = existingPara.match(/^<w:p\b[^>]*>/);
  const openTagStr = openTag ? openTag[0] : '<w:p>';

  const newText =
    'The best way to check that an injection vaccine actually protected the flock is to run blood titers 4 to 6 weeks after vaccination, or at first egg in layer programs. ' +
    'If titers are below the protective range, even though the crew did the injections properly, it usually means a problem with the vaccine itself or the birds’ immune system. ' +
    'Common issues are a cold chain failure (vaccine got too hot or froze), the wrong product being used, or an immunosuppressive disease in the flock dragging titers down. ' +
    'If titers come back low, go through your cold chain records from the time the vaccine arrived on farm right through the vaccination day. ' +
    'One freezing event, even for a short time, can ruin an oil-emulsion vaccine. ' +
    'Also double-check that the product used actually covered the disease you are testing for, because multivalent vaccines do not all contain the same NDV or IBV strains. ' +
    'Sit down with your veterinarian to interpret the titer report and decide if a booster is needed, and consider confirming the lab results if something does not line up with what you see in the barn [5,21].';

  const newPara =
    openTagStr +
    pPr +
    '<w:r><w:t xml:space="preserve">' + newText + '</w:t></w:r>' +
    '</w:p>';

  xml = xml.slice(0, pStart) + newPara + xml.slice(pEnd);
  console.log('  Replaced serology paragraph with farmer-flow text');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('Done. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
