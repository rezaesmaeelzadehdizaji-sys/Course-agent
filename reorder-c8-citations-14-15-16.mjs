// reorder-c8-citations-14-15-16.mjs
// Fixes citation order violation: [16] first appears before [14] and [15]
// Correct mapping based on first-appearance scan:
//   Old [14] (Al-Rasheed IBV study)  → new [15]
//   Old [15] (Andreasen ILT study)   → new [16]
//   Old [16] (CPC ILT Disease Profile) → new [14]

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const JSZip = require('./node_modules/jszip/dist/jszip.js');
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';

const remap = { 14: 15, 15: 16, 16: 14 };

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ----------------------------------------------------------------
  // STEP 1: Remap all in-text citation brackets [N] and [N,M,...]
  // Use regex to replace whole brackets at once (no collision risk)
  // ----------------------------------------------------------------
  let bracketChanges = 0;
  xml = xml.replace(/\[(\d+(?:,\d+)*)\]/g, (match, nums) => {
    const parts = nums.split(',').map(n => {
      const num = parseInt(n);
      return remap[num] !== undefined ? remap[num] : num;
    });
    // Only count if something changed
    const newMatch = '[' + parts.join(',') + ']';
    if (newMatch !== match) bracketChanges++;
    return newMatch;
  });
  console.log('In-text brackets remapped:', bracketChanges);

  // ----------------------------------------------------------------
  // STEP 2: Remap bibliography bold labels using temp-marker technique
  // Labels appear as:  preserve">14.  </w:t>
  // Process highest to lowest to avoid collision
  // ----------------------------------------------------------------
  const labelFormat = (n) => `preserve">${n}.  </w:t>`;
  const tmpFormat   = (n) => `preserve">TMP${String(n).padStart(3,'0')}.  </w:t>`;

  // Pass 1: all affected labels → temp markers
  for (const old of [16, 15, 14]) {
    if (xml.includes(labelFormat(old))) {
      xml = xml.split(labelFormat(old)).join(tmpFormat(old));
      console.log('  Label', old, '→ TMP' + old);
    } else {
      console.error('  NOT FOUND: label', old);
    }
  }

  // Pass 2: temp markers → new numbers
  for (const [old, newN] of [[16,14],[15,16],[14,15]]) {
    xml = xml.split(tmpFormat(old)).join(labelFormat(newN));
    console.log('  TMP' + old + ' → label', newN);
  }

  // Verify no TMP markers remain
  const tmpLeft = (xml.match(/TMP\d{3}\.  /g) || []).length;
  if (tmpLeft > 0) {
    console.error('FAIL: ' + tmpLeft + ' TMP markers remain');
    process.exit(1);
  }
  console.log('TMP markers remaining:', tmpLeft, '(must be 0)');

  // ----------------------------------------------------------------
  // STEP 3: Physically reorder bibliography paragraphs 14, 15, 16
  // Currently they sit in order [14=Al-Rasheed, 15=Andreasen, 16=CPC ILT]
  // After label swap they will have:  [15=Al-Rasheed, 16=Andreasen, 14=CPC ILT]
  // So the paragraph with label "14.  " (CPC ILT) now sits AFTER the ones
  // labeled "15." and "16." — we need to move "14." to come first.
  // ----------------------------------------------------------------

  function extractBibPara(label) {
    const anchor = `preserve">${label}.  </w:t>`;
    const anchorIdx = xml.indexOf(anchor);
    if (anchorIdx === -1) { console.error('NOT FOUND in bib:', label); process.exit(1); }
    const pStart = xml.lastIndexOf('<w:p ', anchorIdx);
    const pEnd = xml.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
    return { start: pStart, end: pEnd, text: xml.substring(pStart, pEnd) };
  }

  const p14 = extractBibPara(14); // CPC ILT (was old [16])
  const p15 = extractBibPara(15); // Al-Rasheed (was old [14])
  const p16 = extractBibPara(16); // Andreasen (was old [15])

  // Verify current physical order
  if (p14.start < p15.start) {
    console.log('Paragraphs already in correct order — no physical reorder needed');
  } else {
    // p15 and p16 come before p14 physically — reorder to p14, p15, p16
    // The block starts at p15.start and ends at p14.end (since 15 is first physically)
    const blockStart = Math.min(p14.start, p15.start, p16.start);
    const blockEnd   = Math.max(p14.end,   p15.end,   p16.end);

    const newBlock = p14.text + p15.text + p16.text;
    xml = xml.substring(0, blockStart) + newBlock + xml.substring(blockEnd);
    console.log('Bibliography paragraphs physically reordered: 14, 15, 16');
  }

  // ----------------------------------------------------------------
  // STEP 4: Validate
  // ----------------------------------------------------------------
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) { console.error('FAIL: unescaped &'); process.exit(1); }

  // Re-check first-appearance order
  const joined = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(m => m[1]).join('');
  const firstApp = {};
  for (const m of [...joined.matchAll(/\[(\d+(?:,\d+)*)\]/g)]) {
    for (const n of m[1].split(',').map(Number)) {
      if (firstApp[n] === undefined) firstApp[n] = m.index;
    }
  }
  const sorted = Object.entries(firstApp)
    .map(([n, p]) => ({ n: parseInt(n), p }))
    .sort((a,b) => a.p - b.p)
    .map(x => x.n);
  console.log('\nFinal first-appearance order:', sorted.join(', '));
  let ok = true;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] > sorted[i+1]) {
      console.error('ORDER VIOLATION: [' + sorted[i] + '] before [' + sorted[i+1] + ']');
      ok = false;
    }
  }
  if (ok) console.log('Citation order: SEQUENTIAL — all good.');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('\nSaved:', buf.length.toLocaleString(), 'bytes');
  console.log('\nRemapping summary: old [16] → new [14], old [14] → new [15], old [15] → new [16]');
})();
