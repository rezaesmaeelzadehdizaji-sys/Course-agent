const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_tocend");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");

// Find the last TOC2 paragraph and show 10 paras around it
let pos = 0, idx = 0;
let lastTocIdx = -1, lastTocPos = -1;
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  const p = docXml.slice(pS, pE);
  if (p.includes('w:val="TOC1"') || p.includes('w:val="TOC2"')) {
    lastTocIdx = idx;
    lastTocPos = pE;
  }
  pos = pE;
  idx++;
}
console.log(`Last TOC entry at para ${lastTocIdx}`);

// Now show paras from lastTocIdx-2 to lastTocIdx+8
pos = 0; idx = 0;
const entries = [];
while (pos < docXml.length) {
  const pS = docXml.indexOf("<w:p", pos);
  if (pS === -1) break;
  const pE = docXml.indexOf("</w:p>", pS) + 6;
  if (pE < 6) break;
  entries.push({ idx, xml: docXml.slice(pS, pE) });
  pos = pE;
  idx++;
}

for (let i = lastTocIdx - 1; i <= lastTocIdx + 8 && i < entries.length; i++) {
  const e = entries[i];
  const p = e.xml;
  const hasPB = p.includes('w:type="page"');
  const hasSectPr = p.includes("<w:sectPr");
  const isH1 = p.includes('w:val="Heading1"');
  const isTOC1 = p.includes('w:val="TOC1"');
  const isTOC2 = p.includes('w:val="TOC2"');
  const text = p.replace(/<[^>]+>/g, "").trim().substring(0, 80);
  const flags = [hasPB?"PB":"", hasSectPr?"SECT":"", isH1?"H1":"", isTOC1?"TOC1":"", isTOC2?"TOC2":""].filter(Boolean).join("|");
  console.log(`[${e.idx}] ${flags||"para"} len=${p.length} "${text}"`);
  if (e.idx >= lastTocIdx + 1) console.log("    XML:", p.substring(0, 200));
}
