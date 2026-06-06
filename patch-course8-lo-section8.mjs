// patch-course8-lo-section8.mjs
// Adds three Section 8 (AMR/Treatment) learning objectives to the Introduction
// after the existing 6th LO bullet in the course body.

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

function loBullet(text) {
  return (
    '<w:p><w:pPr>' +
    '<w:pStyle w:val="ListParagraph"/>' +
    '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>' +
    '<w:spacing w:after="80" w:line="276" w:lineRule="auto"/>' +
    '</w:pPr>' +
    '<w:r><w:t>' + text + '</w:t></w:r>' +
    '</w:p>'
  );
}

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  const OLD = 'Recognize what a vaccination failure looks like in the flock, and catch it before birds start getting sick.</w:t></w:r></w:p>';
  if (!xml.includes(OLD)) throw new Error('NOT FOUND: last existing LO bullet');
  if (xml.split(OLD).length - 1 > 1) throw new Error('NOT UNIQUE: last existing LO bullet');

  const NEW =
    OLD +
    loBullet('Explain how antibiotic resistance develops and why it matters for your flock\'s long-term health and your market access.') +
    loBullet('Know the Canadian legal requirements for antibiotic use in commercial poultry: VCPR, Veterinary Health Certificate, and the prescription rules that took effect December 1, 2018.') +
    loBullet('Select the right treatment route for each situation, observe the correct withdrawal time, and keep complete treatment records.');

  xml = xml.split(OLD).join(NEW);
  console.log('  Added 3 Section 8 learning objectives to Introduction');

  saxValidate(xml);
  console.log('  SAX: PASS');

  const checks = [
    ['antibiotic resistance develops and why it matters for your flock', true],
    ['VCPR, Veterinary Health Certificate, and the prescription rules', true],
    ['Select the right treatment route for each situation', true],
  ];
  checks.forEach(([s, should]) => {
    const found = xml.includes(s);
    if (found !== should) throw new Error('FAIL: ' + s);
    console.log('  OK [' + (should ? 'present' : 'removed') + ']: ' + s.slice(0, 70));
  });

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log('\nDone. ' + FILE + ' (' + (buf.length / 1024).toFixed(1) + ' KB)');
}

run().catch(e => { console.error(e); process.exit(1); });
