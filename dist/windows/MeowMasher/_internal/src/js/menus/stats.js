import { computeYarnBonus } from "../bonuses/yarn.js";
import { storage } from "../logic/storage.js";

// Load both JSON data files ONCE
let allSubUpgrades = [];
// let allUpgrades = [];
let dataLoaded = false;

Promise.all([
  fetch("src/data/subUpgrades.json").then((r) => r.json()),
  fetch("src/data/upgrades.json").then((r) => r.json()),
]).then(([subs, ups]) => {
  allSubUpgrades = subs;
  allUpgrades = ups;
  dataLoaded = true;
});

// --- Stats Dialog ---
const statsIcon = document.getElementById("stats-icon");
const statsDialog = document.getElementById("stats-dialog");
const closeStatsDialog = document.getElementById("close-stats-dialog");

statsIcon.addEventListener("click", () => {
  statsDialog.classList.add("active");
});

closeStatsDialog.addEventListener("click", () => {
  statsDialog.classList.remove("active");
});

// Close dialog when clicking outside
statsDialog.addEventListener("click", (e) => {
  if (e.target === statsDialog) {
    statsDialog.classList.remove("active");
  }
});

setInterval(() => {
  if (statsDialog && statsDialog.classList.contains("active")) {
    // --- numeric values first ---
    const base = Number(storage.getClickPower() || 1);
    const tf = storage.getThousandFingersBonus
      ? Number(storage.getThousandFingersBonus() || 0)
      : 0;
    const percent = storage.getPercentOfMpsClickAdder
      ? Number(storage.getPercentOfMpsClickAdder() || 0)
      : 0;
    const mps = Number(storage.getMewnitsPerSecond() || 0);
    const mpsBonus = Math.floor(mps * percent);

    const totalClickPower = base + tf + mpsBonus;

    // --- display basic stats ---
    document.getElementById("stats-lifetime-mewnits-display").textContent = (
      storage.getLifetimeMewnits() || 0
    ).toLocaleString();

    document.getElementById("stats-current-mewnits-display").textContent = (
      storage.getMewnits() || 0
    ).toLocaleString();

    document.getElementById("stats-mps-display").innerHTML = `${(
      mps + computeYarnBonus(allSubUpgrades).yarnBonus
    ).toLocaleString()} <span class="details">(+${computeYarnBonus(
      allSubUpgrades
    ).yarnBonus.toLocaleString()} from Yarn)</span>`;

    document.getElementById("stats-lifetime-clicks-display").textContent = (
      storage.getLifetimeClicks().toLocaleString() || 0
    ).toString();

    document.getElementById(
      "stats-lifetime-clicks-mewnits-display"
    ).textContent = (storage.getLifetimeClickMewnits() || 0).toLocaleString();

    document.getElementById("stats-base-click-power-display").textContent =
      base.toLocaleString();

    // --- build breakdown text ---
    const baseText = `(+${base.toLocaleString()} Base Click Power)`;
    const tfText = tf ? ` (+${tf.toLocaleString()} from Thousand Pats)` : "";
    const mpsText = percent
      ? ` (+${mpsBonus.toLocaleString()} from MPS Click Boost)`
      : "";

    // --- final display (total + breakdown) ---
    document.getElementById(
      "stats-current-clickpower-display"
    ).innerHTML = `${totalClickPower.toLocaleString()} <span class="details">${baseText}${tfText}${mpsText}</span>`;

    // --- golden pawprints clicked ---
    document.getElementById("stats-clicked-golden-display").textContent =
      storage.getNumberofGoldenPawClicks().toLocaleString();

    // --- active bonuses ---
    document.getElementById(
      "stats-yarn-display"
    ).innerHTML = `${computeYarnBonus(
      allSubUpgrades
    ).yarnPercent.toLocaleString()}% <span class="details">(+${computeYarnBonus(
      allSubUpgrades
    ).yarnBonus.toLocaleString()})</span>`;

    document.getElementById("stats-thousand-pats-display").textContent =
      tf.toLocaleString();

    document.getElementById("stats-mps-click-boost-display").textContent =
      percent
        ? `${mpsBonus.toLocaleString()} (${Math.floor(percent * 100)}%)`
        : "0";
  }
}, 1000);
