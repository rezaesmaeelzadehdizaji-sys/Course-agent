// patch-course8-section7.mjs
// 1. Rename "Post-Vaccination Reactions" → "Section 7: ..." with numbered subsections 7.1–7.5
// 2. Add bookmarks to Section 7 headings for TOC clickable linking
// 3. Italicize scientific names throughout body text
// 4. Add page break before "Recommended Peer-Reviewed Journals"
// 5. Add Section 7 entries to the cached TOC

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const SRC = 'Course 8/Vaccination_draft.docx';
const OUT = 'Course 8/Vaccination_draft.docx';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Scientific names to italicize. Order matters: longer names first so shorter
// substrings (e.g. "Mycoplasma") don't shadow them. All are safe ASCII, no & < > ".
const SCI_NAMES = [
  'Mycoplasma gallisepticum',
  'Mycoplasma synoviae',
  'Newcastle Disease virus',
  'Infectious Bronchitis virus',
  'E. coli',
];

// Replace one <w:r>...</w:r> with italic-split version if it contains a scientific name.
// Text extracted from <w:t> is already XML-encoded — do NOT call esc() on it.
function splitRunForItalics(runXml) {
  const rprMatch = runXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
  const rprContent = rprMatch ? rprMatch[1] : '';

  // Collect all text from <w:t> elements in this run (usually just one)
  const tMatches = [...runXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)];
  if (tMatches.length === 0) return runXml;

  const fullText = tMatches.map(m => m[1]).join('');
  if (!SCI_NAMES.some(n => fullText.includes(n))) return runXml;

  // Find all non-overlapping occurrences of scientific names
  const occs = [];
  for (const name of SCI_NAMES) {
    let idx = 0;
    while ((idx = fullText.indexOf(name, idx)) >= 0) {
      occs.push({ start: idx, end: idx + name.length });
      idx += name.length;
    }
  }
  occs.sort((a, b) => a.start - b.start);
  const filtered = [];
  let lastEnd = -1;
  for (const o of occs) {
    if (o.start >= lastEnd) { filtered.push(o); lastEnd = o.end; }
  }

  const normalRpr = rprContent ? `<w:rPr>${rprContent}</w:rPr>` : '';
  const italicRpr = rprContent
    ? `<w:rPr>${rprContent}<w:i/><w:iCs/></w:rPr>`
    : `<w:rPr><w:i/><w:iCs/></w:rPr>`;

  function makeRun(text, italic) {
    if (!text) return '';
    const preserve = (text.startsWith(' ') || text.endsWith(' ')) ? ' xml:space="preserve"' : '';
    return `<w:r>${italic ? italicRpr : normalRpr}<w:t${preserve}>${text}</w:t></w:r>`;
  }

  let result = '';
  let pos = 0;
  for (const { start, end } of filtered) {
    result += makeRun(fullText.slice(pos, start), false);
    result += makeRun(fullText.slice(start, end), true);
    pos = end;
  }
  result += makeRun(fullText.slice(pos), false);
  return result;
}

