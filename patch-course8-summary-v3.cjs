// Course 8 summary page: align with the V3 audit of the course body (November 2026).
// - "Veterinary Health Certificate" removed: it appears in neither CPC source file
//   (Short Courses summary pdage drafts.docx, CPCLearningCenter (1).docx) nor on the Health Canada
//   responsible-use page; the Dec 1, 2018 rule is a veterinary prescription under a valid VCPR.
// - "license to treat" removed (farmers hold no treatment licence; not in either source file).
// - "six routes" -> "seven vaccination methods", matching the course Introduction.
// - Date aligned with the course cover (November 2026).
const JSZip = require('jszip');
const fs = require('fs');
const FILE = 'Course 8/Summary_Page_Course8_Vaccination.docx';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');
  const fixes = [
    ['June 2026', 'November 2026'],
    ['This course covers all six vaccination routes used in Canadian commercial poultry production: water, coarse and fine spray, eye drop, wing web, injection, and in-ovo.',
     'This course covers the seven vaccination methods used in Canadian commercial poultry production: water, coarse spray, fine spray, eye drop, wing web, injection, and in-ovo.'],
    ['your market access, and your license to treat.', 'your market access, and your access to the medicines your birds need.'],
    ['Canadian law: VCPR, Veterinary Health Certificate, and prescription requirements', 'Canadian law: VCPR and prescription requirements'],
    ['State the Canadian legal requirements for antibiotic use: VCPR, Veterinary Health Certificate, and prescription rules that took effect December 1, 2018.',
     'State the Canadian legal requirements for antibiotic use: a valid VCPR and the prescription rules that took effect December 1, 2018.'],
  ];
  for (const [a, b] of fixes) {
    const n = xml.split(esc(a)).length - 1;
    if (n !== 1) throw new Error(`expected 1 hit (inside one run), got ${n}: ${a.slice(0, 60)}`);
    xml = xml.replace(esc(a), esc(b));
  }
  if (/Veterinary Health Certificate|license to treat/.test(xml)) throw new Error('phrase survived');
  if (xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g)) throw new Error('unescaped &');
  zip.file('word/document.xml', xml);
  fs.writeFileSync(FILE, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('Summary page updated:', fixes.length, 'edits');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
