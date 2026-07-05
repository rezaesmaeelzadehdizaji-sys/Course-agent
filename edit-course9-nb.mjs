import JSZip from 'jszip';
import fs from 'fs';

const SRC = 'Course 9/Revised Course 9 - Edited NB 06242026.docx';
const OUT = 'Course 9/The_Value_of_Poultry_Diagnostics.docx'; // final published name

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml = await zip.file('word/document.xml').async('string');

function must(find) {
  if (!xml.includes(find)) throw new Error('NOT FOUND: ' + find.slice(0, 80));
}
function rep(find, replace) {
  must(find);
  xml = xml.split(find).join(replace);
}

// ---- 1. NB grammar fix id6: "is" -> "are" + "It covers" -> "They cover" ----
rep(
  '<w:commentRangeStart w:id="6"/><w:r><w:t>is</w:t></w:r><w:r><w:t xml:space="preserve"> </w:t></w:r><w:commentRangeEnd w:id="6"/>',
  '<w:r><w:t>are</w:t></w:r><w:r><w:t xml:space="preserve"> </w:t></w:r>'
);
rep('much broader. It covers monitoring', 'much broader. They cover monitoring');

// ---- 2. NB grammar fix id10: "has to " -> "must " ----
rep(
  '<w:commentRangeStart w:id="10"/><w:r><w:t xml:space="preserve">has to </w:t></w:r><w:commentRangeEnd w:id="10"/>',
  '<w:r><w:t xml:space="preserve">must </w:t></w:r>'
);

// ---- 3. NB grammar fix id23: "wide spread " -> "wide range " ----
rep(
  '<w:commentRangeStart w:id="23"/><w:r><w:t xml:space="preserve">wide spread </w:t></w:r><w:commentRangeEnd w:id="23"/>',
  '<w:r><w:t xml:space="preserve">wide range </w:t></w:r>'
);

// ---- 4. British spelling: labour -> labor (remove the "u" run) ----
rep('<w:r w:rsidR="0088739D"><w:t>u</w:t></w:r>', '');

// ---- 5. Italicize Mycoplasma genus (bullet lead-in) ----
rep(
  '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">Mycoplasma: </w:t></w:r>',
  '<w:r><w:rPr><w:b/><w:bCs/><w:i/><w:iCs/></w:rPr><w:t>Mycoplasma</w:t></w:r><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">: </w:t></w:r>'
);

// ---- 6. Italicize Mycoplasma genus (running prose, split the big run) ----
rep(
  'For full disease profiles on IBD, Mycoplasma, and the other common subclinical pathogens, see Course 7 (Common Poultry Diseases) in this series.',
  'For full disease profiles on IBD, </w:t></w:r><w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>Mycoplasma</w:t></w:r><w:r><w:t xml:space="preserve">, and the other common subclinical pathogens, see Course 7 (Common Poultry Diseases) in this series.'
);

// ---- 7. Cost/benefit worked example (NB comment id5) inserted after first table ----
const J = '<w:pPr><w:jc w:val="both"/></w:pPr>';
const ital = t => `<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>${t}</w:t></w:r>`;
const t = (s, pre = false) => `<w:r><w:t${pre ? ' xml:space="preserve"' : ''}>${s}</w:t></w:r>`;

// worked-example paragraphs
const leadPara =
  '<w:p>' + J +
  t('Put real numbers on it for a 20,000-bird broiler barn. The figures below come straight from the two case studies in Section 5 of this course, so treat them as a guide. Your own lab fees, bird value, and losses will vary by region and flock. A barn like this places several flocks a year. Budget one solid diagnostic submission for each flock, a routine serology panel plus an early-mortality necropsy at roughly $300 a time, and you land at about two to three thousand dollars a year. That is the whole cost of keeping a finger on the flock\'s pulse. Now look at what one missed call costs. The water-drop flock in Case Study B lost over $5,200 in a single cycle once a virus got three days\' head start and ', true) +
  ital('E. coli') +
  t(' went septic behind it. The subclinical Infectious Bursal Disease flock in Case Study A was quietly leaking more than $3,800 in feed every cycle before anyone caught it [2,4].', true) +
  '</w:p>';

const introTable =
  '<w:p>' + J + '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">Cost of screening versus cost of waiting, 20,000-bird broiler barn:</w:t></w:r></w:p>';

// 2-column table matching the doc's table style
const HDR = 'D6E4F0';
function hdrCell(text, w) {
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="${HDR}"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:bCs/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p></w:tc>`;
}
function dataCell(runsXml, w, bold = false) {
  const rpr = `<w:rPr>${bold ? '<w:b/><w:bCs/>' : ''}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>`;
  // runsXml is an array of {text, italic}
  const runs = runsXml.map(r =>
    `<w:r>${bold || r.italic ? `<w:rPr>${bold ? '<w:b/><w:bCs/>' : ''}${r.italic ? '<w:i/><w:iCs/>' : ''}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>` : '<w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>'}<w:t xml:space="preserve">${r.text}</w:t></w:r>`
  ).join('');
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:rPr>${rpr}</w:rPr></w:pPr>${runs}</w:p></w:tc>`;
}
const W1 = 5100, W2 = 3196;
function row(cells) { return `<w:tr>${cells}</w:tr>`; }

