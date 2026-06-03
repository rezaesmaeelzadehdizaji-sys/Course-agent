// patch-course8-injector-text.mjs
// Two text edits in Section 5.3 (Equipment and Vaccine Handling):
//   1. Rewrite auto-injector calibration sentence block
//   2. Remove "into mineral oil" from mid-session check sentence

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const fixes = [
  [
    'These injectors draw a fixed volume from the bottle and reset automatically between birds. Set the dose volume according to the vaccine label before starting and test-inject five doses into a syringe using mineral oil (its viscosity is similar to vaccine, giving an accurate calibration check). Do not use a manual syringe for large flocks: speed and consistency both suffer [20].',
    'These automatic injectors pull the same amount of vaccine from the bottle every time and reset on their own between birds. Set the dose to match the vaccine label, then fire five test shots into a marked syringe or measuring tube with whatever test fluid your vet or the injector maker recommends. On big flocks, skip the hand syringe if you can, because it is slower and the doses are usually less even than with an automatic injector [20].',
  ],
  [
    'A second five-dose check into mineral oil at the halfway point confirms the injector is still delivering the correct volume.',
    'A second five-dose check at the halfway point confirms the injector is still delivering the correct volume.',
  ],
];

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  for (const [find, replace] of fixes) {
    if (!xml.includes(find)) throw new Error('Anchor not found: ' + find.slice(0, 60));
    if ((xml.split(find).length - 1) > 1) throw new Error('Anchor is not unique: ' + find.slice(0, 60));
    xml = xml.replace(find, replace);
    console.log('  Replaced:', find.slice(0, 60) + '...');
  }

  // SAX + schema-nesting validation
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
  parser.onerror = (e) => { if (!stopped) { stopped = true; info = { err: e.message.split('\n')[0], pos: parser.position }; } };
  try { parser.write(xml).close(); } catch (e) {}
  if (info) { console.error('XML INVALID:', info); throw new Error('SAX validation failed'); }
  if (stack.length !== 0) throw new Error('Unclosed tags: ' + stack.join(', '));
  console.log('  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
