const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_cover");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Show all paras 0-15 in full
let pos = 0, idx = 0;
while (pos < docXml.length && idx <= 15) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  console.log(`\n=== Para ${idx} (len=${p.length}) ===`);
  // Show first 400 chars
  console.log(p.substring(0, 400) + (p.length > 400 ? "..." : ""));
  pos = pE;
  idx++;
}

// Also show structure around where TOC ends and content starts
// Find Introduction heading
const introPos = docXml.indexOf('<w:t xml:space="preserve">Introduction</w:t>');
if (introPos !== -1) {
  // Find surrounding paragraphs
  const before = docXml.lastIndexOf("<w:p", introPos - 1);
  const before2 = docXml.lastIndexOf("<w:p", before - 1);
  const before3 = docXml.lastIndexOf("<w:p", before2 - 1);
  const pEnd1 = docXml.indexOf("</w:p>", before3) + 6;
  const pEnd2 = docXml.indexOf("</w:p>", pEnd1) + 6;
  const pEnd3 = docXml.indexOf("</w:p>", pEnd2) + 6;
  const pEnd4 = docXml.indexOf("</w:p>", pEnd3) + 6;
  console.log("\n\n=== Paragraphs just before Introduction ===");
  console.log("Para -3:", docXml.slice(before3, pEnd1));
  console.log("Para -2:", docXml.slice(pEnd1, pEnd2));
  console.log("Para -1:", docXml.slice(pEnd2, pEnd3));
  console.log("Para 0 (Intro):", docXml.slice(pEnd3, pEnd4));
}
