/**
 * inspect-course7-detail.js — show paras 13-25 with full content
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_detail");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });

const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const extractDir = path.join(WORK, "extracted");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`);

const docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");

// Show paras 0-30 with index and full content (truncated at 400)
let pos = 0;
let paraIndex = 0;
while (pos < docXml.length && paraIndex < 30) {
  const pStart = docXml.indexOf("<w:p", pos);
  if (pStart === -1) break;
  const pEnd = docXml.indexOf("</w:p>", pStart) + 6;
  if (pEnd < 6) break;
  const para = docXml.slice(pStart, pEnd);
  const hasPageBreak = para.includes('w:type="page"');
  const hasSectPr = para.includes("<w:sectPr");
  const hasFld = para.includes("w:fldChar") || para.includes("w:instrText");
  const hasDrawing = para.includes("w:drawing");
  const textExtract = para.replace(/<[^>]+>/g, "").trim().substring(0, 60);
  console.log(`[${paraIndex}] pb=${hasPageBreak?1:0} sectPr=${hasSectPr?1:0} fld=${hasFld?1:0} img=${hasDrawing?1:0} len=${para.length} text="${textExtract}"`);
  pos = pEnd;
  paraIndex++;
}

// Also check the media directory
const mediaDir = path.join(extractDir, "word", "media");
console.log("\n=== Media files ===");
fs.readdirSync(mediaDir).forEach(f => {
  const size = Math.round(fs.statSync(path.join(mediaDir, f)).size / 1024);
  console.log(`  ${f} (${size} KB)`);
});
