// dev/loc.js
const fs = require("fs");
const path = require("path");
const { loc = {} } = require("../../package.json");
const { CyanText, CSSkeywordText } = require("jbassard97nodecolors");

const projectRoot = path.join(__dirname, "..", "..");
const outputPath = path.join(__dirname, "..", "..", "src", "data", "loc.json");

// Only count real source files
const ALLOWED_EXTENSIONS = new Set(loc.allowedExts || []);
const UNALLOWED_DIRECTORIES = new Set(loc.ignoreDirs || []);
const UNALLOWED_FILES = new Set(loc.ignoreFiles || []);
const DEV_LANGS = new Set(loc.devExts || []);
const PROD_LANGS = new Set(loc.prodExts || []);

let languageBreakdown = {};
let devLangBreakdown = {};
let prodLangBreakdown = {};

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).filter((line) => line.trim() !== "").length;
}

function walkDir(dir) {
  let totalLines = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (UNALLOWED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      totalLines += walkDir(fullPath);
    } else if (
      entry.isFile() &&
      !UNALLOWED_FILES.has(entry.name) &&
      ALLOWED_EXTENSIONS.has(path.extname(fullPath))
    ) {
      let countedLines = countLines(fullPath);
      const ext = path.extname(fullPath);

      // Update overall language breakdown
      if (!languageBreakdown[ext]) {
        languageBreakdown[ext] = { numOfFiles: 0, loc: 0 };
      }
      languageBreakdown[ext]["loc"] += countedLines;
      languageBreakdown[ext]["numOfFiles"] += 1;

      // Update dev language breakdown if applicable
      if (DEV_LANGS.has(ext)) {
        if (!devLangBreakdown[ext]) {
          devLangBreakdown[ext] = { numOfFiles: 0, loc: 0 };
        }
        devLangBreakdown[ext]["loc"] += countedLines;
        devLangBreakdown[ext]["numOfFiles"] += 1;
      }

      // Update prod language breakdown if applicable
      if (PROD_LANGS.has(ext)) {
        if (!prodLangBreakdown[ext]) {
          prodLangBreakdown[ext] = { numOfFiles: 0, loc: 0 };
        }
        prodLangBreakdown[ext]["loc"] += countedLines;
        prodLangBreakdown[ext]["numOfFiles"] += 1;
      }

      totalLines += countedLines;
    }
  }

  return totalLines;
}

const totalLOC = walkDir(projectRoot);
console.log(
  `Total lines of code (non-empty, source only): ${CSSkeywordText(totalLOC, "deeppink")}`,
);
console.log("Language Breakdown:", languageBreakdown);
console.log("Dev Language Breakdown:", devLangBreakdown);
console.log("Prod Language Breakdown:", prodLangBreakdown);

const locData = {
  totalLOC,
  langBreakdown: languageBreakdown,
  devLangBreakdown: devLangBreakdown,
  prodLangBreakdown: prodLangBreakdown,
};
fs.writeFileSync(outputPath, JSON.stringify(locData, null, 2), "utf8");

console.log(`${CyanText("LOC data written to:")} ${outputPath}`);
