const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const { GreenText } = require("jbassard97nodecolors");

// Paths relative to the project root
const inputFile = path.join(__dirname, "..", "..", "dev/yml/subUpgrades.yml");
const outputFile = path.join(
  __dirname,
  "..",
  "..",
  "src/data/subUpgrades.json",
);

// Make sure the output directory exists
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

// Read YAML and parse
const yamlContent = fs.readFileSync(inputFile, "utf8");
const parsed = YAML.parse(yamlContent, { merge: true });

// If parsed is an object with an 'items' key, extract it; otherwise use as-is
const json = parsed.items || parsed;

// Write JSON to file with 2-space indentation
fs.writeFileSync(outputFile, JSON.stringify(json, null, 2), "utf8");

console.log(
  `✅ ${GreenText("Converted .yml subUpgrades to .json")} ${inputFile} → ${outputFile}`,
);
