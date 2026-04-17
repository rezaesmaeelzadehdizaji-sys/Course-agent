const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_normalstyle");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });
const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);
const stylesXml = fs.readFileSync(path.join(ex, "word", "styles.xml"), "utf-8");

// Find all paragraph style IDs
const styleIds = [];
const re = /w:styleId="([^"]+)"/g;
let m;
while ((m = re.exec(stylesXml)) !== null) styleIds.push(m[1]);
console.log("All styleIds:", styleIds.join(", "));

// Show first 2000 chars
console.log("\nFirst 2000 chars of styles.xml:\n", stylesXml.substring(0, 2000));

// Find "Normal" anywhere
const normalIdx = stylesXml.indexOf("Normal");
console.log("\nFirst occurrence of 'Normal' at index:", normalIdx);
if (normalIdx !== -1) console.log("Context:", stylesXml.slice(normalIdx - 50, normalIdx + 200));
