// patch-course8-photo51.cjs — replace Photo 5.1 image (rId21 -> media/image13.png)
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const IMG = path.join(__dirname, 'Course 8', 'Injection vaccination in pullets befor transfer to layeing house 2.png');

(async () => {
  const newBuf = fs.readFileSync(IMG);
  if (newBuf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('new file is not a PNG');
  const w = newBuf.readUInt32BE(16), h = newBuf.readUInt32BE(20);

  const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
  let xml = await zip.file('word/document.xml').async('string');

  // locate Photo 5.1 drawing
  const cap = xml.indexOf('Photo 5.1');
  if (cap < 0) throw new Error('Photo 5.1 caption not found');
  const dStart = xml.lastIndexOf('<w:drawing>', cap);
  const dEnd = xml.indexOf('</w:drawing>', dStart) + '</w:drawing>'.length;
  let draw = xml.slice(dStart, dEnd);
  if (!/r:embed="rId21"/.test(draw)) throw new Error('Photo 5.1 drawing is not rId21');

  // keep current width, recompute height to preserve new image aspect ratio
  const cx = 5305425;
  const cy = Math.round(cx * h / w);
  const before = draw;
  draw = draw.replace(/cx="5305425" cy="3648075"/g, `cx="${cx}" cy="${cy}"`);
  const replaced = (before.match(/cx="5305425" cy="3648075"/g) || []).length;
  if (replaced < 2) throw new Error('expected 2 extent matches in drawing, found ' + replaced);
  xml = xml.slice(0, dStart) + draw + xml.slice(dEnd);

  zip.file('word/document.xml', xml);
  zip.file('word/media/image13.png', newBuf);

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(SRC, buf);
  console.log(`Photo 5.1 image replaced. New ${w}x${h}px, display ${(cx/914400).toFixed(2)}" x ${(cy/914400).toFixed(2)}" (extent updated ${replaced}x).`);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
