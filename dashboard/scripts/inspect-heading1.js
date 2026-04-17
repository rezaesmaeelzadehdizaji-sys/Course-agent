const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_h1");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);

const stylesXml = fs.readFileSync(path.join(ex, "word", "styles.xml"), "utf-8");

// Print full Heading1 style
const h1start = stylesXml.indexOf('w:styleId="Heading1"');
const h1styleStart = stylesXml.lastIndexOf("<w:style", h1start);
const h1styleEnd = stylesXml.indexOf("</w:style>", h1styleStart) + 10;
console.log("=== Full Heading1 style ===");
console.log(stylesXml.slice(h1styleStart, h1styleEnd));

// Also print the document default style
const docDefaultStart = stylesXml.indexOf('<w:docDefaults>');
const docDefaultEnd = stylesXml.indexOf('</w:docDefaults>') + 16;
console.log("\n=== docDefaults ===");
console.log(stylesXml.slice(docDefaultStart, docDefaultEnd));

// Check Normal style
const normalStart = stylesXml.indexOf('w:styleId="Normal"');
if (normalStart !== -1) {
  const ns = stylesXml.lastIndexOf("<w:style", normalStart);
  const ne = stylesXml.indexOf("</w:style>", ns) + 10;
  console.log("\n=== Normal style ===");
  console.log(stylesXml.slice(ns, ne).substring(0, 600));
}