const tableRows = [
  row(hdrCell('What it is', W1) + hdrCell('Rough dollars on this barn', W2)),
  row(dataCell([{ text: 'Diagnostic screening for a full year (routine serology plus one early-mortality necropsy per flock, about $300 each)' }], W1) + dataCell([{ text: 'About two to three thousand dollars total' }], W2)),
  row(dataCell([{ text: 'Emergency antibiotics once a disease is missed and gets ahead of you' }], W1) + dataCell([{ text: 'Around $1,500 per outbreak' }], W2)),
  row(dataCell([{ text: 'Extra mortality and poorer feed conversion from one late-caught outbreak' }], W1) + dataCell([{ text: 'Over $5,200 in that single cycle (Case Study B)' }], W2)),
  row(dataCell([{ text: 'Feed quietly wasted by a subclinical problem like IBD before it is caught' }], W1) + dataCell([{ text: 'Over $3,800 per cycle (Case Study A)' }], W2)),
].join('');

const newTable =
  '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders><w:tblCellMar><w:left w:w="10" w:type="dxa"/><w:right w:w="10" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/></w:tblPr><w:tblGrid><w:gridCol w:w="' + W1 + '"/><w:gridCol w:w="' + W2 + '"/></w:tblGrid>' +
  tableRows +
  '</w:tbl>';

const closePara =
  '<w:p>' + J +
  t('So the real choice is spending a few thousand dollars a year to stay ahead, or gambling that you will not lose several times that in one bad cycle. Screening does not have to catch a disaster every flock to pay for itself. It only has to catch one [2].', true) +
  '</w:p>';

// Insert after the FIRST table's close tag
const firstTblEnd = xml.indexOf('</w:tbl>') + '</w:tbl>'.length;
if (firstTblEnd < 8) throw new Error('first table not found');
xml = xml.slice(0, firstTblEnd) + leadPara + introTable + newTable + closePara + xml.slice(firstTblEnd);

// ---- 8. Strip ALL remaining comment markers & reference runs ----
xml = xml.replace(/<w:commentRangeStart w:id="\d+"\/>/g, '');
xml = xml.replace(/<w:commentRangeEnd w:id="\d+"\/>/g, '');
xml = xml.replace(/<w:r\b[^>]*>(?:(?!<\/w:r>)[\s\S])*?<w:commentReference w:id="\d+"\/><\/w:r>/g, '');

// sanity: no comment residue
['commentRangeStart', 'commentRangeEnd', 'commentReference'].forEach(k => {
  if (xml.includes(k)) throw new Error('residual ' + k);
});
// ampersand safety
const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error('unescaped & count ' + bad.length);

zip.file('word/document.xml', xml);

// ---- 9. Remove comment part files ----
['word/comments.xml', 'word/commentsExtended.xml', 'word/commentsIds.xml', 'word/commentsExtensible.xml', 'word/people.xml'].forEach(f => zip.remove(f));

// fix rels
let rels = await zip.file('word/_rels/document.xml.rels').async('string');
rels = rels.replace(/<Relationship[^>]*Target="comments\.xml"[^>]*\/>/g, '');
rels = rels.replace(/<Relationship[^>]*Target="commentsExtended\.xml"[^>]*\/>/g, '');
rels = rels.replace(/<Relationship[^>]*Target="commentsIds\.xml"[^>]*\/>/g, '');
rels = rels.replace(/<Relationship[^>]*Target="commentsExtensible\.xml"[^>]*\/>/g, '');
rels = rels.replace(/<Relationship[^>]*Target="people\.xml"[^>]*\/>/g, '');
zip.file('word/_rels/document.xml.rels', rels);

// fix content types
let ct = await zip.file('[Content_Types].xml').async('string');
ct = ct.replace(/<Override[^>]*PartName="\/word\/comments\.xml"[^>]*\/>/g, '');
ct = ct.replace(/<Override[^>]*PartName="\/word\/commentsExtended\.xml"[^>]*\/>/g, '');
ct = ct.replace(/<Override[^>]*PartName="\/word\/commentsIds\.xml"[^>]*\/>/g, '');
ct = ct.replace(/<Override[^>]*PartName="\/word\/commentsExtensible\.xml"[^>]*\/>/g, '');
ct = ct.replace(/<Override[^>]*PartName="\/word\/people\.xml"[^>]*\/>/g, '');
zip.file('[Content_Types].xml', ct);

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(OUT, buf);
console.log('WROTE', OUT, buf.length, 'bytes');
