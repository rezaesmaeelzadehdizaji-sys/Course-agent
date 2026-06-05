// patch-course8-section8.mjs
// Inserts Section 8: Principles of Treatment (Including AMR) before "Recommended Peer-Reviewed Journals"
// Adds refs [23] CIPARS 2023 and [24] Health Canada responsible use to bibliography.
// Adds TOC entries for Section 8 and its four subsections.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

function saxValidate(xml) {
  const parser = sax.parser(true);
  const stack = []; let stopped = false; let info = null;
  parser.onopentag = n => {
    if (stopped) return;
    if (n.name === 'w:p' && (stack.includes('w:p') || stack.includes('w:pPr'))) {
      stopped = true; info = { issue: 'nested w:p', pos: parser.position }; return;
    }
    stack.push(n.name);
  };
  parser.onclosetag = () => { if (!stopped) stack.pop(); };
  parser.onerror = e => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) throw new Error('XML INVALID: ' + JSON.stringify(info));
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);
}

// Helper: standard body paragraph
const para = text =>
  '<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>' +
  '<w:r><w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>';

// Helper: two-run body paragraph starting with bold label
const labelPara = (boldText, restText) =>
  '<w:p><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">' + boldText + '</w:t></w:r>' +
  '<w:r><w:t xml:space="preserve">' + restText + '</w:t></w:r></w:p>';

// Helper: bullet list item (plain text)
const bullet = text =>
  '<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>' +
  '<w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>' +
  '<w:r><w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>';

// Helper: bullet item with bold opening word(s)
const bulletBold = (boldText, restText) =>
  '<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>' +
  '<w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">' + boldText + '</w:t></w:r>' +
  '<w:r><w:t xml:space="preserve">' + restText + '</w:t></w:r></w:p>';

// Helper: H1
const h1 = (id, anchor, text) =>
  '<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:pageBreakBefore/></w:pPr>' +
  '<w:bookmarkStart w:id="' + id + '" w:name="' + anchor + '"/>' +
  '<w:r><w:t>' + text + '</w:t></w:r>' +
  '<w:bookmarkEnd w:id="' + id + '"/></w:p>';

// Helper: H2
const h2 = (id, anchor, text) =>
  '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>' +
  '<w:bookmarkStart w:id="' + id + '" w:name="' + anchor + '"/>' +
  '<w:r><w:t>' + text + '</w:t></w:r>' +
  '<w:bookmarkEnd w:id="' + id + '"/></w:p>';

// Helper: bibliography entry
const ref = (num, text) =>
  '<w:p><w:pPr><w:spacing w:after="80" w:line="260" w:lineRule="auto"/><w:ind w:left="504" w:hanging="504"/></w:pPr>' +
  '<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="2E74B5"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>' +
  '<w:t xml:space="preserve">' + num + '.  </w:t></w:r>' +
  '<w:r><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>' +
  '<w:t xml:space="preserve">' + text + '</w:t></w:r></w:p>';

// Helper: TOC1 entry
const toc1 = (anchor, text, page) =>
  '<w:p><w:pPr><w:pStyle w:val="TOC1"/></w:pPr>' +
  '<w:hyperlink w:anchor="' + anchor + '" w:history="1">' +
  '<w:r><w:rPr><w:rStyle w:val="Hyperlink"/><w:noProof/></w:rPr><w:t>' + text + '</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:instrText xml:space="preserve"> PAGEREF ' + anchor + ' \\h </w:instrText></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:t>' + page + '</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>' +
  '</w:hyperlink></w:p>';

// Helper: TOC2 entry
const toc2 = (anchor, text, page) =>
  '<w:p><w:pPr><w:pStyle w:val="TOC2"/></w:pPr>' +
  '<w:hyperlink w:anchor="' + anchor + '" w:history="1">' +
  '<w:r><w:rPr><w:rStyle w:val="Hyperlink"/><w:noProof/></w:rPr><w:t>' + text + '</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:tab/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:instrText xml:space="preserve"> PAGEREF ' + anchor + ' \\h </w:instrText></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:t>' + page + '</w:t></w:r>' +
  '<w:r><w:rPr><w:noProof/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>' +
  '</w:hyperlink></w:p>';

