// toc-refresh-course8-v3.cjs: rewrite cached TOC page numbers from a LibreOffice-rendered PDF.
// Usage: node toc-refresh-course8-v3.cjs "<docx>" "<pdftotext output .txt>"
// Walks the TOC rows in order and finds each heading on or after the previous heading's page,
// matching on the first 28 normalized characters so headings that wrap in the PDF still match.
const JSZip = require('jszip');
const fs = require('fs');
const [DOCX, TXT] = process.argv.slice(2);
const norm = s => s.replace(/&amp;/g, '&').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

(async () => {
  const pages = fs.readFileSync(TXT, 'utf8').split('\f').map(p => p.split('\n').map(norm).filter(Boolean));
  const zip = await JSZip.loadAsync(fs.readFileSync(DOCX));
  let xml = await zip.file('word/document.xml').async('string');
  const sdt = xml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/)[0];
  // body starts after the TOC: first page (after page 2) whose lines include "introduction" as a heading line
  let cursor = pages.findIndex((p, i) => i >= 1 && p.includes('introduction'));   // TOC rows read "introduction 3", so only the heading line matches exactly
  if (cursor < 0) throw new Error('Introduction page not found');
  let changed = 0; const missed = [];
  const newSdt = sdt.replace(/<w:hyperlink[^>]*>([\s\S]*?)<\/w:hyperlink>/g, (full, inner) => {
    const ts = [...inner.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)];
    const entry = norm(ts[0][1]);
    const oldPage = ts[ts.length - 1][1];
    if (entry === 'table of contents') return full;
    const key = entry.slice(0, 28);
    let found = -1;
    for (let i = cursor; i < pages.length; i++) {
      if (pages[i].some(l => l.startsWith(key))) { found = i; break; }
    }
    if (found < 0) { missed.push(entry); return full; }
    cursor = found;
    const newPage = String(found + 1);
    if (newPage === oldPage) return full;
    changed++;
    console.log(`  ${entry.slice(0, 60).padEnd(60)} ${oldPage} -> ${newPage}`);
    const last = ts[ts.length - 1];
    const idx = inner.lastIndexOf(last[0]);
    const newInner = inner.slice(0, idx) + last[0].replace(`>${oldPage}<`, `>${newPage}<`) + inner.slice(idx + last[0].length);
    return full.replace(inner, newInner);
  });
  if (missed.length) { console.log('NOT FOUND:', missed); process.exitCode = 2; }
  xml = xml.replace(sdt, newSdt);
  zip.file('word/document.xml', xml);
  fs.writeFileSync(DOCX, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log(`TOC rows updated: ${changed}`);
})();
