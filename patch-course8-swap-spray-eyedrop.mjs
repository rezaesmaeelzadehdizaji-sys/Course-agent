// patch-course8-swap-spray-eyedrop.mjs
// Move Spray (currently Section 3) to Section 2, Eye Drop (currently Section 2) to Section 3.
// New order: 1=Water, 2=Spray, 3=Eye Drop, 4=Wing Web, 5=Injection, 6=In-Ovo
// Also updates cover subtitle, intro method list, TOC, citations, bibliography, and Summary Page.
// Run: node patch-course8-swap-spray-eyedrop.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═════════════════════════════════════════════════════════════════════════════
// PART 1: Vaccination_draft.docx
// ═════════════════════════════════════════════════════════════════════════════
{
  const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

  // ── Text fixes: cover subtitle + intro method list ─────────────────────────
  const textFixes = [
    [
      'water, eye drop, spray, wing web, injection, in-ovo',
      'water, spray, eye drop, wing web, injection, in-ovo',
    ],
    [
      'water vaccination, eye drop vaccination, coarse spray vaccination, wing web vaccination, injection vaccination with killed multivalent vaccines, and in-ovo vaccination',
      'water vaccination, coarse spray vaccination, eye drop vaccination, wing web vaccination, injection vaccination with killed multivalent vaccines, and in-ovo vaccination',
    ],
  ];
  for (const [find, replace] of textFixes) {
    if (xml.includes(find)) {
      xml = xml.split(find).join(replace);
      console.log(`✓ Text fix applied: "${find.substring(0, 60)}..."`);
    } else {
      console.log(`⚠ NOT FOUND: "${find.substring(0, 60)}..."`);
    }
  }

  // ── Locate H1 section headings ─────────────────────────────────────────────
  function findH1Sections(xml) {
    const re = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:pStyle w:val="Heading1"[^>]*\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    const sections = [];
    let m;
    while ((m = re.exec(xml)) !== null) {
      const text = [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('').trim();
      sections.push({ pos: m.index, text });
    }
    return sections;
  }

  const h1s = findH1Sections(xml);
  console.log('\nH1 sections found:');
  h1s.forEach(h => console.log(' ', h.text));

  const secIdx = name => h1s.findIndex(h => h.text.includes(name));
  const idxSec2 = secIdx('Section 2');
  const idxSec3 = secIdx('Section 3');
  const idxSec4 = secIdx('Section 4');

  if ([idxSec2, idxSec3, idxSec4].some(i => i === -1)) {
    throw new Error('Could not find Section 2, 3, or 4 headings');
  }

  // ── Extract chunks ─────────────────────────────────────────────────────────
  const before    = xml.substring(0, h1s[idxSec2].pos);
  const sec2Eye   = xml.substring(h1s[idxSec2].pos, h1s[idxSec3].pos);   // Eye Drop → Section 3
  const sec3Spray = xml.substring(h1s[idxSec3].pos, h1s[idxSec4].pos);   // Spray → Section 2
  const after     = xml.substring(h1s[idxSec4].pos);

  console.log('\nChunk lengths: sec2Eye =', sec2Eye.length, '  sec3Spray =', sec3Spray.length);

  // ── Rename section numbers within isolated chunks (no cascade risk) ────────
  function renameSection(chunk, fromNum, toNum) {
    let c = chunk.replace(new RegExp(`Section ${fromNum}:`, 'g'), `Section ${toNum}:`);
    for (let sub = 1; sub <= 10; sub++) {
      c = c.replace(new RegExp(`${fromNum}\\.${sub}  `, 'g'), `${toNum}.${sub}  `);
    }
    return c;
  }

  const newSec2 = renameSection(sec3Spray, 3, 2);  // Spray: 3.x → 2.x
  const newSec3 = renameSection(sec2Eye,   2, 3);  // Eye Drop: 2.x → 3.x

  xml = before + newSec2 + newSec3 + after;
  console.log('\n✓ Sections swapped: Spray → Section 2, Eye Drop → Section 3');

  // ── Update TOC cached entries ──────────────────────────────────────────────
  const sdtMatch = xml.match(/<w:sdt>[\s\S]*?<\/w:sdt>/);
  if (sdtMatch) {
    let sdt = sdtMatch[0];
    // Use temp markers to avoid cascade: 2↔3
    sdt = sdt.replace(/Section 2:/g, 'Section __TWO__:');
    sdt = sdt.replace(/Section 3:/g, 'Section 2:');
    sdt = sdt.replace(/Section __TWO__:/g, 'Section 3:');
    for (let sub = 1; sub <= 10; sub++) {
      sdt = sdt.replace(new RegExp(`2\\.${sub}  `, 'g'), `__TWO__.${sub}  `);
      sdt = sdt.replace(new RegExp(`3\\.${sub}  `, 'g'), `2.${sub}  `);
      sdt = sdt.replace(new RegExp(`__TWO__\\.${sub}  `, 'g'), `3.${sub}  `);
    }
    xml = xml.replace(sdtMatch[0], sdt);
    console.log('✓ TOC cached entries updated (page numbers need manual Update Field in Word)');
  } else {
    console.log('⚠ No TOC SDT found — skipping TOC update');
  }

  // ── Verify final H1 order ──────────────────────────────────────────────────
  const finalH1s = findH1Sections(xml);
  console.log('\nFinal section order:');
  finalH1s.forEach(h => console.log(' ', h.text));

  // ── Citation renumbering ───────────────────────────────────────────────────
  // Scan all text to find current first-appearance order of [N] citations
  const allTexts = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join(' ');
  const seenNums = new Set();
  const appearOrder = [];
  const verifyRe = /\[(\d+(?:,\d+)*)\]/g;
  let vm;
  while ((vm = verifyRe.exec(allTexts)) !== null) {
    vm[1].split(',').map(Number).forEach(n => {
      if (!seenNums.has(n)) { seenNums.add(n); appearOrder.push(n); }
    });
  }
  console.log('\nCitation first-appearance order:', appearOrder.join(', '));

  const isOrdered = appearOrder.every((n, i) => i === 0 || n > appearOrder[i - 1]);
  if (isOrdered) {
    console.log('✓ Already sequential 1–15 — no citation renumbering needed');
  } else {
    console.log('Citations out of order — renumbering...');

    // Build OLD_TO_NEW map: appearOrder[i] = old number that becomes new number i+1
    const OLD_TO_NEW = {};
    appearOrder.forEach((oldNum, i) => { OLD_TO_NEW[oldNum] = i + 1; });
    console.log('Renumbering map:', JSON.stringify(OLD_TO_NEW));

    // Collect all unique citation patterns
    const allPatterns = new Set();
    const citePat = /\[(\d+(?:,\d+)*)\]/g;
    let cm;
    while ((cm = citePat.exec(allTexts)) !== null) allPatterns.add(cm[1]);
    const sortedPatterns = [...allPatterns].sort((a, b) => b.length - a.length);
    console.log('Citation patterns to process:', sortedPatterns);

    // Pass 1: replace each [N] / [N,M] with a unique temp marker
    for (const pattern of sortedPatterns) {
      const oldNums = pattern.split(',').map(Number);
      const newNums = oldNums.map(n => OLD_TO_NEW[n]).sort((a, b) => a - b);
      const tempMarker = `[RNTEMP_${newNums.join(',')}_RNTEMP]`;
      const count = (xml.match(new RegExp('\\[' + pattern + '\\]', 'g')) || []).length;
      xml = xml.split('[' + pattern + ']').join(tempMarker);
      console.log(`  [${pattern}] → [${newNums.join(',')}] (${count} occurrences)`);
    }

    // Pass 2: strip temp markers
    xml = xml.replace(/\[RNTEMP_(\d+(?:,\d+)*)_RNTEMP\]/g, '[$1]');
    console.log('✓ In-text citations renumbered');

    const tempLeft = (xml.match(/RNTEMP/g) || []).length;
    if (tempLeft > 0) throw new Error(`${tempLeft} RNTEMP markers left — incomplete replacement`);

    // ── Reorder bibliography ─────────────────────────────────────────────────
    // Bibliography paragraphs have w:ind w:left="504" w:hanging="504"
    const refsHeadIdx = xml.indexOf('>References<');
    if (refsHeadIdx === -1) throw new Error('References heading not found');
    const bibSectionStart = xml.indexOf('</w:p>', refsHeadIdx) + '</w:p>'.length;
    const bibSectionXml = xml.substring(bibSectionStart);

    const bibParaRe = /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?<w:ind w:left="504" w:hanging="504"[^>]*\/>(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/g;
    const bibParas = [];
    let bm;
    while ((bm = bibParaRe.exec(bibSectionXml)) !== null) {
      const texts = [...bm[0].matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('');
      const numMatch = texts.trim().match(/^(\d+)\.\s/);
      if (numMatch) bibParas.push({ oldNum: parseInt(numMatch[1]), xml: bm[0], text: texts.trim() });
    }

    console.log(`\nFound ${bibParas.length} bibliography paragraphs`);
    if (bibParas.length !== 15) console.log('⚠ Expected 15, got', bibParas.length);

    const bibByOldNum = {};
    bibParas.forEach(p => bibByOldNum[p.oldNum] = p.xml);

    function updateBibNumber(paraXml, newNum) {
      return paraXml.replace(
        /(<w:t xml:space="preserve">)\d+\.\s{1,3}(<\/w:t>)/,
        (_, open, close) => `${open}${newNum}.  ${close}`
      );
    }

    let reorderedBibXml = '';
    appearOrder.forEach((oldNum, idx) => {
      const newNum = idx + 1;
      const paraXml = bibByOldNum[oldNum];
      if (!paraXml) { console.log(`⚠ No bibliography paragraph for old [${oldNum}]`); return; }
      reorderedBibXml += updateBibNumber(paraXml, newNum);
      const text = [...updateBibNumber(paraXml, newNum).matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('').trim();
      console.log(`  New [${newNum}] ← old [${oldNum}]: ${text.substring(0, 60)}...`);
    });

    // Reconstruct bib section
    const firstParaInBib = bibSectionXml.indexOf(bibParas[0].xml);
    const lastParaEnd    = bibSectionXml.indexOf(bibParas[bibParas.length - 1].xml) + bibParas[bibParas.length - 1].xml.length;
    const newBibSection  = bibSectionXml.substring(0, firstParaInBib)
                         + reorderedBibXml
                         + bibSectionXml.substring(lastParaEnd);

    xml = xml.substring(0, bibSectionStart) + newBibSection;
    console.log('✓ Bibliography reordered and renumbered');

    // Verify final citation order
    const finalTexts = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join(' ');
    const seenF = new Set();
    const finalOrder = [];
    const fr = /\[(\d+(?:,\d+)*)\]/g;
    let fv;
    while ((fv = fr.exec(finalTexts)) !== null) {
      fv[1].split(',').map(Number).forEach(n => { if (!seenF.has(n)) { seenF.add(n); finalOrder.push(n); } });
    }
    console.log('\nVerification — final first-appearance order:', finalOrder.join(', '));
    const isSeq = finalOrder.every((n, i) => i === 0 || n > finalOrder[i - 1]);
    console.log('Sequential?', isSeq ? 'YES ✓' : 'NO — check errors above');
  }

  // ── Final sanity checks ────────────────────────────────────────────────────
  const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log(`\n✓ Vaccination_draft.docx written. ${(buf.length / 1024).toFixed(1)} KB`);
}

// ═════════════════════════════════════════════════════════════════════════════
// PART 2: Summary_Page_Course8_Vaccination.docx — swap Sub-B (Eye Drop) ↔ Sub-C (Spray)
// ═════════════════════════════════════════════════════════════════════════════
{
  const SRC = path.join(__dirname, 'Course 8', 'Summary_Page_Course8_Vaccination.docx');
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Summary_Page: Unescaped & (${bad.length} found)`);

  // Update cover subtitle
  if (xml.includes('water, eye drop, spray, wing web, injection, in-ovo')) {
    xml = xml.split('water, eye drop, spray, wing web, injection, in-ovo')
             .join('water, spray, eye drop, wing web, injection, in-ovo');
    console.log('\n✓ Summary_Page: cover subtitle updated');
  } else {
    console.log('\n⚠ Summary_Page: cover subtitle not found at expected text');
  }

  // Locate sub-course paragraph starts
  const findSubStart = (label) => {
    const idx = xml.indexOf(label);
    if (idx === -1) throw new Error(`Sub-course label "${label}" not found in Summary_Page`);
    return xml.lastIndexOf('<w:p>', idx);
  };

  const posB = findSubStart('Sub-Course B:');
  const posC = findSubStart('Sub-Course C:');
  const posD = findSubStart('Sub-Course D:');

  console.log('  Sub-course positions: B =', posB, '  C =', posC, '  D =', posD);

  // Extract chunks
  const beforeB    = xml.substring(0, posB);
  const subB_eye   = xml.substring(posB, posC);   // Eye Drop (current B) → becomes C
  const subC_spray = xml.substring(posC, posD);   // Spray (current C) → becomes B
  const afterC     = xml.substring(posD);

  // Rename labels (no cascade: each chunk contains only one letter)
  const renameLabel = (chunk, from, to) =>
    chunk.replace(new RegExp(`Sub-Course ${from}:`, 'g'), `Sub-Course ${to}:`);

  const newSubB = renameLabel(subC_spray, 'C', 'B');  // Spray → Sub-B
  const newSubC = renameLabel(subB_eye,   'B', 'C');  // Eye Drop → Sub-C

  xml = beforeB + newSubB + newSubC + afterC;

  // Verify order
  const checkOrder = ['Sub-Course A:', 'Sub-Course B:', 'Sub-Course C:', 'Sub-Course D:', 'Sub-Course E:', 'Sub-Course F:'];
  let allFound = true;
  let lastPos = -1;
  for (const label of checkOrder) {
    const p = xml.indexOf(label);
    if (p === -1) { console.log(`  ⚠ "${label}" not found`); allFound = false; }
    else if (p < lastPos) { console.log(`  ⚠ "${label}" out of order`); allFound = false; }
    else lastPos = p;
  }
  if (allFound) console.log('  ✓ Sub-courses verified in correct order: A→B→C→D→E→F');

  // Content check: Sub-B should now be Spray
  const bIdx = xml.indexOf('Sub-Course B:');
  const bCtx = xml.substring(bIdx, bIdx + 400);
  const bText = [...bCtx.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/g)].map(x => x[1]).join('');
  console.log('  Sub-B content (should mention Spray):', bText.substring(0, 100));

  const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (badAfter) throw new Error(`Summary_Page: Unescaped & introduced (${badAfter.length} found)`);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log(`\n  ✓ Summary_Page_Course8_Vaccination.docx written. ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log('\nDone.');
console.log('NOTE: Open Vaccination_draft.docx in Word → right-click TOC → Update Field → Update entire table.');
