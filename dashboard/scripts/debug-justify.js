const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_debug");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Find cover end
const PAGE_BREAK = `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
const coverEnd = docXml.indexOf(PAGE_BREAK);
const bodyStart = coverEnd + PAGE_BREAK.length;
console.log(`Cover ends at: ${coverEnd}, body starts at: ${bodyStart}`);

// Count total paragraphs and show first 5 body text ones (no pStyle)
let pos = bodyStart, idx = 0, bodyTextCount = 0;
while (pos < docXml.length && idx < 200) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  const p = docXml.slice(pS, pE);
  if (!p.includes('<w:pStyle ') && p.includes('<w:t')) {
    bodyTextCount++;
    if (bodyTextCount <= 3) {
      console.log(`\n=== Body text para #${bodyTextCount} (idx=${idx}) ===`);
      console.log(p.substring(0, 400));
    }
  }
  pos = pE;
  idx++;
}
console.log(`\nTotal body text paragraphs (no pStyle, has <w:t): ${bodyTextCount}`);

// Also search for "ten of your broilers" (might be split across runs)
console.log("\n=== Searching for 'ten' near broilers ===");
const broilerIdx = docXml.indexOf("broilers suddenly stop eating");
if (broilerIdx !== -1) {
  const area = docXml.slice(Math.max(0, broilerIdx - 600), broilerIdx + 400);
  console.log("Context around 'broilers suddenly stop eating':");
  console.log(area);
} else {
  console.log("NOT FOUND: 'broilers suddenly stop eating'");
  // Try partial search
  const partial = docXml.indexOf("broilers suddenly");
  console.log("'broilers suddenly' found at:", partial);
  if (partial !== -1) {
    console.log("Context:", docXml.slice(partial - 200, partial + 200));
  }
}
