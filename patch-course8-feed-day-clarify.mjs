// patch-course8-feed-day-clarify.mjs
// Revises the §5.3 feed/vaccination timing instruction.
//
// Background:
//   Inactive-Vax [20] says "Do not vaccinate the birds on the feed day."
//   "Feed day" is a restricted-feeding concept: breeders and layer pullets receive
//   their ration allocation only on designated days (e.g. 5 days/week, skip-a-day,
//   or every-other-day programs). On those days the crop is full. Non-feed days
//   = empty crop = safer to handle.
//
//   Commercial broilers are ad libitum (free-choice) fed — there is no "feed day"
//   vs non-feed day for them. The same underlying principle applies (full crop +
//   handling → regurgitation risk), but the language needs to work for both
//   ad libitum broiler flocks AND restricted-fed breeder/layer flocks.
//
//   The previous correction faithfully quoted the source but left "feed day"
//   unexplained, which would confuse any broiler farmer reading the course.
//   This patch rewrites the sentence to express the actual principle clearly
//   for both audiences.

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import sax from './node_modules/sax/lib/sax.js';

const FILE = 'Course 8/Vaccination_draft.docx';

const FIXES = [
  {
    desc: 'Clarify §5.3 feed timing: replace "feed day" jargon with plain principle that works for both broiler and breeder audiences',
    old: 'Do not vaccinate the birds on the feed day [20]. A full crop combined with handling increases the risk of regurgitation and aspiration. Aim to vaccinate when birds have had several hours without feed and are settled.',
    new: 'Avoid vaccinating when birds have just eaten a large meal. For flocks on a restricted feeding program, vaccinate on a non-feed day or before the morning ration is delivered. For ad libitum fed birds, wait until the flock has been settled for at least two to three hours after the last big feed push [20]. A full crop combined with handling increases the risk of regurgitation and aspiration.',
  },
];

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');

  let allPassed = true;
  for (const fix of FIXES) {
    if (!xml.includes(fix.old)) {
      console.error(`  ANCHOR NOT FOUND: ${fix.desc}`);
      console.error(`    Looking for: ${fix.old.slice(0, 80)}`);
      allPassed = false;
      continue;
    }
    const count = (xml.split(fix.old).length - 1);
    if (count > 1) {
      console.error(`  ANCHOR NOT UNIQUE (${count}×): ${fix.desc}`);
      allPassed = false;
      continue;
    }
    xml = xml.split(fix.old).join(fix.new);
    console.log(`  OK: ${fix.desc}`);
  }

  if (!allPassed) throw new Error('One or more anchors failed — see above. No file was written.');

  // SAX validation
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
  console.log('\n  SAX validation: PASS');

  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
  if (bad) throw new Error('Unescaped & in XML: ' + bad.length);

  zip.file('word/document.xml', xml);
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(FILE, buf);
  console.log(`\n  Done. ${FILE} (${(buf.length / 1024).toFixed(1)} KB)`);
}

run().catch(e => { console.error(e); process.exit(1); });