// ---- Section 8 body XML ----
const SECTION8_BODY =
  h1('52', '_Toc231132536', 'Section 8: Principles of Treatment (Including AMR)') +

  para('Vaccination prevents disease. But when birds get sick despite vaccination, or when an unrelated bacterial infection hits the flock, your birds may need antibiotic treatment. Knowing how to use antibiotics legally, responsibly, and effectively is part of running a modern Canadian poultry operation.') +

  h2('53', '_Toc231132537', '8.1  What Is AMR and Why It Matters') +

  para('Antimicrobial resistance (AMR) happens when bacteria that would normally be killed by an antibiotic survive and pass on that ability to resist treatment [23]. Every time an antibiotic is used, it applies selection pressure on the bacteria present. The ones that survive are the ones most likely to carry and spread resistance. Over time, resistant strains can build up in the environment, the flock, and the surrounding soil and water.') +

  para('In Canadian commercial poultry, this matters for two reasons. First, some bacteria found in poultry barns can also cause illness in people, so resistance that develops on your farm can affect human health [23]. Second, once a drug class loses effectiveness, it is very difficult to restore. The antibiotics your veterinarian prescribes today are the same tools that human medicine depends on in some situations, and they are worth protecting.') +

  para('You do not need to understand the molecular biology of resistance to manage this well on your farm. What you need to know is straightforward: use the right drug, at the right dose, for the correct duration, only when your veterinarian has confirmed it is needed. That approach reduces the selection pressure you apply and keeps those tools working longer for everyone.') +

  h2('54', '_Toc231132538', '8.2  Antibiotics in Canada: What the Law Requires') +

  para('Since December 1, 2018, all medically important antimicrobials in Canada require a valid prescription from a licensed veterinarian before use in any food animal [24]. This covers Health Canada antimicrobial importance Categories I, II, and III, which includes nearly all antibiotics used routinely in poultry production. Over-the-counter purchase of these products is no longer legal [24].') +

  para('To write a prescription, your veterinarian must have an established veterinarian-client-patient relationship (VCPR) with your farm. That means your vet must know your operation and your birds well enough to make a clinical judgment. This is why keeping your attending veterinarian regularly updated on what is happening in your barn is not just good practice: it is required before any prescription treatment can begin.') +

  h2('55', '_Toc231132539', '8.3  Treatment Routes') +

  para('When your veterinarian prescribes antibiotic treatment, it will be delivered through one of three routes. Each has its place depending on the situation.') +

  bulletBold('Drinking water', ' is the fastest route when you need to treat an active outbreak. Sick birds stop eating before they stop drinking, which means water medication reaches affected birds faster than medicated feed. Before medicating, flush your drinker lines thoroughly to clear biofilm and debris: both will bind the antibiotic and reduce the dose birds actually receive. Flush the lines again after the treatment period ends.') +

  bulletBold('Feed medication', ' works well for preventive or control programs written under a specific veterinary prescription for your flock category. Because sick birds eat less, medicated feed is slower to act during an active outbreak than water treatment. Do not switch medication routes without first consulting your veterinarian.') +

  bulletBold('Injectable antibiotics', ' deliver a precise dose directly to individual birds or small groups. They are most useful for breeding stock, small treatment groups, or when the required drug is not available in water or feed form. Long-acting injectables are practical in layer or breeder operations where pulling water temporarily is not feasible.') +

  h2('56', '_Toc231132540', '8.4  Withdrawal Times and Record-Keeping') +

  para('Every approved antibiotic label states a withdrawal time: the number of days that must pass after the last dose before birds can go to slaughter or eggs can be sold. Sending birds before that window closes is a food safety violation. Residues detected at the processing plant can result in carcass condemnation, program suspension, or loss of contract.') +

  para('Keep a written treatment record for every drug event on your farm. Your attending veterinarian, your processor, and your program supervisor all have the right to request these records at any time. Each record should include:') +

  bullet('Date treatment started and ended') +
  bullet('Drug name, active ingredient, and Health Canada importance category') +
  bullet('Dose and route of administration') +
  bullet('Number and type of birds treated') +
  bullet('Prescription number from your veterinarian') +
  bullet('Withdrawal date calculated from the last day of treatment');

// ---- TOC entries for Section 8 ----
const SECTION8_TOC =
  toc1('_Toc231132536', 'Section 8: Principles of Treatment (Including AMR)', '47') +
  toc2('_Toc231132537', '8.1  What Is AMR and Why It Matters', '47') +
  toc2('_Toc231132538', '8.2  Antibiotics in Canada: What the Law Requires', '47') +
  toc2('_Toc231132539', '8.3  Treatment Routes', '47') +
  toc2('_Toc231132540', '8.4  Withdrawal Times and Record-Keeping', '47');

