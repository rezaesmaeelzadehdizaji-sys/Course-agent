// renumber-course8.cjs
// Restore Vancouver first-appearance order after [5,16] were cited in the Introduction.
// old -> new mapping (1,2,3 and 17-24 unchanged):
//   5->4, 16->5, 4->6, 6->7, 7->8, 8->9, 9->10, 10->11, 11->12, 12->13, 13->14, 14->15, 15->16
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const MAP = {1:1,2:2,3:3,4:6,5:4,6:7,7:8,8:9,9:10,10:11,11:12,12:13,13:14,14:15,15:16,16:5,17:17,18:18,19:19,20:20,21:21,22:22,23:23,24:24};

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  const refIdx = xml.lastIndexOf('References');
  let body = xml.slice(0, refIdx);
  let tail = xml.slice(refIdx);

  // ---- 1. Remap in-text [n] and [n,m,...] in the body (before References) ----
  let intextCount = 0;
  body = body.replace(/\[([0-9][0-9,\s]*)\]/g, (full, inner) => {
    const nums = inner.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    const mapped = nums.map(n => { if (!(n in MAP)) throw new Error('Unmapped citation ' + n); return MAP[n]; });
    mapped.sort((a, b) => a - b);
    intextCount++;
    return '[' + mapped.join(',') + ']';
  });

  // ---- 2. Renumber + physically reorder the bibliography paragraphs (in tail) ----
  // Bib paragraphs: contain hanging="504" and a bold blue label run "N.  "
  const paraRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
  const labelRe = /(<w:rPr><w:b\/><w:bCs\/><w:color w:val="2E74B5"\/><w:sz w:val="22"\/><w:szCs w:val="22"\/><\/w:rPr>(?:<[^>]*\/>)*<w:t xml:space="preserve">)(\d+)(\.  <\/w:t>)/;

  // collect bib paragraphs in order with their span
  const bibParas = [];
  let m;
  while ((m = paraRe.exec(tail))) {
    const block = m[0];
    if (/w:hanging="504"/.test(block) && labelRe.test(block)) {
      bibParas.push({ start: m.index, end: m.index + block.length, block });
    }
  }
  if (bibParas.length !== 24) throw new Error('Expected 24 bib paragraphs, found ' + bibParas.length);

  // verify they are contiguous
  for (let i = 1; i < bibParas.length; i++) {
    if (bibParas[i].start !== bibParas[i - 1].end) throw new Error('Bib paragraphs not contiguous at ' + i);
  }
  const blockStart = bibParas[0].start;
  const blockEnd = bibParas[bibParas.length - 1].end;

  // relabel each paragraph to its new number
  const relabeled = bibParas.map(bp => {
    const old = parseInt(bp.block.match(labelRe)[2], 10);
    const neu = MAP[old];
    const newBlock = bp.block.replace(labelRe, (f, a, n, c) => a + neu + c);
    return { neu, block: newBlock };
  });
  // sort by new number, reassemble
  relabeled.sort((a, b) => a.neu - b.neu);
  const newNums = relabeled.map(r => r.neu);
  const expected = Array.from({length:24}, (_,i)=>i+1);
  if (JSON.stringify(newNums) !== JSON.stringify(expected)) throw new Error('Bib renumber not 1..24: ' + newNums.join(','));
  const newBibBlock = relabeled.map(r => r.block).join('');

  tail = tail.slice(0, blockStart) + newBibBlock + tail.slice(blockEnd);

  xml = body + tail;

  // ---- validation ----
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & (' + bad.length + ')');
  if ((xml.match(/—/g) || []).length) throw new Error('Em dash present');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty present');

  // re-check first-appearance order
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

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Bibliography reordered 1..24. Written:', SRC, '-', (buf.length/1024).toFixed(1), 'KB');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
