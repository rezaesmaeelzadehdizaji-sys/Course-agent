import JSZip from 'jszip';
import fs from 'fs';

const FILE = 'Course 9/The_Value_of_Poultry_Diagnostics.docx';
const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
let xml = await zip.file('word/document.xml').async('string');

// anchor -> new page (from LibreOffice render, 22 pages)
const pages = {
  _Toc00100000: 3,  // Introduction
  _Toc00100001: 3,  // Learning Objectives
  _Toc00100002: 4,  // Section 1
  _Toc00100003: 4,  // 1.1
  _Toc00100004: 5,  // 1.2
  _Toc00100005: 7,  // Section 2
  _Toc00100006: 7,  // 2.1
  _Toc00100007: 9,  // 2.2
  _Toc00100008: 12, // Section 3
  _Toc00100009: 12, // 3.1
  _Toc00100010: 12, // 3.2
  _Toc00100011: 12, // 3.3
  _Toc00100012: 14, // Section 4
  _Toc00100013: 14, // 4.1
  _Toc00100014: 14, // 4.2
  _Toc00100015: 14, // 4.3
  _Toc00100016: 15, // 4.4
  _Toc00100017: 17, // Section 5
  _Toc00100018: 17, // 5.1
  _Toc00100019: 18, // 5.2
  _Toc00100020: 19, // Journals
  _Toc00100021: 20, // References
};

let changed = 0;
for (const [anchor, page] of Object.entries(pages)) {
  const re = new RegExp('(<w:hyperlink w:anchor="' + anchor + '"[^>]*>[\\s\\S]*?<w:tab/><w:t>)\\d+(</w:t></w:r></w:hyperlink>)');
  if (!re.test(xml)) throw new Error('anchor row not found: ' + anchor);
  xml = xml.replace(re, `$1${page}$2`);
  changed++;
}
console.log('TOC rows updated:', changed);

// verify no dirty, updateFields false
zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(FILE, buf);

// report new cached values
const rows = [...xml.matchAll(/<w:hyperlink w:anchor="(_Toc\d+)"[^>]*>[\s\S]*?<w:t>([^<]+)<\/w:t><\/w:r><\/w:hyperlink>/g)];
rows.forEach(r => console.log(r[1], '->', r[2]));
console.log('WROTE', buf.length, 'bytes');