// ---- New bibliography references ----
const NEW_REFS =
  ref('23', 'Public Health Agency of Canada. Canadian Integrated Program for Antimicrobial Resistance Surveillance (CIPARS) 2023 Annual Report. Ottawa: PHAC; 2023. Available from: canada.ca/en/public-health/services/publications/drugs-health-products/canadian-integrated-program-antimicrobial-resistance-surveillance-2023-key-integrated-findings.html') +
  ref('24', 'Health Canada. Responsible use of Medically Important Antimicrobials in Animals. Ottawa: Health Canada; 2023 [cited 2026 Jun]. Available from: canada.ca/en/health-canada/services/drugs-health-products/veterinary-drugs/antimicrobial-resistance/actions/responsible-use-antimicrobials.html');

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  // ---- 1. Insert body content before "Recommended Peer-Reviewed Journals" heading ----
  // The body heading has a unique bookmarkStart: w:name="_Toc231132528" at id 44
  const BODY_ANCHOR = '<w:bookmarkStart w:id="44" w:name="_Toc231132528"/>';
  // Walk back from the anchor to find the paragraph start
  const bodyAnchorPos = xml.lastIndexOf(BODY_ANCHOR);
  if (bodyAnchorPos < 0) throw new Error('NOT FOUND: body anchor for Recommended Peer-Reviewed Journals');
  const paraStartPos = xml.lastIndexOf('<w:p ', bodyAnchorPos);
  if (paraStartPos < 0) throw new Error('NOT FOUND: paragraph start before body anchor');
  // Verify this paragraph contains Recommended Peer-Reviewed Journals
  const check = xml.slice(paraStartPos, paraStartPos + 300);
  if (!check.includes('Recommended Peer-Reviewed Journals')) {
    throw new Error('Sanity fail: paragraph at ' + paraStartPos + ' does not contain expected heading');
  }
  // Insert Section 8 before this paragraph
  xml = xml.slice(0, paraStartPos) + SECTION8_BODY + xml.slice(paraStartPos);
  console.log('  Inserted Section 8 body before Recommended Peer-Reviewed Journals heading');

  // ---- 2. Insert TOC entries before "Recommended Peer-Reviewed Journals" TOC entry ----
  // TOC entry uses hyperlink anchor _Toc231132528; find it within the SDT block
  const TOC_ANCHOR = '<w:hyperlink w:anchor="_Toc231132528" w:history="1"><w:r w:rsidRPr="00542FD8">';
  const tocAnchorPos = xml.indexOf(TOC_ANCHOR);
  if (tocAnchorPos < 0) throw new Error('NOT FOUND: TOC anchor for Recommended Peer-Reviewed Journals');
  // Walk back to find the paragraph start
  const tocParaStart = xml.lastIndexOf('<w:p ', tocAnchorPos);
  if (tocParaStart < 0) throw new Error('NOT FOUND: TOC paragraph start');
  xml = xml.slice(0, tocParaStart) + SECTION8_TOC + xml.slice(tocParaStart);
  console.log('  Inserted Section 8 TOC entries before Recommended Peer-Reviewed Journals TOC entry');

  // ---- 3. Append refs [23] and [24] before </w:p><w:sectPr> ----
  const REF_TAIL_ANCHOR = '</w:t></w:r></w:p><w:sectPr w:rsidR="00997264">';
  const refPos = xml.lastIndexOf(REF_TAIL_ANCHOR);
  if (refPos < 0) throw new Error('NOT FOUND: bibliography tail / sectPr anchor');
  const insertAt = refPos + '</w:t></w:r></w:p>'.length;
  xml = xml.slice(0, insertAt) + NEW_REFS + xml.slice(insertAt);
  console.log('  Appended refs [23] and [24] to bibliography');

  // ---- 4. SAX validate ----
  saxValidate(xml);
  console.log('  document.xml SAX: PASS');

  // ---- 5. Verify key strings exist ----
  const checks = [
    'Section 8: Principles of Treatment (Including AMR)',
    '8.1  What Is AMR and Why It Matters',
    '8.2  Antibiotics in Canada: What the Law Requires',
    '8.3  Treatment Routes',
    '8.4  Withdrawal Times and Record-Keeping',
    'CIPARS',
    'Health Canada',
    '_Toc231132536',
  ];
  checks.forEach(s => {
    if (!xml.includes(s)) throw new Error('POST-VERIFY FAIL: ' + s);
  });
  console.log('  All post-insert checks: PASS');

  // ---- 6. Write ----
  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
