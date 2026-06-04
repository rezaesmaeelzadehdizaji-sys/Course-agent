// patch-course8-add-bist-ref.mjs
//
// Adds Bist et al. 2024 as a new reference and inserts a new protocol item 1
// (plastic/metal equipment rule) before the existing "Add skim milk powder..." item.
//
// Renumbering map (old citation → new citation):
//   1-9  → 1-9   (no change)
//   10   → 14    (Ojkic — was cited out of order; now correctly positioned)
//   11   → 10    (Water-Vax — appears before [10] in the text)
//   12   → 11
//   13   → 12
//   NEW  → 13    (Bist et al. 2024 — inserted in protocol block)
//   14   → 15
//   15   → 16
//   16   → 17
//   17   → 18
//   18   → 19
//   19   → 20
//   20   → 21
//   21   → 22
// Total: 21 → 22 references

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// Old → New citation mapping (null = deleted, not used here)
const NUM_MAP = {};
for (let i = 1; i <= 9; i++) NUM_MAP[i] = i;
NUM_MAP[10] = 14;
NUM_MAP[11] = 10;
NUM_MAP[12] = 11;
NUM_MAP[13] = 12;
for (let i = 14; i <= 21; i++) NUM_MAP[i] = i + 1;

function remapCitGroup(match) {
  const nums = match.slice(1, -1).split(',').map(n => parseInt(n.trim()));
  const remapped = nums.map(n => NUM_MAP[n]).filter(n => n !== null && n !== undefined);
  if (remapped.length === 0) return '';
  return '[' + remapped.join(',') + ']';
}

// New list item (inserted before "Add skim milk powder..." as item 1)
const NEW_LIST_ANCHOR = 'w14:paraId="4FDA03BC"'; // unique to the skim-milk paragraph
const NEW_LIST_PARA =
  '<w:p>' +
    '<w:pPr>' +
      '<w:pStyle w:val="ListParagraph"/>' +
      '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="3"/></w:numPr>' +
      '<w:spacing w:after="80" w:line="276" w:lineRule="auto"/>' +
    '</w:pPr>' +
    '<w:r><w:t xml:space="preserve">Use clean plastic buckets or containers for vaccine preparation; avoid metal equipment, as metal ions can inactivate or damage live vaccines [13].</w:t></w:r>' +
  '</w:p>';

