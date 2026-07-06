import JSZip from 'jszip';
import fs from 'fs';

const FILE = 'Course 9/The_Value_of_Poultry_Diagnostics.docx';
const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
let xml = await zip.file('word/document.xml').async('string');

// ---- 1. Delete struck-through words ("actually") + their trailing space ----
const strikeBefore = (xml.match(/<w:strike\/>/g) || []).length;
xml = xml.replace(
  /<w:r\b[^>]*><w:rPr><w:strike\/><\/w:rPr><w:t>[^<]*<\/w:t><\/w:r><w:r><w:t xml:space="preserve"> /g,
  '<w:r><w:t xml:space="preserve">'
);
xml = xml.replace(/<w:r\b[^>]*><w:rPr><w:strike\/><\/w:rPr><w:t>[^<]*<\/w:t><\/w:r>/g, '');
if ((xml.match(/<w:strike\/>/g) || []).length !== 0) throw new Error('strike runs remain');
console.log('struck-through runs removed:', strikeBefore);

// ---- 2. Replace worked-example block (leadPara + table + closePara) with 3 new paragraphs ----
const J = '<w:pPr><w:jc w:val="both"/></w:pPr>';
const ital = s => `<w:r><w:rPr><w:i/><w:iCs/></w:rPr><w:t>${s}</w:t></w:r>`;
const t = s => `<w:r><w:t xml:space="preserve">${s}</w:t></w:r>`;
const para = (...runs) => '<w:p>' + J + runs.join('') + '</w:p>';

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

const startMark = '<w:p><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">Put real numbers on it';
const endMark = 'It only has to catch one [2].</w:t></w:r></w:p>';
const s = xml.indexOf(startMark);
const e = xml.indexOf(endMark);
if (s < 0 || e < 0) throw new Error('worked-example block not found');
xml = xml.slice(0, s) + p1 + p2 + p3 + xml.slice(e + endMark.length);

// ---- safety checks ----
if ((xml.match(/[—–]/g) || []).length !== 0) throw new Error('em/en dash present');
const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error('unescaped & ' + bad.length);
if (xml.includes('Cost of screening versus cost of waiting')) throw new Error('old table still present');

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(FILE, buf);
console.log('WROTE', FILE, buf.length, 'bytes');
