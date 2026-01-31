// dev/loc.js
const fs = require("fs");
const path = require("path");
const { loc = {} } = require("../package.json");
const { CyanText, CSSkeywordText } = require("jbassard97nodecolors");

const projectRoot = path.join(__dirname, "..");
const outputPath = path.join(__dirname, "..", "src", "data", "loc.json");

// Only count real source files
const ALLOWED_EXTENSIONS = new Set(loc.allowedExts || []);
const UNALLOWED_DIRECTORIES = new Set(loc.ignoreDirs || []);
const UNALLOWED_FILES = new Set(loc.ignoreFiles || []);

let languageBreakdown = {};

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
      !UNALLOWED_FILES.has(entry.NAME) &&
      ALLOWED_EXTENSIONS.has(path.extname(fullPath))
    ) {
      let countedLines = countLines(fullPath);
      if (!languageBreakdown[path.extname(fullPath)]) {
        languageBreakdown[path.extname(fullPath)] = { numOfFiles: 0, loc: 0 };
      }
      languageBreakdown[path.extname(fullPath)]["loc"] += countedLines;
      languageBreakdown[path.extname(fullPath)]["numOfFiles"] += 1;
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

const locData = { totalLOC, langBreakdown: languageBreakdown };
fs.writeFileSync(outputPath, JSON.stringify(locData, null, 2), "utf8");

console.log(`${CyanText("LOC data written to:")} ${outputPath}`);
