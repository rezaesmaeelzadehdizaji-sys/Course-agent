const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_p21");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const extractDir = path.join(WORK, "extracted");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${extractDir.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(extractDir, "word", "document.xml"), "utf-8");

let pos = 0, idx = 0;
while (pos < docXml.length) {
  const pStart = docXml.indexOf("<w:p", pos);
  if (pStart === -1) break;
  const pEnd = docXml.indexOf("</w:p>", pStart) + 6;
  if (pEnd < 6) break;
  const para = docXml.slice(pStart, pEnd);
  if (idx >= 15 && idx <= 25) {
    console.log(`\n=== Para ${idx} (len=${para.length}) ===`);
    console.log(para);
  }
  pos = pEnd;
  idx++;
}
