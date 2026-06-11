// toc-refresh-course8.cjs — refresh cached TOC page numbers from rendered PDF text.
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const DOCX = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const TXT  = path.join(__dirname, 'Course 8', '_vax_pages.txt');

const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase();

(async () => {
  // 1. page text from pdftotext (\f separates pages)
  const pages = fs.readFileSync(TXT, 'latin1').split('\f');
  // build per-page set of normalized lines
  const pageLines = pages.map(p => p.split('\n').map(l => l.trim()).filter(Boolean));

  const zip = await JSZip.loadAsync(fs.readFileSync(DOCX));
  let xml = await zip.file('word/document.xml').async('string');

  const sdtM = xml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
  if (!sdtM) throw new Error('no SDT/TOC');
  let sdt = sdtM[0];

  // find the body start page = first page index whose line equals 'Introduction' (skip cover+toc)
  let updated = 0, missed = [];
  sdt = sdt.replace(/<w:hyperlink[^>]*>([\s\S]*?)<\/w:hyperlink>/g, (full, inner) => {
    // entry text = first <w:t> run; page = last <w:t> run
    const ts = [...inner.matchAll(/<w:t(?:[^>]*)?>([^<]*)<\/w:t>/g)];
    if (ts.length < 2) return full;
    const entryText = ts[0][1];
    const ne = norm(entryText);
    if (ne === 'table of contents') return full;
    // find first page (index>=3 => page>=4, skip cover & toc) with a line equal to entry text
    let foundPage = null;
    for (let i = 3; i < pageLines.length; i++) {
      if (pageLines[i].some(l => norm(l) === ne)) { foundPage = i + 1; break; }
    }
    if (foundPage == null) { missed.push(entryText); return full; }
    // replace the LAST <w:t>...</w:t> (the page number) with foundPage
    const lastT = ts[ts.length - 1];
    const lastFull = lastT[0];
    const lastIdx = inner.lastIndexOf(lastFull);
    const newInner = inner.slice(0, lastIdx) + lastFull.replace(/>([^<]*)</, `>${foundPage}<`) + inner.slice(lastIdx + lastFull.length);
    updated++;
    return full.replace(inner, newInner);
  });

  xml = xml.replace(sdtM[0], sdt);

  if ((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g) || []).length) throw new Error('unescaped &');
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(DOCX, buf);
  console.log('TOC entries updated:', updated);
  if (missed.length) console.log('Not matched (kept old):', missed.join(' | '));
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
