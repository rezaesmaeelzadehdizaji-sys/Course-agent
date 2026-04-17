const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_headings");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });

const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);

const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

let pos = 0, idx = 0;
const headings = [];
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);

  const h1 = p.includes('w:val="Heading1"');
  const h2 = p.includes('w:val="Heading2"');
  if (h1 || h2) {
    const text = p.replace(/<[^>]+>/g, "").trim();
    headings.push({ level: h1 ? 1 : 2, text, idx });
    console.log(`[${idx}] H${h1 ? 1 : 2}: ${text}`);
  }
  pos = pE;
  idx++;
}
console.log(`\nTotal: ${headings.length} headings`);
