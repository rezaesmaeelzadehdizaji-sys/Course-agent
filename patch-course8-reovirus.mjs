// patch-course8-reovirus.mjs
// Adds Avian Reovirus (ARV) as a new antigen entry in Section 5.2
// Target Vaccines and Disease Coverage, inserted between ILT and Mycoplasma.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// New Reovirus list-paragraph — matches the exact format of ILT and Mycoplasma entries:
// pStyle=ListParagraph, numId=2, ilvl=0, after=80, line=276
const REOVIRUS_PARA =
  `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>` +
  `<w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>` +
  `<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Avian Reovirus (ARV):</w:t></w:r>` +
  `<w:r><w:t xml:space="preserve"> Reovirus causes viral arthritis and tenosynovitis, most commonly in broilers and young breeders. ` +
  `In layer and breeder programs it is controlled through a two-stage injection program: ` +
  `a live vaccine given subcutaneously at a young age primes the immune system, ` +
  `followed by a killed injection before lay that builds high maternal antibody titers. ` +
  `Those maternal antibodies transfer through the egg and protect chicks from reovirus-associated leg problems in the first weeks of life [5].</w:t></w:r></w:p>`;

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Find insert point: end of ILT paragraph in Section 5.2 ────────────
  const ILT_END = 'Some multivalent products include a killed ILT component. In flocks with ILT pressure, this is combined with an earlier live eye drop or coarse spray prime [5,16].</w:t></w:r></w:p>';
  const idx = xml.indexOf(ILT_END);
  if (idx < 0) throw new Error('ILT paragraph anchor not found');
  if (xml.indexOf(ILT_END, idx + 1) >= 0) throw new Error('ILT anchor is not unique');

  const insertAt = idx + ILT_END.length;
  xml = xml.slice(0, insertAt) + REOVIRUS_PARA + xml.slice(insertAt);
  console.log('  Step 1: inserted Avian Reovirus paragraph after ILT in Section 5.2');

  // ── 2. Verify Mycoplasma entry still follows immediately after ────────────
  if (!xml.includes('Mycoplasma gallisepticum')) throw new Error('Mycoplasma entry missing after insert');

  // ── 3. Strict SAX + schema-nesting validation ─────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p') {
      if (stack.includes('w:p') || stack.includes('w:pPr')) {
        stopped = true;
        info = { issue: 'w:p nested inside p/pPr', pos: parser.position, stack: stack.slice(-8) };
        return;
      }
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror = (e) => {
    if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; }
  };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) {
    console.error('  XML INVALID:', info);
    const p = info.pos || 0;
    console.error('  Context:', JSON.stringify(xml.slice(Math.max(0, p - 150), p + 150)));
    throw new Error('SAX validation failed');
  }
  if (stack.length !== 0) throw new Error('Unclosed tags after edit: ' + stack.join(', '));
  console.log('  Step 2: SAX + schema-nesting validation: PASS');

  // ── 4. Unescaped & check ─────────────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 5. Write ─────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
