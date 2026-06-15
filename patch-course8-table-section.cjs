// patch-course8-table-section.cjs
// Lift Table 6.1 out of Section 6 (In-Ovo) into its own standalone reference section.
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const HEAD = 'Quick Reference: Vaccines by Disease and Delivery Route';
const ANCHOR = '_Toc231132543';
const BMID = 59;
const RPR = '<w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/><w:noProof/><w:kern w:val="2"/><w:sz w:val="24"/><w:szCs w:val="24"/><w14:ligatures w14:val="standardContextual"/></w:rPr>';

function tocRow(style, anchor, text, page) {
  return `<w:p w14:paraId="52000001" w14:textId="52000001" w:rsidR="008C3A67" w:rsidRDefault="008C3A67">` +
    `<w:pPr><w:pStyle w:val="${style}"/>${RPR}</w:pPr>` +
    `<w:hyperlink w:anchor="${anchor}" w:history="1">` +
      `<w:r w:rsidRPr="00542FD8"><w:rPr><w:rStyle w:val="Hyperlink"/><w:noProof/></w:rPr><w:t>${text}</w:t></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:instrText xml:space="preserve"> PAGEREF ${anchor} \\h </w:instrText></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:t>${page}</w:t></w:r>` +
      `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>` +
    `</w:hyperlink></w:p>`;
}

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  if (xml.includes(ANCHOR)) throw new Error('anchor already present');
  if (xml.includes(`w:id="${BMID}"`)) throw new Error('bookmark id already present');

  // 1. page break + new H1 (bookmarked) inserted right before the "One page, every method." lead
  const inovoEnd = 'Hatchery Management and Incubation Biology course in this series.</w:t></w:r></w:p>';
  if (xml.split(inovoEnd).length - 1 !== 1) throw new Error('in-ovo anchor not unique');
  const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  const h1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:bookmarkStart w:id="${BMID}" w:name="${ANCHOR}"/><w:r><w:t xml:space="preserve">${HEAD}</w:t></w:r><w:bookmarkEnd w:id="${BMID}"/></w:p>`;
  xml = xml.replace(inovoEnd, inovoEnd + pageBreak + h1);

  // 2. rename caption label "Table 6.1: " -> "Summary table: "
  const oldCap = '<w:t xml:space="preserve">Table 6.1: </w:t>';
  if (!xml.includes(oldCap)) throw new Error('caption label not found');
  xml = xml.replace(oldCap, '<w:t xml:space="preserve">Summary table: </w:t>');

  // 3. insert a TOC1 row after the Section 6 TOC entry (page set provisionally; refreshed later)
  const sec6Re = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?w:val="TOC1"[\s\S]*?>Section 6: In-Ovo Vaccination<[\s\S]*?<\/w:p>/;
  const m = xml.match(sec6Re);
  if (!m) throw new Error('Section 6 TOC row not found');
  xml = xml.replace(m[0], m[0] + tocRow('TOC1', ANCHOR, HEAD, 44));

  // validate
  if ((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g) || []).length) throw new Error('unescaped &');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty introduced');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash');

  zip.file('word/document.xml', xml);
  fs.writeFileSync(SRC, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('Table moved into its own "' + HEAD + '" section; caption relabeled; TOC entry added.');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
