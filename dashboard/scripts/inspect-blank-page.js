const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_inspect2");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(
  `powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`
);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

let pos = 0, idx = 0;
while (pos < docXml.length && idx <= 25) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  const hasPB = p.includes('w:type="page"');
  const hasSectPr = p.includes("<w:sectPr");
  const text = p.replace(/<[^>]+>/g, "").trim().substring(0, 80);
  const styleMatch = p.match(/w:pStyle w:val="([^"]+)"/);
  const style = styleMatch ? styleMatch[1] : "-";
  console.log(`[${idx}] style=${style} PB=${hasPB} SECT=${hasSectPr} len=${p.length} "${text}"`);
  if (idx >= 10 && idx <= 22) console.log("  XML:", p.substring(0, 400));
  pos = pE;
  idx++;
}
