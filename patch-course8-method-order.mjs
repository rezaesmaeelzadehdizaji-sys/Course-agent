// patch-course8-method-order.mjs
// 1. Update vaccination method order in Vaccination_draft.docx cover subtitle and intro list
// 2. Reorder sub-courses in Summary_Page_Course8_Vaccination.docx to match new section order:
//    Water → Eye Drop → Spray → Wing Web → Injection → In-Ovo
//    Sub-A(Water) → Sub-B(EyeDrop) → Sub-C(Spray) → Sub-D(WingWeb) → Sub-E(Injection) → Sub-F(InOvo)
// Run: node patch-course8-method-order.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═════════════════════════════════════════════════════════════════════════════
// PART 1: Vaccination_draft.docx — update cover subtitle and intro method list
// ═════════════════════════════════════════════════════════════════════════════
{
  const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Vaccination_draft: Unescaped & (${bad.length} found)`);

  const fixes = [
    // Cover subtitle — short form list
    [
      'water, wing web, eye drop, spray, in-ovo, injection',
      'water, eye drop, spray, wing web, injection, in-ovo',
    ],
    // Introduction paragraph — full method list
    [
      'water vaccination, wing web vaccination, eye drop vaccination, coarse spray vaccination, in-ovo vaccination, and injection vaccination with killed multivalent vaccines',
      'water vaccination, eye drop vaccination, coarse spray vaccination, wing web vaccination, injection vaccination with killed multivalent vaccines, and in-ovo vaccination',
    ],
  ];

  let changed = 0;
  for (const [find, replace] of fixes) {
    if (xml.includes(find)) {
      xml = xml.split(find).join(replace);
      changed++;
      console.log(`  ✓ Vaccination_draft: updated "${find.substring(0, 60)}..."`);
    } else {
      console.log(`  ⚠ Vaccination_draft: NOT FOUND: "${find.substring(0, 60)}..."`);
    }
  }

  const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (badAfter) throw new Error(`Vaccination_draft: Unescaped & introduced`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log(`  Vaccination_draft.docx: ${changed}/2 fixes applied. ${(buf.length/1024).toFixed(1)} KB`);
}

// ═════════════════════════════════════════════════════════════════════════════
// PART 2: Summary_Page_Course8_Vaccination.docx — reorder sub-courses
// ═════════════════════════════════════════════════════════════════════════════
{
  const SRC = path.join(__dirname, 'Course 8', 'Summary_Page_Course8_Vaccination.docx');
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Summary_Page: Unescaped & (${bad.length} found)`);

  // Fix cover subtitle
  if (xml.includes('water, wing web, eye drop, spray, in-ovo, injection')) {
    xml = xml.split('water, wing web, eye drop, spray, in-ovo, injection')
             .join('water, eye drop, spray, wing web, injection, in-ovo');
    console.log('  ✓ Summary_Page: cover subtitle updated');
  }

  // Split at sub-course heading paragraph boundaries
  // Find the <w:p> paragraph that contains each "Sub-Course X" text
  const findSubCourseParagraphStart = (label) => {
    const idx = xml.indexOf(label);
    if (idx === -1) throw new Error(`Sub-course label "${label}" not found`);
    return xml.lastIndexOf('<w:p>', idx);
  };

  const posA = findSubCourseParagraphStart('Sub-Course A');
  const posB = findSubCourseParagraphStart('Sub-Course B');
  const posC = findSubCourseParagraphStart('Sub-Course C');
  const posD = findSubCourseParagraphStart('Sub-Course D');
  const posE = findSubCourseParagraphStart('Sub-Course E');
  const posF = findSubCourseParagraphStart('Sub-Course F');

  console.log('\n  Sub-course positions:', { posA, posB, posC, posD, posE, posF });

  // Find the Important Notes section (postamble after all sub-courses)
  const importantNotesIdx = xml.indexOf('Important Notes');
  const postambleStart = importantNotesIdx > -1
    ? xml.lastIndexOf('<w:p>', importantNotesIdx)
    : xml.length;

  console.log('  Postamble (Important Notes) starts at:', postambleStart);

  // Extract chunks
  const preamble   = xml.substring(0, posA);               // cover block
  const subA       = xml.substring(posA, posB);            // Water — stays Sub-A
  const subB_wing  = xml.substring(posB, posC);            // Wing Web — becomes Sub-D
  const subC_eye   = xml.substring(posC, posD);            // Eye Drop — becomes Sub-B
  const subD_spray = xml.substring(posD, posE);            // Spray — becomes Sub-C
  const subE_inovo = xml.substring(posE, posF);            // In-Ovo — becomes Sub-F
  const subF_inj   = xml.substring(posF, postambleStart);  // Injection — becomes Sub-E
  const postamble  = xml.substring(postambleStart);         // Important Notes

  console.log('\n  Chunk lengths:');
  console.log('    subA(Water):', subA.length);
  console.log('    subB_wing:', subB_wing.length);
  console.log('    subC_eye:', subC_eye.length);
  console.log('    subD_spray:', subD_spray.length);
  console.log('    subE_inovo:', subE_inovo.length);
  console.log('    subF_inj:', subF_inj.length);

  // Rename sub-course letters within each chunk (use temp markers to avoid cascade)
  const renameLabel = (chunk, fromLetter, toLetter) =>
    chunk.replace(new RegExp(`Sub-Course ${fromLetter}:`, 'g'), `Sub-Course ${toLetter}:`);

  // Old B(Wing)→D, C(Eye)→B, D(Spray)→C, E(InOvo)→F, F(Inj)→E
  const newSubB = renameLabel(subC_eye,   'C', 'B');  // Eye Drop → Sub-B
  const newSubC = renameLabel(subD_spray, 'D', 'C');  // Spray → Sub-C
  const newSubD = renameLabel(subB_wing,  'B', 'D');  // Wing Web → Sub-D
  const newSubE = renameLabel(subF_inj,   'F', 'E');  // Injection → Sub-E
  const newSubF = renameLabel(subE_inovo, 'E', 'F');  // In-Ovo → Sub-F

  // Reassemble in new order
  xml = preamble + subA + newSubB + newSubC + newSubD + newSubE + newSubF + postamble;

  // Verify new order
  const checkOrder = ['Sub-Course A:', 'Sub-Course B:', 'Sub-Course C:', 'Sub-Course D:', 'Sub-Course E:', 'Sub-Course F:'];
  let allFound = true;
  let lastPos = -1;
  for (const label of checkOrder) {
    const p = xml.indexOf(label);
    if (p === -1) { console.log(`  ⚠ "${label}" not found after reorder`); allFound = false; }
    else if (p < lastPos) { console.log(`  ⚠ "${label}" out of order after reorder`); allFound = false; }
    else lastPos = p;
  }
  if (allFound) console.log('\n  ✓ Sub-courses verified in correct order: A→B→C→D→E→F');

  // Verify sub-course content is correct
  const subBIdx = xml.indexOf('Sub-Course B:');
  const subBCtx = xml.substring(subBIdx, subBIdx + 200);
  const subBText = [...subBCtx.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('');
  console.log('  Sub-B content check (should be Eye Drop):', subBText.substring(0, 80));

  const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (badAfter) throw new Error(`Summary_Page: Unescaped & introduced (${badAfter.length} found)`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log(`\n  Summary_Page_Course8_Vaccination.docx: reorder done. ${(buf.length/1024).toFixed(1)} KB`);
}

console.log('\nDone.');
