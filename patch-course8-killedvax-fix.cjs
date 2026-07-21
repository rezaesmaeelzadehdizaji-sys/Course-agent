// patch-course8-killedvax-fix.cjs
// Fix: "Killed (inactivated) vaccines... by itself it gives a weaker immune 'signal.'"
// contradicted the "cornerstone of antibody-based protection" framing later in the same
// document (Section 5) and the corrected Course 15 immunology (live = cell-mediated/Type 1
// dominant, killed = antibody/humoral/Type 2 dominant). Reframe as division of labor,
// consistent with the "two arms" immunity framing already established in the Introduction.
//
// Also inserts a new reference (Merck Veterinary Manual, Types of Vaccines for Animals) as
// the new [4], and cascades every existing [4]-[24] up by one to [5]-[25], both in-text and
// in the physically-reordered bibliography.

const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'RV-revised-NB-edited course 8 draft.docx');

const OLD_TEXT =
  'use virus or bacteria that have been completely killed, then mixed with an oil that helps release the vaccine slowly in the bird\'s body. A killed vaccine cannot multiply or spread from bird to bird, so it is very safe and stable, but by itself it gives a weaker immune "signal." It works best as a booster after the flock has first been primed with a live vaccine, and it must be given by injection. The big advantage is strong, long-lasting antibodies in the blood (IgY), which layers and breeders need to stay ';

const NEW_TEXT =
  'use virus or bacteria that have been completely killed, then mixed with an oil that helps release the vaccine slowly in the bird\'s body. A killed vaccine cannot multiply or spread from bird to bird, so it is very safe and stable. It leans on the antibody arm of immunity rather than the cell-mediated arm, and on its own it usually needs an adjuvant and more than one dose to build a full response [NEWCOURSE8REF]. That is why it works best as a booster after the flock has first been primed with a live vaccine, and it must be given by injection. The big advantage is strong, long-lasting antibodies in the blood (IgY), which layers and breeders need to stay ';

// Citation cascade: 1-5 unchanged (all already first-appear earlier in the document,
// including the [4,5] at the end of the live-vaccine paragraph, which precedes this
// insertion point). New reference becomes [6]. 6..24 -> 7..25.
const MAP = {};
for (let n = 1; n <= 5; n++) MAP[n] = n;
for (let n = 6; n <= 24; n++) MAP[n] = n + 1;
const NEW_REF_NUM = 6;

