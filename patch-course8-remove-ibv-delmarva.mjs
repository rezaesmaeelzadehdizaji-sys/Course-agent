// patch-course8-remove-ibv-delmarva.mjs
//
// 1. Removes the IBV Delmarva/spread sentences from §1.2 (too technical for farmers)
// 2. Fixes [9,10] → [9] (the other place ref 10 was cited)
// 3. Deletes bibliography entry [10] (Ojkic et al. 2024)
// 4. Renumbers all citations [11]→[10] through [21]→[20] in text and bibliography

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// Number mapping: old → new (null = deleted)
const NUM_MAP = {};
for (let i = 1; i <= 9; i++) NUM_MAP[i] = i;
NUM_MAP[10] = null; // deleted
for (let i = 11; i <= 21; i++) NUM_MAP[i] = i - 1;

function remapCitGroup(match) {
  const nums = match.slice(1, -1).split(',').map(n => parseInt(n.trim()));
  const remapped = nums.map(n => NUM_MAP[n]).filter(n => n !== null);
  if (remapped.length === 0) return '';
  return '[' + remapped.join(',') + ']';
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── Step 1: Remove the IBV spread/Delmarva sentences from §1.2 ────────────
  const deletedText = ' Once IBV gets into an unvaccinated house, it spreads fast and can hit close to 100% of the flock. In Canada, the licensed vaccines are built around Massachusetts and Connecticut strains, but the dominant field strains have shifted. The Delmarva strain has made up more than half of genotyped field isolates in recent years in Eastern provinces, so knowing what’s circulating in your region is key when planning your program [10].';
  if (!xml.includes(deletedText)) {
    throw new Error('ANCHOR NOT FOUND: Delmarva sentence. No file written.');
  }
  xml = xml.split(deletedText).join('');
  console.log('OK Step 1: Removed Delmarva/IBV spread sentences');

  // ── Step 2: Fix [9,10] → [9] in the BC-regional-strain sentence ──────────
  const old910 = '[9,10]';
  if (!xml.includes(old910)) {
    throw new Error('ANCHOR NOT FOUND: [9,10] citation. No file written.');
  }
  const count910 = xml.split(old910).length - 1;
  if (count910 > 1) throw new Error(`[9,10] not unique (${count910}x). No file written.`);
  xml = xml.split(old910).join('[9]');
  console.log('OK Step 2: [9,10] → [9]');

  // ── Step 3: Delete the bibliography paragraph for ref [10] ───────────────
  // Identify by its bold label "10." inside a hanging-indent paragraph
  const paraRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  let ref10Para = null;
  const matches = [...xml.matchAll(paraRe)];
  for (const m of matches) {
    if (m[0].includes('w:left="504"') && m[0].includes('w:hanging="504"')) {
      const text = [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('');
      if (/^10\.\s/.test(text.trim()) && text.includes('Ojkic')) {
        ref10Para = m[0];
        break;
      }
    }
  }
  if (!ref10Para) throw new Error('ANCHOR NOT FOUND: bibliography entry [10] (Ojkic). No file written.');
  xml = xml.replace(ref10Para, '');
  console.log('OK Step 3: Removed bibliography entry [10] (Ojkic et al. 2024)');

  // ── Step 4: Renumber [11]→[10] through [21]→[20] everywhere ─────────────
  // Use temp markers to avoid cascade collisions (process longest first)
  // Pass 1 – replace each citation bracket with a temp token
  const citRe = /\[\d+(?:,\d+)*\]/g;
  const allCits = [...new Set([...xml.matchAll(citRe)].map(m => m[0]))];
  // Sort by length desc so multi-number groups are replaced before single numbers
  allCits.sort((a, b) => b.length - a.length);

  const tokenMap = {};
  allCits.forEach((cit, i) => {
    tokenMap[cit] = `CITTOKEN${i}END`;
  });
  // Apply tokens
  for (const [cit, token] of Object.entries(tokenMap)) {
    xml = xml.split(cit).join(token);
  }
  // Pass 2 – replace each token with remapped citation
  for (const [cit, token] of Object.entries(tokenMap)) {
    const newCit = remapCitGroup(cit);
    xml = xml.split(token).join(newCit);
  }
  // Verify no tokens left
  if (xml.includes('CITTOKEN')) throw new Error('Leftover CITTOKEN in XML — renumbering incomplete.');
  console.log('OK Step 4: Citations renumbered [11]→[10] through [21]→[20]');

  // ── Step 5: Renumber bibliography bold labels (e.g. "11.  " → "10.  ") ───
  for (let old = 21; old >= 11; old--) {
    const newNum = old - 1;
    // Bold label pattern: "N.  " at the start of the paragraph text
    // In XML it appears as a bold run: <w:t>N.  </w:t> (with b/bCs)
    // Use the unique string with the specific number
    const oldLabel = `<w:t>${old}.  </w:t>`;
    const newLabel = `<w:t>${newNum}.  </w:t>`;
    if (xml.includes(oldLabel)) {
      xml = xml.split(oldLabel).join(newLabel);
      console.log(`  Relabeled bibliography: ${old}. → ${newNum}.`);
    } else {
      // Try without double space
      const oldLabel2 = `<w:t>${old}. </w:t>`;
      const newLabel2 = `<w:t>${newNum}. </w:t>`;
      if (xml.includes(oldLabel2)) {
        xml = xml.split(oldLabel2).join(newLabel2);
        console.log(`  Relabeled bibliography (single space): ${old}. → ${newNum}.`);
      } else {
        console.warn(`  WARNING: bibliography label "${old}." not found as standalone run`);
      }
    }
  }

  // ── SAX validation ────────────────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
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
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('\nSAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\nDone. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
