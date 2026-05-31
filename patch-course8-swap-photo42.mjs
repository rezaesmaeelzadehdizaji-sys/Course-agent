// patch-course8-swap-photo42.mjs
// Replace Photo 4.2 image (word/media/image8.png) with a new file.
// Caption stays unchanged (already merged in previous patch).
// Run: node patch-course8-swap-photo42.mjs

import JSZip from './node_modules/jszip/dist/jszip.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC       = path.join(__dirname, 'Course 8', 'Vaccination_draft.docx');
const NEW_PHOTO = path.join(__dirname, 'Course 8', 'spray at broiler barn 2.png');

if (!fs.existsSync(NEW_PHOTO)) throw new Error(`New photo not found: ${NEW_PHOTO}`);

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
let xml   = await zip.file('word/document.xml').async('string');

const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (bad) throw new Error(`Unescaped & in source XML (${bad.length} found)`);

// ─── Read dimensions ──────────────────────────────────────────────────────────
const newPhotoBuf = fs.readFileSync(NEW_PHOTO);
const newW = newPhotoBuf.readUInt32BE(16);
const newH = newPhotoBuf.readUInt32BE(20);
console.log(`New photo dimensions: ${newW} x ${newH} px`);

const oldImg8Buf = await zip.file('word/media/image8.png').async('nodebuffer');
const oldW = oldImg8Buf.readUInt32BE(16);
const oldH = oldImg8Buf.readUInt32BE(20);
console.log(`Old image8.png dimensions: ${oldW} x ${oldH} px`);

// ─── Update <wp:extent> if aspect ratio changed significantly ─────────────────
const rId16idx = xml.indexOf('r:embed="rId16"');
if (rId16idx === -1) throw new Error('rId16 not found in document.xml');

const absRegionStart = Math.max(0, rId16idx - 2000);
const absRegionEnd   = rId16idx + 500;
const region         = xml.substring(absRegionStart, absRegionEnd);

const extentRe    = /(<wp:extent cx=")(\d+)(" cy=")(\d+)("\/?>)/;
const extentMatch = region.match(extentRe);

if (extentMatch) {
  const oldCx = parseInt(extentMatch[2]);
  const oldCy = parseInt(extentMatch[4]);
  const newCy = Math.round(oldCx * newH / newW);
  console.log(`Old cx=${oldCx} cy=${oldCy}  →  New cy=${newCy} (delta=${Math.abs(newCy - oldCy)} EMU)`);

  if (Math.abs(newCy - oldCy) > 10000) {
    const newExtent = `${extentMatch[1]}${oldCx}${extentMatch[3]}${newCy}${extentMatch[5]}`;
    const patchedRegion = region.replace(extentRe, newExtent);
    xml = xml.substring(0, absRegionStart) + patchedRegion + xml.substring(absRegionEnd);
    console.log('✓ Extent (cy) updated');
  } else {
    console.log('Aspect ratio close enough — keeping original extent');
  }
} else {
  console.log('⚠ <wp:extent> not found near rId16 — skipping dimension update');
}

// ─── Replace binary ──────────────────────────────────────────────────────────
zip.file('word/media/image8.png', newPhotoBuf);
console.log('✓ image8.png replaced with new spray photo 2');

// ─── Sanity check & write ────────────────────────────────────────────────────
const badAfter = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g);
if (badAfter) throw new Error(`Unescaped & introduced (${badAfter.length} found)`);

if (!xml.includes('Photo 4.2')) throw new Error('Photo 4.2 missing from document — aborting');
console.log('✓ Photo 4.2 confirmed present');

zip.file('word/document.xml', xml);
const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(SRC, buf);

console.log(`\nDone. Written to: ${SRC}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
