/**
 * inspect-course7.js — diagnostic script for current Course 7 docx state
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_inspect");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });

const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const extractDir = path.join(WORK, "extracted");
const zipWin = zip.replace(/\//g, "\\");
const extractWin = extractDir.replace(/\//g, "\\");
execSync(`powershell -Command "Expand-Archive -Path '${zipWin}' -DestinationPath '${extractWin}' -Force"`);

const docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");
const settings = fs.readFileSync(path.join(extractDir, "word", "settings.xml"), "utf-8");

// ── Settings.xml updateFields check ───────────────────────────
console.log("=== settings.xml updateFields ===");
console.log("Occurrences:", (settings.match(/updateFields/gi) || []).length);
const idx = settings.indexOf("updateFields");
if (idx !== -1) console.log("Context:", settings.substring(Math.max(0, idx - 100), idx + 100));
console.log("\n=== settings.xml first 600 chars ===");
console.log(settings.substring(0, 600));

// ── Photo captions ──────────────────────────────────────────
console.log("\n=== Photo captions ===");
const captions = [];
let pos = 0;
while (pos < docXml.length) {
  const pStart = docXml.indexOf("<w:p", pos);
  if (pStart === -1) break;
  const pEnd = docXml.indexOf("</w:p>", pStart) + 6;
  if (pEnd < 6) break;
  const para = docXml.slice(pStart, pEnd);
  if (para.includes("595959") && para.includes("Photo:")) {
    const textMatch = para.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
    if (textMatch) captions.push(textMatch[1]);
  }
  pos = pEnd;
}
console.log("Count:", captions.length);
captions.forEach((c, i) => console.log(`${i + 1}. ${c.substring(0, 120)}`));

// ── Page breaks ────────────────────────────────────────────
console.log("\n=== Page breaks / empty paragraphs near start ===");
pos = 0;
let paraCount = 0;
while (pos < docXml.length && paraCount < 30) {
  const pStart = docXml.indexOf("<w:p", pos);
  if (pStart === -1) break;
  const pEnd = docXml.indexOf("</w:p>", pStart) + 6;
  if (pEnd < 6) break;
  const para = docXml.slice(pStart, pEnd);
  const hasPageBreak = para.includes('w:type="page"') || para.includes("w:pageBreak");
  const isEmpty = para.replace(/<[^>]+>/g, "").trim() === "";
  if (hasPageBreak || isEmpty) {
    console.log(`Para ${paraCount}: pageBreak=${hasPageBreak} empty=${isEmpty} len=${para.length}`);
    console.log("  " + para.substring(0, 200));
  }
  pos = pEnd;
  paraCount++;
}

// ── Heading2 paragraphs - check their run font sizes ────────
console.log("\n=== Heading2 paragraphs with explicit font sizes ===");
pos = 0;
let h2count = 0;
while (pos < docXml.length && h2count < 30) {
  const pStart = docXml.indexOf("<w:p", pos);
  if (pStart === -1) break;
  const pEnd = docXml.indexOf("</w:p>", pStart) + 6;
  if (pEnd < 6) break;
  const para = docXml.slice(pStart, pEnd);
  if (para.includes('w:val="Heading2"')) {
    const szMatch = para.match(/<w:sz w:val="(\d+)"/);
    const textMatch = para.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
    const text = textMatch ? textMatch[1].substring(0, 60) : "(no text)";
    console.log(`H2: sz=${szMatch ? szMatch[1] : "none (inherits style)"} | "${text}"`);
    h2count++;
  }
  pos = pEnd;
}
