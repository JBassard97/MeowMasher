const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const { GreenText } = require("jbassard97nodecolors");

// Paths relative to the project root
const inputFile = path.join(__dirname, "..", "..", "src/data/subUpgrades.json");
const outputFile = path.join(__dirname, "..", "..", "dev/yml/subUpgrades.yml");

// Make sure the output directory exists
fs.mkdirSync(path.dirname(outputFile), { recursive: true });

const json = JSON.parse(fs.readFileSync(inputFile, "utf8"));
const yaml = YAML.stringify(json);

fs.writeFileSync(outputFile, yaml, "utf8");
console.log(`✅ ${GreenText("Converted")} ${inputFile} → ${outputFile}`);
