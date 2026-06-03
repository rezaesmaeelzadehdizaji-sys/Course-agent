// patch-course8-summary-s7.mjs
// Adds Section 7: Post-Vaccination Reactions to the Course 8 summary page
// Inserted just before the "Important Notes" section.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Summary_Page_Course8_Vaccination.docx';
const OUT = 'Course 8/Summary_Page_Course8_Vaccination.docx';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Shared run properties
const CAL = `<w:rFonts w:ascii="Calibri" w:cs="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri"/>`;

// Sub-course / section header (dark blue, size 30, gold bottom border, thick)
function sectionHeader(text) {
  return (
    `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="4"/></w:pBdr>` +
    `<w:spacing w:after="120" w:before="320"/></w:pPr>` +
    `<w:r><w:rPr>${CAL}<w:b/><w:bCs/><w:color w:val="1F3864"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

// Sub-heading (Introduction / Agenda / Learning Objectives) — CPC blue, size 24, gold bottom border
function subHead(text) {
  return (
    `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:color="C9A84C" w:sz="2"/></w:pBdr>` +
    `<w:spacing w:after="80" w:before="200"/></w:pPr>` +
    `<w:r><w:rPr>${CAL}<w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

// Body paragraph (gray text, size 22, justified)
function body(text, last = false) {
  const after = last ? '120' : '100';
  return (
    `<w:p><w:pPr><w:spacing w:after="${after}" w:line="260" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>` +
    `<w:r><w:rPr>${CAL}<w:b w:val="false"/><w:bCs w:val="false"/><w:i w:val="false"/><w:iCs w:val="false"/>` +
    `<w:color w:val="3C3C3C"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

// Numbered agenda/LO item (bold blue number, gray body text)
function numbered(num, text) {
  return (
    `<w:p><w:pPr><w:spacing w:after="60" w:line="260" w:lineRule="auto"/><w:ind w:left="288"/></w:pPr>` +
    `<w:r><w:rPr>${CAL}<w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>` +
    `<w:t xml:space="preserve">${num}.  </w:t></w:r>` +
    `<w:r><w:rPr>${CAL}<w:color w:val="3C3C3C"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>` +
    `<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`
  );
}

// ── Section 7 content block ───────────────────────────────────────────────────

const section7Xml = [

  sectionHeader('Section 7: Post-Vaccination Reactions: What to Expect and When to Act'),

  subHead('Introduction'),

  body(
    'Every live respiratory vaccine triggers some degree of response in the flock. ' +
    'Newcastle Disease, Infectious Bronchitis, and ILT vaccines are all live viruses ' +
    'that replicate in the respiratory mucosa, and some visible reaction at 2 to 5 days ' +
    'post-vaccination is normal and expected.'
  ),

  body(
    'This section explains what a normal reaction looks like, which factors can push it ' +
    'into a serious flock-wide problem, and when to call your veterinarian. ' +
    'Knowing the difference between a mild reaction and a warning sign is one of ' +
    'the most practical skills in vaccination management.',
    true // last body para before next heading
  ),

  subHead('Agenda'),

  numbered(1, 'Mild reactions are normal'),
  numbered(2, 'What makes a reaction worse than expected'),
  numbered(3, 'Do not stack live vaccines on an active reaction'),
  numbered(4, 'When to call your veterinarian'),
  numbered(5, 'The biosecurity link'),

  subHead('Learning Objectives'),

  numbered(1, 'Describe a normal post-vaccination reaction: onset timing, expected signs, and self-limiting duration.'),
  numbered(2, 'Name the five factors that can amplify a vaccine reaction into a serious flock-wide problem.'),
  numbered(3, 'Explain why applying a second live vaccine during an active reaction compounds the problem rather than boosting immunity.'),
  numbered(4, 'List the four specific signs after vaccination that require a veterinarian call.'),
  numbered(5, 'Connect post-vaccination reaction severity to litter management and biosecurity practices between flocks.'),

].join('');

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // Find the "Important Notes" heading paragraph and insert Section 7 before it
  const ANCHOR = 'Important Notes';
  const anchorIdx = xml.indexOf(ANCHOR);
  if (anchorIdx < 0) throw new Error('Important Notes anchor not found');
  const paraStart = xml.lastIndexOf('<w:p', anchorIdx);
  console.log(`  Inserting before "Important Notes" at ${paraStart}`);

  xml = xml.slice(0, paraStart) + section7Xml + xml.slice(paraStart);

  // Validate
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} found`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
