// patch-course8-replace-mg-bullet.mjs
// §5.2 — Remove MG/MS bullet and replace with three new bullets:
//   • Salmonella (if SE/ST in flock history or region)
//   • Infectious Bursal Disease (IBD) (if regional pressure)
//   • Autogenous IBH (if IBH confirmed in flock history or region)

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

// Shared list paragraph pPr (same numId as existing §5.2 bullets)
const LIST_PPR = '<w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>';

function listBullet(paraId, labelRuns, bodyText) {
  return (
    `<w:p w14:paraId="${paraId}" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09">` +
    LIST_PPR +
    labelRuns +
    `<w:r><w:t xml:space="preserve"> ${bodyText}</w:t></w:r>` +
    '</w:p>'
  );
}

const boldItalicRun = (text) =>
  `<w:r><w:rPr><w:b/><w:bCs/><w:i/><w:iCs/></w:rPr><w:t>${text}</w:t></w:r>`;
const boldRun = (text) =>
  `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;

// New bullets
const SALMONELLA_BULLET = listBullet(
  'A1B2C001',
  boldItalicRun('Salmonella') + boldRun(':'),
  'In programs where Salmonella Enteritidis (SE) or Salmonella Typhimurium (ST) is confirmed in the flock history or circulating in the region, killed Salmonella bacterins are added to the pre-lay injection schedule. Reducing Salmonella carriage and vertical transmission through the egg is a food safety and regulatory priority in Canadian layer and breeder flocks [5].'
);

const IBD_BULLET = listBullet(
  'A1B2C002',
  boldRun('Infectious Bursal Disease (IBD):'),
  'When IBD pressure exists in the flock history or regionally, a killed IBD component reinforces systemic titers and supports maternal antibody transfer through the egg. Those maternal antibodies protect chicks from early Gumboro challenge during the brooding period [5,6].'
);

const IBH_BULLET = listBullet(
  'A1B2C003',
  boldRun('Autogenous Inclusion Body Hepatitis (IBH):'),
  'If Inclusion Body Hepatitis caused by fowl adenovirus has been confirmed in the flock history or is active in the region, your veterinarian may recommend an autogenous vaccine prepared from the local field isolate. Commercial products may not cover the circulating serotype; an autogenous vaccine is the practical option when they do not [5].'
);

const THREE_NEW_BULLETS = SALMONELLA_BULLET + IBD_BULLET + IBH_BULLET;

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // Locate MG paragraph: unique anchor is "Mycoplasma gallisepticum" at pos ~225890
  // (second occurrence at ~258497 is in a different section — confirmed different text)
  const ANCHOR = 'Mycoplasma gallisepticum';
  const hit = xml.indexOf(ANCHOR);
  if (hit < 0) throw new Error('NOT FOUND: Mycoplasma gallisepticum');
  // Verify unique paragraph context: the §5.2 bullet contains "Killed Mycoplasma bacterins"
  const contextEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
  const paraText = xml.slice(hit, contextEnd);
  if (!paraText.includes('Killed Mycoplasma bacterins')) {
    throw new Error('First Mycoplasma gallisepticum hit is not the §5.2 bullet — context check failed');
  }

  const pStart = findParaStart(xml, hit);
  if (pStart < 0) throw new Error('Could not find <w:p> start for MG bullet');
  const pEnd = contextEnd;
  console.log(`  MG paragraph: [${pStart}–${pEnd}]`);

  xml = xml.slice(0, pStart) + THREE_NEW_BULLETS + xml.slice(pEnd);
  console.log('  Replaced MG/MS bullet with Salmonella + IBD + Autogenous IBH bullets');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
