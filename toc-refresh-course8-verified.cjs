// toc-refresh-course8-verified.cjs
// Applies the exhaustively-verified page-number mapping in course8_final_toc.json
// (built by direct exact/prefix matching against the freshly-rendered PDF, with two
// entries resolved by manual page inspection) to the cached TOC field in the docx.
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const DOCX = path.join(__dirname, 'Course 8', 'RV-revised-NB-edited course 8 draft.docx');
const MAPPING = JSON.parse(fs.readFileSync(path.join(__dirname, 'course8_final_toc.json'), 'utf8'));

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(DOCX));
  let xml = await zip.file('word/document.xml').async('string');

  const sdtM = xml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
  if (!sdtM) throw new Error('no SDT/TOC');
  let sdt = sdtM[0];

  let updated = 0, unchanged = 0, missed = [];
  sdt = sdt.replace(/<w:hyperlink[^>]*>([\s\S]*?)<\/w:hyperlink>/g, (full, inner) => {
    const ts = [...inner.matchAll(/<w:t(?:[^>]*)?>([^<]*)<\/w:t>/g)];
    if (ts.length < 2) return full;
    const entryText = ts[0][1];
    const mapEntry = MAPPING.find(e => e.text === entryText);
    if (!mapEntry) { missed.push(entryText); return full; }
    const target = String(mapEntry.actual);
    const lastT = ts[ts.length - 1];
    const lastFull = lastT[0];
    if (lastT[1] === target) { unchanged++; return full; }
    const lastIdx = inner.lastIndexOf(lastFull);
    const newInner = inner.slice(0, lastIdx) + lastFull.replace(/>([^<]*)</, `>${target}<`) + inner.slice(lastIdx + lastFull.length);
    updated++;
    return full.replace(inner, newInner);
  });

  xml = xml.replace(sdtM[0], sdt);

  if ((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g) || []).length) throw new Error('unescaped &');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash present');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty present');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(DOCX, buf);
  console.log('TOC entries updated:', updated, '| unchanged (already correct):', unchanged);
  if (missed.length) { console.log('NOT MATCHED (left as-is):', missed.join(' | ')); process.exitCode = 1; }
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
