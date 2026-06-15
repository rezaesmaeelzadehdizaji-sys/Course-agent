// patch-course8-toc-intro.cjs — add the two new Introduction Heading2s to the TOC.
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

const RPR = '<w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/><w:noProof/><w:kern w:val="2"/><w:sz w:val="24"/><w:szCs w:val="24"/><w14:ligatures w14:val="standardContextual"/></w:rPr>';

function tocRow(paraId, anchor, text, page) {
  return `<w:p w14:paraId="${paraId}" w14:textId="${paraId}" w:rsidR="008C3A67" w:rsidRDefault="008C3A67">` +
    `<w:pPr><w:pStyle w:val="TOC2"/>${RPR}</w:pPr>` +
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

  const items = [
    { text: 'Vaccination Versus Immunity: A Short Primer', anchor: '_Toc231132541', id: 57, page: 5, paraId: '51000001' },
    { text: 'Learning Objectives',                          anchor: '_Toc231132542', id: 58, page: 7, paraId: '51000002' },
  ];

  // safety: anchors/ids must be unused
  items.forEach(it => {
    if (xml.includes(it.anchor)) throw new Error('anchor already present: ' + it.anchor);
    if (xml.includes(`w:id="${it.id}"`)) throw new Error('bookmark id already present: ' + it.id);
  });

  // 1. wrap each heading paragraph with a bookmark
  items.forEach(it => {
    const before = `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${it.text}</w:t></w:r></w:p>`;
    const after  = `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:bookmarkStart w:id="${it.id}" w:name="${it.anchor}"/><w:r><w:t xml:space="preserve">${it.text}</w:t></w:r><w:bookmarkEnd w:id="${it.id}"/></w:p>`;
    if (xml.split(before).length - 1 !== 1) throw new Error('heading not uniquely found: ' + it.text);
    xml = xml.replace(before, after);
  });

  // 2. insert the two TOC2 rows right after the Introduction TOC1 paragraph
  const introRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?w:val="TOC1"[\s\S]*?>Introduction<[\s\S]*?<\/w:p>/;
  const m = xml.match(introRe);
  if (!m) throw new Error('Introduction TOC1 row not found');
  const rows = tocRow(items[0].paraId, items[0].anchor, items[0].text, items[0].page) +
               tocRow(items[1].paraId, items[1].anchor, items[1].text, items[1].page);
  xml = xml.replace(m[0], m[0] + rows);

  // validate
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('unescaped & (' + bad.length + ')');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty introduced');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash');

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log('Added 2 TOC entries (Primer p5, Learning Objectives p7) + bookmarks. Written.');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
