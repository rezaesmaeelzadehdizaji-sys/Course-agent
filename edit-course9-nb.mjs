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
const ital = s => `<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>${s}</w:t></w:r>`;
const t = (s, pre = true) => `<w:r><w:t${pre ? ' xml:space="preserve"' : ''}>${s}</w:t></w:r>`;
const para = (...runs) => '<w:p>' + J + runs.join('') + '</w:p>';

// Three worked-example paragraphs (farmer-flow, no em/en dashes)
const p1 = para(
  t('A 20,000-bird barn places several flocks a year, usually five or six. Budget a solid diagnostic footprint for each one: a routine serology panel plus an early-mortality necropsy, with enough room for one follow-up submission when something looks off. Call it $400 to $500 per flock, and you land at roughly $2,000 to $3,000 a year. That is the whole cost of keeping a finger on the flock\'s pulse.')
);
const p2 = para(
  t('Now look at what one missed call costs. In the water-drop flock in Case Study B, mortality and condemnations ran over $5,200 in a single cycle, about $0.26 a bird, once a virus got three days\' head start and '),
  ital('E. coli'),
  t(' went septic behind it. The subclinical Infectious Bursal Disease flock in Case Study A was quietly leaking more than $3,800 in feed every cycle before anyone caught it. On roughly 85,000 kg of feed for a flock this size, that works out to an FCR penalty of about 0.15 points, the kind of drag immunosuppressive IBD hides in plain sight.')
);
const p3 = para(
  t('Two things keep these numbers honest. First, who carries the loss depends on your contract. In integrated production the bird and feed cost sit with the integrator, while the grower feels it through settlement, so read these figures against your own arrangement. Second, a diagnostic submission does not prevent the loss outright. It shortens the detection lag and improves your odds of stepping in while it still matters. Even shaving a large piece off a $5,200 event a few times a year dwarfs the cost of the testing that flags it [2,4].')
);

// Insert after the FIRST table's close tag
const firstTblEnd = xml.indexOf('</w:tbl>') + '</w:tbl>'.length;
if (firstTblEnd < 8) throw new Error('first table not found');
xml = xml.slice(0, firstTblEnd) + p1 + p2 + p3 + xml.slice(firstTblEnd);

// ---- 7b. Delete struck-through words (e.g. "actually") + their trailing space ----
const strikeCountBefore = (xml.match(/<w:strike\/>/g) || []).length;
xml = xml.replace(
  /<w:r\b[^>]*><w:rPr><w:strike\/><\/w:rPr><w:t>[^<]*<\/w:t><\/w:r><w:r><w:t xml:space="preserve"> /g,
  '<w:r><w:t xml:space="preserve">'
);
// remove any remaining struck runs (no following-space case), if any
xml = xml.replace(/<w:r\b[^>]*><w:rPr><w:strike\/><\/w:rPr><w:t>[^<]*<\/w:t><\/w:r>/g, '');
if ((xml.match(/<w:strike\/>/g) || []).length !== 0)
  throw new Error('strike runs remain');
console.log('struck-through runs removed:', strikeCountBefore);

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
