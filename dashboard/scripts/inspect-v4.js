const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_v4_inspect");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Show paras 0-25 summary
let pos = 0, idx = 0;
while (pos < docXml.length && idx < 26) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  const hasPB = p.includes('w:type="page"');
  const hasSectPr = p.includes("<w:sectPr");
  const hasFld = p.includes("w:fldChar") || p.includes("w:instrText");
  const isH1 = p.includes('w:val="Heading1"');
  const isH2 = p.includes('w:val="Heading2"');
  const isTOC1 = p.includes('w:val="TOC1"');
  const isTOC2 = p.includes('w:val="TOC2"');
  const text = p.replace(/<[^>]+>/g, "").trim().substring(0, 60);
  const flags = [hasPB?"PB":"", hasSectPr?"SECT":"", hasFld?"FLD":"", isH1?"H1":"", isH2?"H2":"", isTOC1?"TOC1":"", isTOC2?"TOC2":""].filter(Boolean).join("|");
  console.log(`[${idx}] ${flags||"para"} len=${p.length} "${text}"`);
  pos = pE;
  idx++;
}

// Show full content of paras 0-15 (cover page area)
console.log("\n=== Full cover page paragraphs (0-15) ===");
pos = 0; idx = 0;
while (pos < docXml.length && idx <= 15) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  if (idx >= 10) {
    console.log(`\n--- Para ${idx} (len=${p.length}) ---`);
    console.log(p);
  }
  pos = pE;
  idx++;
}