const NEW_BIB_XML =
  '<w:p w14:paraId="7A3F2C11" w14:textId="77777777" w:rsidR="00997264" w:rsidRDefault="00CB7A09"><w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/><w:ind w:left="504" w:hanging="504"/></w:pPr><w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">' + NEW_REF_NUM + '.  </w:t></w:r><w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t>Merck Veterinary Manual. Types of Vaccines for Animals. Kenilworth, NJ: Merck &amp; Co.; 2026 [cited 2026 Jul]. Available from: merckvetmanual.com/pharmacology/vaccines-and-immunotherapy/types-of-vaccines-for-animals</w:t></w:r></w:p>';

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ---- 0. Apply the content fix ----
  if (!xml.includes(OLD_TEXT)) throw new Error('OLD_TEXT not found — has the source changed?');
  const occurrences = xml.split(OLD_TEXT).length - 1;
  if (occurrences !== 1) throw new Error('Expected exactly 1 occurrence of OLD_TEXT, found ' + occurrences);
  xml = xml.replace(OLD_TEXT, NEW_TEXT);

  const refIdx = xml.lastIndexOf('References');
  let body = xml.slice(0, refIdx);
  let tail = xml.slice(refIdx);

  // ---- 1. Remap in-text [n] and [n,m,...] in the body ----
  let intextCount = 0;
  body = body.replace(/\[([0-9][0-9,\s]*)\]/g, (full, inner) => {
    const nums = inner.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (nums.length === 0) return full;
    const mapped = nums.map(n => { if (!(n in MAP)) throw new Error('Unmapped citation ' + n); return MAP[n]; });
    mapped.sort((a, b) => a - b);
    intextCount++;
    return '[' + mapped.join(',') + ']';
  });

  // ---- 2. Renumber + physically reorder the bibliography, inserting the new [4] ----
  const paraRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  const labelRe = /(<w:rPr><w:b\/><w:bCs\/><w:color w:val="2E74B5"\/><w:sz w:val="22"\/><w:szCs w:val="22"\/><\/w:rPr>(?:<[^>]*\/>)*<w:t xml:space="preserve">)(\d+)(\.  <\/w:t>)/;

  const bibParas = [];
  let m;
  while ((m = paraRe.exec(tail))) {
    const block = m[0];
    if (/w:hanging="504"/.test(block) && labelRe.test(block)) {
      bibParas.push({ start: m.index, end: m.index + block.length, block });
    }
  }
  if (bibParas.length !== 24) throw new Error('Expected 24 bib paragraphs, found ' + bibParas.length);
  for (let i = 1; i < bibParas.length; i++) {
    if (bibParas[i].start !== bibParas[i - 1].end) throw new Error('Bib paragraphs not contiguous at ' + i);
  }
  const blockStart = bibParas[0].start;
  const blockEnd = bibParas[bibParas.length - 1].end;

  const relabeled = bibParas.map(bp => {
    const old = parseInt(bp.block.match(labelRe)[2], 10);
    const neu = MAP[old];
    const newBlock = bp.block.replace(labelRe, (f, a, n, c) => a + neu + c);
    return { neu, block: newBlock };
  });
  relabeled.push({ neu: NEW_REF_NUM, block: NEW_BIB_XML });
  relabeled.sort((a, b) => a.neu - b.neu);
  const newNums = relabeled.map(r => r.neu);
  const expected = Array.from({ length: 25 }, (_, i) => i + 1);
  if (JSON.stringify(newNums) !== JSON.stringify(expected)) throw new Error('Bib renumber not 1..25: ' + newNums.join(','));
  const newBibBlock = relabeled.map(r => r.block).join('');

  tail = tail.slice(0, blockStart) + newBibBlock + tail.slice(blockEnd);

  xml = body + tail;

  // ---- 3. Substitute the new-reference placeholder AFTER the numeric cascade remap ----
  if (!xml.includes('[NEWCOURSE8REF]')) throw new Error('Placeholder not found before substitution');
  xml = xml.replace(/\[NEWCOURSE8REF\]/g, '[' + NEW_REF_NUM + ']');
  if (xml.includes('[NEWCOURSE8REF]')) throw new Error('Placeholder still present after substitution');
  if (!xml.includes('weaker immune')) console.log('Old flawed phrase confirmed removed.');
  else throw new Error('Old flawed phrase still present!');
  if (xml.includes('leans on the antibody arm')) console.log('New corrected phrase confirmed present.');
  else throw new Error('New phrase not found after patch!');

  // ---- validation ----
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & (' + bad.length + ')');
  if ((xml.match(/—/g) || []).length) throw new Error('Em dash present');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty present');

  const checkBody = xml.slice(0, xml.lastIndexOf('References'));
  const seen = []; const f = {};
  const re = /\[([0-9][0-9,\s]*)\]/g; let mm;
  while ((mm = re.exec(checkBody))) {
    mm[1].split(',').map(s => parseInt(s.trim(), 10)).forEach(n => { if (!f[n]) { f[n] = 1; seen.push(n); } });
  }
  console.log('In-text citations remapped:', intextCount);
  console.log('First-appearance order now:', seen.join(', '));
  const ascending = seen.every((v, i) => i === 0 || v >= seen[i - 1]);
  console.log('Sequential ascending:', ascending);
  if (!ascending) throw new Error('First-appearance order still not sequential');
  if (seen[0] !== 1 || seen.length !== 25) throw new Error('Expected exactly 25 sequential refs 1..25, got: ' + seen.join(','));

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Written:', SRC, '-', (buf.length / 1024 / 1024).toFixed(2), 'MB');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
