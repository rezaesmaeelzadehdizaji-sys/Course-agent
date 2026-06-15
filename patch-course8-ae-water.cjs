// patch-course8-ae-water.cjs
// Add Avian Encephalomyelitis (AE) drinking-water vaccination to Section 1.2,
// and restore the table AE row to "Drinking water; wing web" / "Sections 1, 4".
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // 1. AE bullet in Section 1.2 (insert after the Coccidiosis bullet)
  const aeBullet =
    '<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>' +
    '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t>Avian Encephalomyelitis (AE)</w:t></w:r>' +
    '<w:r><w:t xml:space="preserve">: A virus that hits the nervous system of young chicks, causing trembling, weak legs, and poor coordination. The bigger problem shows up in breeder and layer pullets that are not protected before lay: the virus passes through the egg, hatchability drops, and infected chicks show nervous signs. A live AE vaccine given in the drinking water to breeder and layer pullets, usually somewhere between 10 and 15 weeks of age and well before lay, builds the immunity that protects the next generation through the egg [4,5]. Wing web is the other route used for AE, covered in Section 4.</w:t></w:r></w:p>';

  const cocAnchor = 'Protocols vary and need veterinary guidance.</w:t></w:r></w:p>';
  if (xml.split(cocAnchor).length - 1 !== 1) throw new Error('Coccidiosis bullet anchor not unique');
  xml = xml.replace(cocAnchor, cocAnchor + aeBullet);

  // 2. Update the AE table row: route "Wing web" -> "Drinking water; wing web", "Section 4" -> "Sections 1, 4"
  const tblStart = xml.indexOf('<w:tbl>', xml.indexOf('Main delivery route(s)') - 5000);
  const ae = xml.indexOf('Avian Encephalomyelitis (AE)', xml.indexOf('Main delivery route(s)'));
  const trStart = xml.lastIndexOf('<w:tr>', ae);
  const trEnd = xml.indexOf('</w:tr>', ae) + '</w:tr>'.length;
  let row = xml.slice(trStart, trEnd);
  if (!row.includes('<w:t xml:space="preserve">Wing web</w:t>') || !row.includes('<w:t xml:space="preserve">Section 4</w:t>'))
    throw new Error('AE row cells not as expected');
  row = row.replace('<w:t xml:space="preserve">Wing web</w:t>', '<w:t xml:space="preserve">Drinking water; wing web</w:t>')
           .replace('<w:t xml:space="preserve">Section 4</w:t>', '<w:t xml:space="preserve">Sections 1, 4</w:t>');
  xml = xml.slice(0, trStart) + row + xml.slice(trEnd);

  // validate
  if ((xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g) || []).length) throw new Error('unescaped &');
  if ((xml.match(/w:dirty=/g) || []).length) throw new Error('w:dirty introduced');
  if ((xml.match(/—/g) || []).length) throw new Error('em dash');

  zip.file('word/document.xml', xml);
  fs.writeFileSync(SRC, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('Added AE water bullet to Section 1.2 and updated AE table row (Drinking water; wing web / Sections 1, 4).');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
