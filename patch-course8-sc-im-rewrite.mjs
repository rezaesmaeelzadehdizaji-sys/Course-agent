// patch-course8-sc-im-rewrite.mjs
// Rewrites the SC and IM injection technique paragraphs in §5.4.

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

  // Helper: replace a full paragraph identified by a unique anchor text
  function replacePara(xml, anchor, newParaXml, label) {
    const hit = xml.indexOf(anchor);
    if (hit < 0) throw new Error(`NOT FOUND: ${label}`);
    if (xml.split(anchor).length - 1 > 1) throw new Error(`NOT UNIQUE: ${label}`);
    const pStart = findParaStart(xml, hit);
    if (pStart < 0) throw new Error(`No <w:p> start for: ${label}`);
    const pEnd = xml.indexOf('</w:p>', hit) + '</w:p>'.length;
    console.log(`  Replaced para [${pStart}–${pEnd}]: ${label}`);
    return xml.slice(0, pStart) + newParaXml + xml.slice(pEnd);
  }

  // ── SC paragraph (body split across two runs — replace whole paragraph) ───
  const SC_PPR = '<w:pPr><w:spacing w:after=”160” w:line=”276” w:lineRule=”auto”/><w:jc w:val=”both”/></w:pPr>';
  const SC_NEW_PARA =
    `<w:p w14:paraId=”155C8AA5” w14:textId=”77777777” w:rsidR=”00997264” w:rsidRDefault=”00CB7A09”>${SC_PPR}` +
    `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Subcutaneous (SC) injection:</w:t></w:r>` +
    `<w:r><w:t xml:space=”preserve”> This route puts the vaccine under the skin, not in the muscle. In poultry, the usual spot is the loose skin at the back of the neck, between the head and the shoulders. With the hand that is not holding the injector, lift a small &quot;tent&quot; of skin away from the neck. Slide the needle in at a shallow angle (about 20 to 30 degrees) into that pocket and give the full dose before pulling the needle out. When the needle is in the right place, the vaccine should go in easily. If you feel a lot of resistance, you are likely in the muscle or hitting bone, so pull out and try again [21].</w:t></w:r>` +
    `</w:p>`;
  xml = replacePara(xml, 'Subcutaneous (SC) injection:', SC_NEW_PARA, 'SC injection paragraph');

  // ── IM paragraph (replace whole paragraph) ───────────────────────────────
  const IM_NEW_PARA =
    `<w:p w14:paraId=”AA010009” w14:textId=”77777777” w:rsidR=”00997264” w:rsidRDefault=”00CB7A09”>${SC_PPR}` +
    `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Intramuscular (IM) injection:</w:t></w:r>` +
    `<w:r><w:t xml:space=”preserve”> This route puts the vaccine into the breast muscle. Hold the bird so the breast is facing you. Feel for the keel bone, then go into the big breast muscle just to one side of the keel, with the needle at about a 45-degree angle. Do not inject right on the midline, or you will hit the keel bone, and do not push so deep that you risk going toward the body cavity. Give the full dose, then pull the needle out smoothly [21].</w:t></w:r>` +
    `</w:p>`;
  xml = replacePara(xml, 'Intramuscular (IM) injection:', IM_NEW_PARA, 'IM injection paragraph');

  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
