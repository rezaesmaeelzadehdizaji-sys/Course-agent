// Course 8 summary page: sentence-level farmer-flow pass (2026-11-19). Headings untouched (locked).
const JSZip = require('jszip');
const fs = require('fs');
const FILE = 'Course 8/Summary_Page_Course8_Vaccination.docx';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  let xml = await zip.file('word/document.xml').async('string');
  const fixes = [
    ['Every vaccination method has a different entry point into the immune system, and every route comes with its own technique, equipment, and troubleshooting challenges.',
     'Every vaccination method gets into the bird a different way, and each one has its own technique, equipment, and ways to go wrong.'],
    ['how to execute each one correctly', 'how to do each one right'],
    ['Choose the correct vaccination route for each disease and flock type, and explain the immune mechanism behind that route.',
     'Match each vaccination route to the diseases and flock types it suits, and explain why it works.'],
    ['Explain how antibiotic resistance develops and why misuse of antibiotics threatens long-term flock productivity and market access.',
     'Explain how antibiotic resistance builds up, and why misusing antibiotics hurts your flock and your markets.'],
    ['name the four signs that require a veterinarian call.', 'name the four signs that mean it is time to call your veterinarian.'],
    ['Select the appropriate treatment route for each situation, observe withdrawal times, and maintain complete treatment records.',
     'Know when water, feed, or injectable treatment fits, follow withdrawal times, and keep complete treatment records.'],
  ];
  for (const [a, b] of fixes) {
    if (!xml.includes(esc(a)) && xml.includes(esc(b))) continue;   // already applied: safe to re-run
    const n = xml.split(esc(a)).length - 1;
    if (n !== 1) throw new Error(`expected 1 hit, got ${n}: ${a.slice(0, 60)}`);
    xml = xml.replace(esc(a), esc(b));
  }
  zip.file('word/document.xml', xml);
  fs.writeFileSync(FILE, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('Summary page: ' + fixes.length + ' tone edits');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