// Build a TOC entry paragraph (level 1=TOC1, 2=TOC2)
function tocEntry(level, anchor, text, page) {
  const style = level === 1 ? 'TOC1' : 'TOC2';
  return (
    `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>` +
    `<w:hyperlink w:anchor="${anchor}" w:history="1">` +
    `<w:r><w:rPr><w:rStyle w:val="Hyperlink"/><w:noProof/></w:rPr><w:t>${esc(text)}</w:t></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:instrText xml:space="preserve"> PAGEREF ${anchor} \\h </w:instrText></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:t>${page}</w:t></w:r>` +
    `<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>` +
    `</w:hyperlink></w:p>`
  );
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // ── 1. Rename Section 7 H1 heading and add TOC bookmark ───────────────────
  const OLD_H1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Post-Vaccination Reactions: What to Expect and When to Act</w:t></w:r></w:p>`;
  const NEW_H1 = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:bookmarkStart w:id="47" w:name="_Toc231132531"/><w:r><w:t>Section 7: Post-Vaccination Reactions: What to Expect and When to Act</w:t></w:r><w:bookmarkEnd w:id="47"/></w:p>`;
  if (!xml.includes(OLD_H1)) throw new Error('Section 7 H1 heading not found in XML');
  xml = xml.replace(OLD_H1, NEW_H1);
  console.log('  H1 renamed: Section 7: Post-Vaccination Reactions...');

  // ── 2. Rename H2 subsections with numbers 7.1–7.5 and TOC bookmarks ───────
  const subsections = [
    ['Mild reactions are normal',                    '7.1 Mild reactions are normal',                    48, '_Toc231132532'],
    ['What makes a reaction worse than expected',    '7.2 What makes a reaction worse than expected',    49, '_Toc231132533'],
    ['Do not stack live vaccines on an active reaction', '7.3 Do not stack live vaccines on an active reaction', 50, '_Toc231132534'],
    ['When to call your veterinarian',               '7.4 When to call your veterinarian',               51, '_Toc231132535'],
    ['The biosecurity link',                         '7.5 The biosecurity link',                         52, '_Toc231132536'],
  ];

  for (const [oldText, newText, bmId, anchor] of subsections) {
    const oldH2 = `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${oldText}</w:t></w:r></w:p>`;
    const newH2 = `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:bookmarkStart w:id="${bmId}" w:name="${anchor}"/><w:r><w:t>${newText}</w:t></w:r><w:bookmarkEnd w:id="${bmId}"/></w:p>`;
    if (!xml.includes(oldH2)) {
      console.warn(`  WARNING: H2 not found — "${oldText}"`);
    } else {
      xml = xml.replace(oldH2, newH2);
      console.log(`  H2 renamed: ${newText}`);
    }
  }

  // ── 3. Italicize scientific names in body text runs ───────────────────────
  let italicRuns = 0;
  xml = xml.replace(/<w:r>([\s\S]*?)<\/w:r>/g, (match) => {
    const replaced = splitRunForItalics(match);
    if (replaced !== match) italicRuns++;
    return replaced;
  });
  console.log(`  Scientific name italics applied to ${italicRuns} runs`);

  // ── 4. Add page break before "Recommended Peer-Reviewed Journals" ─────────
  // The paragraph has known anchor w14:paraId="4395DD1A" and pPr = <w:pStyle w:val="Heading1"/>
  const RPJ_ANCHOR = 'w14:paraId="4395DD1A"';
  const rpjAnchorIdx = xml.indexOf(RPJ_ANCHOR);
  if (rpjAnchorIdx < 0) throw new Error('Recommended Journals paragraph anchor not found');
  // Find <w:pPr><w:pStyle w:val="Heading1"/></w:pPr> in the vicinity of the anchor
  const PPR_OLD = '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>';
  const PPR_NEW = '<w:pPr><w:pStyle w:val="Heading1"/><w:pageBreakBefore/></w:pPr>';
  const pprIdx = xml.indexOf(PPR_OLD, rpjAnchorIdx);
  // Safety check: pPr must be close to the anchor (within 50 chars)
  if (pprIdx < 0 || pprIdx - rpjAnchorIdx > 200) {
    console.warn('  Falling back to inserted page-break paragraph');
    const rpjParaStart = xml.lastIndexOf('<w:p ', rpjAnchorIdx);
    const pageBreakPara = `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>`;
    xml = xml.slice(0, rpjParaStart) + pageBreakPara + xml.slice(rpjParaStart);
  } else {
    xml = xml.slice(0, pprIdx) + PPR_NEW + xml.slice(pprIdx + PPR_OLD.length);
  }
  console.log('  Page break added before Recommended Peer-Reviewed Journals');

  // ── 5. Add Section 7 TOC entries after "Section 6: In-Ovo Vaccination" ───
  // Section 6 uses anchor _Toc231132527 in the TOC hyperlink
  const TOC_S6 = 'w:anchor="_Toc231132527"';
  const tocS6Idx = xml.indexOf(TOC_S6);
  if (tocS6Idx < 0) throw new Error('Section 6 TOC entry anchor not found');
  const tocS6PEnd = xml.indexOf('</w:p>', tocS6Idx) + 6;

  const newTocBlock = [
    tocEntry(1, '_Toc231132531', 'Section 7: Post-Vaccination Reactions: What to Expect and When to Act', '42'),
    tocEntry(2, '_Toc231132532', '7.1 Mild reactions are normal', '42'),
    tocEntry(2, '_Toc231132533', '7.2 What makes a reaction worse than expected', '42'),
    tocEntry(2, '_Toc231132534', '7.3 Do not stack live vaccines on an active reaction', '43'),
    tocEntry(2, '_Toc231132535', '7.4 When to call your veterinarian', '43'),
    tocEntry(2, '_Toc231132536', '7.5 The biosecurity link', '43'),
  ].join('');

  xml = xml.slice(0, tocS6PEnd) + newTocBlock + xml.slice(tocS6PEnd);
  console.log('  Section 7 TOC entries inserted after Section 6');

  // ── 6. Validate: no unescaped & ──────────────────────────────────────────
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error(`Unescaped & in XML: ${bad.length} instances`);

  // ── 7. Write ─────────────────────────────────────────────────────────────
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(OUT, buf);
  console.log(`\n  Done. ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
