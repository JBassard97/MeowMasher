// NODE.JS

const fs = require("fs");
const {
  GreenText,
  YellowText,
  OrangeText,
  RedText,
} = require("jbassard97nodecolors");

fs.readFile("../src/data/subUpgrades.json", "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const jsonData = JSON.parse(data);
  console.clear();
  logSubUpgradeCostsMap();

  function logSubUpgradeCostsMap() {
    sortedJsonData = jsonData.sort((a, b) => a.cost - b.cost);
    console.table(sortedJsonData, ["id", "cost", "name"]);
  }
});
