// patch-course8-reovirus.cjs — add a Reovirus row to Table 6.1 (after Mycoplasma).
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const B = '<w:tcBorders><w:top w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:left w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:bottom w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/><w:right w:val="single" w:sz="2" w:space="0" w:color="AAAAAA"/></w:tcBorders>';
function cell(w, text, center){
  const jc = center ? '<w:jc w:val="center"/>' : '';
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${B}<w:shd w:val="solid" w:color="FFFFFF" w:fill="auto"/></w:tcPr>`+
    `<w:p><w:pPr><w:spacing w:before="50" w:after="50"/>${jc}</w:pPr>`+
    `<w:r><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p></w:tc>`;
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  if ((xml.split('(MG, MS)').length - 1) !== 1) throw new Error('cannot uniquely locate Mycoplasma row');
  if (xml.includes('Reovirus (viral arthritis)')) throw new Error('Reovirus row already present');

  const row =
    '<w:tr>' +
    cell(2250, 'Reovirus (viral arthritis)', false) +
    cell(1500, 'Live and killed', true) +
    cell(3450, 'Injection (live and killed)', false) +
    cell(1440, 'Section 5', true) +
    '</w:tr>';

  // insert after the Mycoplasma row's </w:tr> (which is immediately before </w:tbl>)
  const mg = xml.indexOf('(MG, MS)');
  const rowEnd = xml.indexOf('</w:tr>', mg) + '</w:tr>'.length;
  if (xml.slice(rowEnd, rowEnd + 8) !== '</w:tbl>') throw new Error('Mycoplasma row is not the last row of the table');
  xml = xml.slice(0, rowEnd) + row + xml.slice(rowEnd);

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('unescaped & (' + bad.length + ')');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash present');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Reovirus row added to Table 6.1. Written:', (buf.length/1024).toFixed(1), 'KB');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
