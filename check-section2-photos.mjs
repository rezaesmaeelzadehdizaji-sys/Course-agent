// check-section2-photos.mjs — pre-flight for the section 2 photo replacement patch
import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';

const FILE = 'Course 8/Vaccination_draft.docx';

async function run() {
  const zip = await JSZip.loadAsync(fs.readFileSync(FILE));
  const xml = await zip.file('word/document.xml').async('string');

  // ── Helper: find paragraph containing a position ─────────────────────────
  function paraAround(pos) {
    const start = xml.lastIndexOf('<w:p ', pos);
    const end   = xml.indexOf('</w:p>', pos) + '</w:p>'.length;
    return { start, end, snippet: xml.slice(start, Math.min(start + 600, end)) };
  }

  // ── Check rId14 (Photo 2.1 image) ─────────────────────────────────────────
  const rid14 = xml.indexOf('r:embed="rId14"');
  if (rid14 < 0) { console.log('ERROR: rId14 not found'); }
  else {
    const p = paraAround(rid14);
    console.log('=== Photo 2.1 IMAGE PARA ===');
    console.log('start:', p.start, '  end:', p.end);
    const docPr = xml.slice(xml.lastIndexOf('<wp:docPr', rid14), xml.indexOf('/>', xml.lastIndexOf('<wp:docPr', rid14)) + 2);
    console.log('docPr:', docPr);
  }

  // ── Check rId16 (Photo 2.2 image) ─────────────────────────────────────────
  const rid16 = xml.indexOf('r:embed="rId16"');
  if (rid16 < 0) { console.log('ERROR: rId16 not found'); }
  else {
    const docPr = xml.slice(xml.lastIndexOf('<wp:docPr', rid16), xml.indexOf('/>', xml.lastIndexOf('<wp:docPr', rid16)) + 2);
    console.log('\n=== Photo 2.2 IMAGE PARA ===');
    console.log('docPr:', docPr);
    const extPos = xml.lastIndexOf('<wp:extent', rid16);
    const extStr = xml.slice(extPos, xml.indexOf('/>', extPos) + 2);
    console.log('extent:', extStr);
  }

  // ── Check rId27 (Photo 2.3 image) ─────────────────────────────────────────
  const rid27 = xml.indexOf('r:embed="rId27"');
  if (rid27 < 0) { console.log('ERROR: rId27 not found'); }
  else {
    const p = paraAround(rid27);
    console.log('\n=== Photo 2.3 IMAGE PARA ===');
    console.log('start:', p.start, '  end:', p.end);
    const docPr = xml.slice(xml.lastIndexOf('<wp:docPr', rid27), xml.indexOf('/>', xml.lastIndexOf('<wp:docPr', rid27)) + 2);
    console.log('docPr:', docPr);
    const extPos = xml.lastIndexOf('<wp:extent', rid27);
    const extStr = xml.slice(extPos, xml.indexOf('/>', extPos) + 2);
    console.log('extent:', extStr);
    const cNvPr = xml.slice(xml.lastIndexOf('<pic:cNvPr', rid27), xml.indexOf('/>', xml.lastIndexOf('<pic:cNvPr', rid27)) + 2);
    console.log('cNvPr:', cNvPr);
  }

  // ── Find caption paragraphs by scanning all <w:t> text ───────────────────
  const textRuns = [];
  const runRe = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m;
  while ((m = runRe.exec(xml)) !== null) {
    textRuns.push({ text: m[1], pos: m.index });
  }

  for (const label of ['Photo 2.1', 'Photo 2.2', 'Photo 2.3']) {
    // find first run whose text contains this label
    const hit = textRuns.find(r => r.text.includes(label));
    if (!hit) { console.log(`\n${label}: NOT FOUND in text runs`); continue; }
    const p = paraAround(hit.pos);
    console.log(`\n=== ${label} CAPTION PARA ===`);
    console.log('start:', p.start, '  end:', p.end);
    // Show all text in this paragraph
    const paraXml = xml.slice(p.start, p.end);
    const texts = [...paraXml.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map(x => x[1]).join('');
    console.log('Full text:', texts);
    console.log('First 400 chars XML:', paraXml.slice(0, 400));
  }

  // ── Verify paragraph ordering ─────────────────────────────────────────────
  console.log('\n=== POSITION SUMMARY ===');
  const positions = {};
  if (rid14 >= 0) positions['Photo2.1 img (rId14)'] = rid14;
  if (rid16 >= 0) positions['Photo2.2 img (rId16)'] = rid16;
  if (rid27 >= 0) positions['Photo2.3 img (rId27)'] = rid27;
  for (const label of ['Photo 2.1', 'Photo 2.2', 'Photo 2.3']) {
    const hit = textRuns.find(r => r.text.includes(label));
    if (hit) positions[label + ' caption'] = hit.pos;
  }
  Object.entries(positions).sort((a,b) => a[1]-b[1]).forEach(([k,v]) => console.log(v.toString().padStart(8), k));
}

run().catch(e => { console.error(e); process.exit(1); });
