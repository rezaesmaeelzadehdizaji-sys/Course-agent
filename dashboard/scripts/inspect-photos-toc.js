const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_phototoc");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Find all Photo X references
console.log("=== PHOTO PLACEHOLDERS ===");
const photoRegex = /Photo \d+/g;
let m;
while ((m = photoRegex.exec(docXml)) !== null) {
  const ctx = docXml.slice(Math.max(0, m.index - 200), m.index + 200);
  const text = ctx.replace(/<[^>]+>/g, "").trim();
  console.log(`\n  Found: "${m[0]}" around text: "${text.substring(0, 120)}"`);
}

// Show all TOC entries
console.log("\n\n=== ALL TOC ENTRIES ===");
let pos = 0, idx = 0;
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  if (p.includes('w:val="TOC1"') || p.includes('w:val="TOC2"')) {
    const text = p.replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ");
    const style = p.includes('TOC2') ? 'TOC2' : 'TOC1';
    console.log(`  [${idx}] ${style}: "${text}"`);
    idx++;
  }
  pos = pE;
}

// Show rels file
console.log("\n\n=== EXISTING RELATIONSHIPS ===");
const relsPath = path.join(ex, "word", "_rels", "document.xml.rels");
if (fs.existsSync(relsPath)) {
  const rels = fs.readFileSync(relsPath, "utf-8");
  const imageRels = rels.match(/Relationship[^/]*image[^>]*/g) || [];
  imageRels.forEach(r => console.log(" ", r));
  console.log("\nFull rels (last 2000 chars):", rels.slice(-2000));
}

// Count media files
const mediaDir = path.join(ex, "word", "media");
if (fs.existsSync(mediaDir)) {
  const files = fs.readdirSync(mediaDir);
  console.log(`\n=== MEDIA FILES (${files.length}) ===`);
  files.forEach(f => console.log(" ", f));
}
