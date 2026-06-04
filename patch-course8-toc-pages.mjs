// patch-course8-toc-pages.mjs
// Updates the cached TOC page numbers in Vaccination_draft.docx to match
// the actual rendered page numbers verified from the LibreOffice PDF.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// Returns the correct page number for a given heading text, or null if already correct / not tracked.
function getCorrectPage(headingText) {
  // "Section N" top-level entries
  const secMatch = headingText.match(/^Section\s+(\d+)\b/);
  if (secMatch) {
    const map = { '1': 7, '2': 16, '3': 24, '6': 42, '7': 44 };
    return map[secMatch[1]] ?? null;
  }

  // "N.M" subsection entries
  const subMatch = headingText.match(/^(\d+\.\d+)\b/);
  if (subMatch) {
    const map = {
      '1.1': 7,  '1.2': 7,  '1.3': 8,  '1.5': 11, '1.6': 12, '1.7': 14, '1.8': 15,
      '2.1': 16, '2.2': 17, '2.3': 18, '2.4': 18, '2.5': 19, '2.6': 19, '2.7': 20,
      '3.1': 24, '3.2': 25, '3.3': 25, '3.4': 26, '3.5': 27, '3.7': 28,
      '4.7': 33,
      '5.3': 37, '5.4': 38, '5.6': 40,
      '7.1': 44, '7.2': 44, '7.3': 45, '7.4': 45,
    };
    return map[subMatch[1]] ?? null;
  }

  // Named back-matter sections
  if (headingText.startsWith('Recommended Peer-Reviewed Journals')) return 46;
  if (headingText.startsWith('References')) return 46;

  return null; // already correct or not in correction set
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Extract the SDT (cached TOC) ──────────────────────────────────────────
  const sdtStart = xml.indexOf('<w:sdt>');
  const sdtEnd   = xml.indexOf('</w:sdt>') + '</w:sdt>'.length;
  if (sdtStart < 0 || sdtEnd < 8) throw new Error('SDT not found');
  const sdt = xml.slice(sdtStart, sdtEnd);

  // ── 2. Walk every <w:p> in the SDT and fix page numbers ──────────────────────
  let fixCount = 0;
  let pos = 0;
  let newSdt = '';

  while (pos < sdt.length) {
    // Find the next exact <w:p> or <w:p ...> opening tag
    let pTagStart = -1;
    let scanPos = pos;
    while (scanPos < sdt.length) {
      const ltIdx = sdt.indexOf('<', scanPos);
      if (ltIdx < 0) break;
      const gtIdx = sdt.indexOf('>', ltIdx);
      if (gtIdx < 0) break;
      const tag = sdt.slice(ltIdx, gtIdx + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) { pTagStart = ltIdx; break; }
      scanPos = gtIdx + 1;
    }

    if (pTagStart < 0) { newSdt += sdt.slice(pos); break; }

    newSdt += sdt.slice(pos, pTagStart); // content before this paragraph

    const pEnd = sdt.indexOf('</w:p>', pTagStart) + '</w:p>'.length;
    const para = sdt.slice(pTagStart, pEnd);
    pos = pEnd;

    // Only TOC entry paragraphs contain a <w:tab/>
    const tabIdx = para.indexOf('<w:tab/>');
    if (tabIdx < 0) { newSdt += para; continue; }

    // Heading text = concatenate all <w:t> runs before the tab
    const beforeTab = para.slice(0, tabIdx);
    const headingText = [...beforeTab.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
      .map(m => m[1]).join('').trim();

    // Page number = first <w:t>digits</w:t> after the tab
    const afterTab = para.slice(tabIdx);
    const pageMatch = afterTab.match(/<w:t(?:\s[^>]*)?>(\d+)<\/w:t>/);
    if (!pageMatch) { newSdt += para; continue; }

    const currentPage = parseInt(pageMatch[1]);
    const correctPage = getCorrectPage(headingText);

    if (correctPage === null || correctPage === currentPage) {
      if (correctPage !== null) {
        console.log(`  OK: "${headingText.slice(0, 50)}" = ${currentPage}`);
      }
      newSdt += para;
      continue;
    }

    // Replace the page number digit(s) in the matched <w:t> run
    const fixedRun = pageMatch[0].replace(`>${currentPage}<`, `>${correctPage}<`);
    const afterTabFixed = afterTab.replace(pageMatch[0], fixedRun);
    newSdt += para.slice(0, tabIdx) + afterTabFixed;
    console.log(`  Fixed: "${headingText.slice(0, 50)}" ${currentPage} → ${correctPage}`);
    fixCount++;
  }

  console.log(`\n  Total fixes: ${fixCount}`);
  if (fixCount === 0) throw new Error('No TOC entries were fixed — check anchor patterns');

  // ── 3. Splice patched SDT back ────────────────────────────────────────────────
  xml = xml.slice(0, sdtStart) + newSdt + xml.slice(sdtEnd);

  // ── 4. SAX validation ─────────────────────────────────────────────────────────
  const parser = sax.parser(true);
  const stack = [];
  let stopped = false;
  let info = null;
  parser.onopentag = (n) => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = (n) => { if (!stopped) stack.pop(); };
  parser.onerror    = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 5. Write ──────────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
