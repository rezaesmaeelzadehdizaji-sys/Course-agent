// patch-course8-serology-merge.mjs
// Merges "Post-vaccination serology" and "Titer failures at first-egg serology"
// in Section 5.6 into a single paragraph, removing repetition.
// Step 1: replace body text of Para 1 with merged content.
// Step 2: remove Para 2 entirely.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

// ── Merged body text (replaces Para 1 body run) ───────────────────────────
const OLD_BODY =
  ' The only reliable way to confirm that injection vaccination achieved adequate flock protection is serology at 4 to 6 weeks post-vaccination. Titers below the protective threshold after a properly executed injection program indicate either a cold chain failure, wrong product, or an immune system problem in the flock (e.g., immunosuppressive disease). Work with your veterinarian to interpret serology results and decide whether revaccination is needed [5,20]. You may also want to verify the accuracy of the lab results.';

const NEW_BODY =
  ' The most reliable way to confirm that injection vaccination achieved adequate flock protection is serology at 4 to 6 weeks post-vaccination, or at first-egg in layer programs. Titers below the protective threshold after a properly executed injection program indicate either a cold chain failure, wrong product, or an immune system problem in the flock such as immunosuppressive disease. If titers are low, review cold chain records from product arrival through the vaccination session, since one freezing event, even brief, destroys an oil emulsion vaccine. Also confirm the product used actually contained the antigen in question, as multivalent product labels vary and not every NDV or IBV product uses the same strains. Work with your veterinarian to interpret serology results and decide whether revaccination is needed [5,20]. You may also want to verify the accuracy of the lab results.';

// ── Para 2 anchor (unique) ────────────────────────────────────────────────
const PARA2_ANCHOR = 'Titer failures at first-egg serology:';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Verify OLD_BODY is the second occurrence (Section 5.6 paragraph) ──
  if (!xml.includes(OLD_BODY)) throw new Error('Para 1 body anchor not found');
  if ((xml.split(OLD_BODY).length - 1) > 1) throw new Error('Para 1 body anchor not unique');
  xml = xml.replace(OLD_BODY, NEW_BODY);
  console.log('  Step 1: replaced Para 1 body with merged content');

  // ── 2. Remove Para 2 entirely ─────────────────────────────────────────────
  const anchorIdx = xml.indexOf(PARA2_ANCHOR);
  if (anchorIdx < 0) throw new Error('Para 2 anchor not found');
  if (xml.indexOf(PARA2_ANCHOR, anchorIdx + 1) >= 0) throw new Error('Para 2 anchor not unique');

  // Walk back to find <w:p> opener
  let pStart = -1;
  let pos = anchorIdx - 1;
  while (pos >= 0) {
    if (xml[pos] === '<') {
      const tagEnd = xml.indexOf('>', pos);
      const tag = xml.slice(pos, tagEnd + 1);
      if (tag === '<w:p>' || tag.startsWith('<w:p ')) { pStart = pos; break; }
    }
    pos--;
  }
  if (pStart < 0) throw new Error('<w:p> opener not found for Para 2');

  const pEnd = xml.indexOf('</w:p>', anchorIdx) + '</w:p>'.length;
  if (pEnd < 6) throw new Error('</w:p> close not found for Para 2');

  const para2 = xml.slice(pStart, pEnd);
  if (!para2.includes(PARA2_ANCHOR)) throw new Error('Paragraph boundary mismatch');

  xml = xml.slice(0, pStart) + xml.slice(pEnd);
  console.log('  Step 2: removed Para 2 (Titer failures)');

  // ── 3. SAX + schema-nesting validation ────────────────────────────────────
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
  console.log('  Step 3: SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  // ── 4. Write ──────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
