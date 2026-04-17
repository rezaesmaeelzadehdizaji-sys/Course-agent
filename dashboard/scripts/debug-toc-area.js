const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_tocarea");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Find the TOC heading and dump paragraphs 16-30 in detail
let pos = 0, idx = 0;
const allParas = [];
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  allParas.push({ idx, start: pS, end: pE, xml: docXml.slice(pS, pE) });
  pos = pE;
  idx++;
}

console.log(`Total paragraphs: ${allParas.length}`);

// Show paras 15-30 (the TOC area)
for (let i = 15; i <= 30 && i < allParas.length; i++) {
  const p = allParas[i];
  const style = (p.xml.match(/w:pStyle w:val="([^"]+)"/) || ['',''])[1] || 'none';
  const text = p.xml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 80);
  const hasFldBegin = p.xml.includes('fldCharType="begin"');
  const hasFldEnd = p.xml.includes('fldCharType="end"');
  const hasTab = p.xml.includes('<w:tab/>');
  const hasTabs = p.xml.includes('<w:tabs>');
  console.log(`\n[${i}] style=${style} fldBegin=${hasFldBegin} fldEnd=${hasFldEnd} tab=${hasTab} tabs=${hasTabs}`);
  console.log(`  TEXT: "${text}"`);
  // Show tab runs specifically
  if (hasTab) {
    const tabRuns = p.xml.match(/<w:r>[^<]*<w:tab\/>[^<]*<\/w:r>/g) || [];
    console.log(`  Tab runs: ${tabRuns.length}`);
  }
  // Show full XML for first 3 entries
  if (i <= 22) console.log(`  XML: ${p.xml.substring(0, 500)}`);
}

// Count field delimiters
const begins = (docXml.match(/fldCharType="begin"/g) || []).length;
const seps = (docXml.match(/fldCharType="separate"/g) || []).length;
const ends = (docXml.match(/fldCharType="end"/g) || []).length;
console.log(`\nfldChar: begin=${begins} separate=${seps} end=${ends}`);