// New bibliography entry XML (label "13.  " in bold blue, body in normal weight)
const BIST_PARA =
  '<w:p>' +
    '<w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/><w:ind w:left="504" w:hanging="504"/></w:pPr>' +
    '<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>' +
      '<w:t xml:space="preserve">13.  </w:t></w:r>' +
    '<w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>' +
      '<w:t>Bist RB, Bist K, Poudel S, et al. Sustainable poultry farming practices: a critical review of current strategies and future prospects. Poult Sci. 2024;103(12):104295. doi:10.1016/j.psj.2024.104295</w:t></w:r>' +
  '</w:p>';

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

  // ── Step 1: Renumber citations in body text (temp marker technique) ──────
  const citRe = /\[\d+(?:,\d+)*\]/g;
  const allCits = [...new Set([...xml.matchAll(citRe)].map(m => m[0]))];
  allCits.sort((a, b) => b.length - a.length); // longest first to avoid partial matches

  const tokenMap = {};
  allCits.forEach((cit, i) => { tokenMap[cit] = `CITTOKEN${i}END`; });

  // Pass 1: replace all citation brackets with tokens
  for (const [cit, token] of Object.entries(tokenMap)) {
    xml = xml.split(cit).join(token);
  }
  // Pass 2: replace each token with remapped citation
  for (const [cit, token] of Object.entries(tokenMap)) {
    xml = xml.split(token).join(remapCitGroup(cit));
  }
  if (xml.includes('CITTOKEN')) throw new Error('Leftover CITTOKEN — renumbering incomplete');
  console.log('OK Step 1: Citations renumbered in body text');

  // ── Step 2: Insert new list paragraph before the skim-milk item ──────────
  const listAnchorIdx = xml.indexOf(NEW_LIST_ANCHOR);
  if (listAnchorIdx < 0) throw new Error('ANCHOR NOT FOUND: skim-milk paragraph (paraId 4FDA03BC)');
  // Walk back to the start of the <w:p> tag
  const pStart = xml.lastIndexOf('<w:p ', listAnchorIdx);
  if (pStart < 0 || listAnchorIdx - pStart > 200) {
    // Fallback: check that '<w:p ' tag is actually at pStart
    throw new Error('Could not find <w:p start for skim-milk paragraph');
  }
  // Verify the tag is actually <w:p (not <w:pPr or <w:pStyle)
  const tagCheck = xml.slice(pStart, pStart + 5);
  if (tagCheck !== '<w:p ') throw new Error('Walk-back landed on wrong tag: ' + tagCheck);
  xml = xml.slice(0, pStart) + NEW_LIST_PARA + xml.slice(pStart);
  console.log('OK Step 2: New list item inserted before "Add skim milk powder" paragraph');

  // ── Step 3: Renumber bibliography bold labels (temp marker technique) ────
  // Labels appear as: <w:t xml:space="preserve">N.  </w:t>
  // Process from highest to lowest to avoid collision
  for (let old = 21; old >= 10; old--) {
    const newNum = NUM_MAP[old];
    const patterns = [
      `<w:t xml:space="preserve">${old}.  </w:t>`,
      `<w:t xml:space="preserve">${old}. </w:t>`,
      `<w:t>${old}.  </w:t>`,
      `<w:t>${old}. </w:t>`,
    ];
    let found = false;
    for (const pat of patterns) {
      if (xml.includes(pat)) {
        // Use a temp token to avoid cascades (e.g. "10.→14." then "14.→15.")
        const token = `BIBTMP${old}BIBTMPEND`;
        xml = xml.split(pat).join(token);
        found = true;
        break;
      }
    }
    if (!found) console.warn(`  WARNING: bibliography label "${old}." not found`);
  }
  // Now replace tokens with new labels
  for (let old = 21; old >= 10; old--) {
    const newNum = NUM_MAP[old];
    const token = `BIBTMP${old}BIBTMPEND`;
    if (xml.includes(token)) {
      // Use xml:space="preserve" to match the format we set the token on
      const newLabel = `<w:t xml:space="preserve">${newNum}.  </w:t>`;
      xml = xml.split(token).join(newLabel);
      console.log(`  Relabeled bibliography: ${old}. → ${newNum}.`);
    }
  }
  console.log('OK Step 3: Bibliography labels renumbered');

  // ── Step 4: Reorder bibliography paragraphs physically ───────────────────
  // Extract all bib paragraphs (hanging indent 504) and rebuild in number order
  const paraRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  const allParas = [...xml.matchAll(paraRe)];
  const bibParas = [];
  for (const m of allParas) {
    if (m[0].includes('w:left="504"') && m[0].includes('w:hanging="504"')) {
      const labelMatch = m[0].match(/<w:t[^>]*>(\d+)\.\s+<\/w:t>/);
      const num = labelMatch ? parseInt(labelMatch[1]) : 999;
      bibParas.push({ num, xml: m[0], index: m.index });
    }
  }
  if (bibParas.length !== 21) throw new Error(`Expected 21 bib paragraphs, found ${bibParas.length}`);

  // Sort by number
  const sorted = [...bibParas].sort((a, b) => a.num - b.num);
  const numbersBeforeSort = bibParas.map(p => p.num).join(', ');
  const numbersAfterSort  = sorted.map(p => p.num).join(', ');
  console.log('  Before sort:', numbersBeforeSort);
  console.log('  After sort: ', numbersAfterSort);

  // Build the sorted bibliography block XML
  const sortedBlock = sorted.map(p => p.xml).join('');

  // Find the original block in XML (from first to last bib paragraph)
  const firstBibStart = bibParas[0].index;
  const lastBibEnd = bibParas[bibParas.length - 1].index + bibParas[bibParas.length - 1].xml.length;
  const originalBlock = xml.slice(firstBibStart, lastBibEnd);
  xml = xml.slice(0, firstBibStart) + sortedBlock + xml.slice(lastBibEnd);
  console.log('OK Step 4: Bibliography paragraphs reordered');

  // ── Step 5: Insert new Bist et al. bibliography entry at position 13 ─────
  // Find label "12.  " paragraph (now in correct sorted position) and insert after it
  const label12 = `<w:t xml:space="preserve">12.  </w:t>`;
  const label12Idx = xml.indexOf(label12);
  if (label12Idx < 0) throw new Error('ANCHOR NOT FOUND: bibliography label "12.  "');
  // Find the end of that paragraph
  const para12End = xml.indexOf('</w:p>', label12Idx) + '</w:p>'.length;
  // Insert Bist entry after this paragraph
  xml = xml.slice(0, para12End) + BIST_PARA + xml.slice(para12End);
  console.log('OK Step 5: Bist et al. bibliography entry inserted as [13]');

  // ── SAX validation ────────────────────────────────────────────────────────
  saxValidate(xml);
  console.log('\nSAX validation: PASS');

  // ── Write output ──────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\nDone. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log('\nCitation renumbering summary:');
  console.log('  Old [10] (Ojkic)      → new [14]');
  console.log('  Old [11] (Water-Vax)  → new [10]');
  console.log('  Old [12]              → new [11]');
  console.log('  Old [13]              → new [12]');
  console.log('  NEW  (Bist et al.)    → new [13]');
  console.log('  Old [14]–[21]         → new [15]–[22]');
}

run().catch(e => { console.error(e); process.exit(1); });
