const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = path.resolve(__dirname, "../public/docs/course-07-common-poultry-diseases.docx");
const WORK = path.join(os.tmpdir(), "c7_settings_check");
if (fs.existsSync(WORK)) fs.rmSync(WORK, { recursive: true });
fs.mkdirSync(WORK, { recursive: true });

const zip = path.join(WORK, "c7.zip");
fs.copyFileSync(SRC, zip);
const ex = path.join(WORK, "ex");
execSync(`powershell -Command "Expand-Archive -Path '${zip.replace(/\//g, "\\")}' -DestinationPath '${ex.replace(/\//g, "\\")}' -Force"`);

const settings = fs.readFileSync(path.join(ex, "word", "settings.xml"), "utf-8");

// Check updateFields
const ufMatch = settings.match(/<w:updateFields[^>]*>/g);
console.log("updateFields tags:", ufMatch || "NONE FOUND");

// Show last 300 chars to see the closing
console.log("\nLast 300 chars of settings.xml:");
console.log(settings.slice(-300));

// Also check if TOC has w:dirty
const docXml = fs.readFileSync(path.join(ex, "word", "document.xml"), "utf-8");
const dirtyMatch = docXml.match(/w:dirty="[^"]*"/g);
console.log("\nw:dirty occurrences in document.xml:", dirtyMatch || "NONE");

// Count sectPr paragraphs
const sectPrParas = docXml.match(/<w:p><w:pPr><w:sectPr[\s\S]*?<\/w:sectPr><\/w:pPr><\/w:p>/g);
console.log("\nsectPr paragraphs found:", sectPrParas ? sectPrParas.length : 0);
