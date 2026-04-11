import { computeYarnBonus } from "../bonuses/yarn.js";
import { storage } from "../logic/storage.js";
import { computeThousandFingers } from "../bonuses/thousandFingers.js";
import { isDesktop } from "../logic/storage.js";
import { isPaused } from "../helpers/isPaused.js";
import { formatNumber } from "../helpers/formatNumber.js";
import { D } from "../logic/decimalWrapper.js";
import { giveSpecificAchievement } from "../logic/achievements.js";

let allSubUpgrades = [];
let allUpgrades = [];
let versionNumber = "";
let achievements = [];

Promise.all([
  fetch("src/data/subUpgrades.json").then((r) => r.json()),
  fetch("src/data/upgrades.json").then((r) => r.json()),
  fetch("package.json").then((r) => r.json()),
  fetch("src/data/achievements.json").then((r) => r.json()),
]).then(([subs, ups, pkg, achs]) => {
  allSubUpgrades = subs;
  allUpgrades = ups;
  versionNumber = pkg.version;
  achievements = achs;

  // CRITICAL: Initialize upgrades with Decimal properties just like main.js does
  allUpgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id); // Returns Decimal
    u.multiplier = storage.getUpgradeMultiplier(u.id); // Returns Decimal
    u.extraBonus = D(0);
  });
});

// --- Stats Dialog ---
const statsIcon = document.getElementById("stats-icon");
const statsDialog = document.getElementById("stats-dialog");
const closeStatsDialog = document.getElementById("close-stats-dialog");

statsIcon.addEventListener("click", () => {
  statsDialog.classList.add("active");
  giveSpecificAchievement(6);
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
    // --- numeric values using Decimals ---
    const base = storage.getClickPower(); // Already Decimal
    const tf = storage.getThousandFingersBonus(); // Already Decimal
    const percent = storage.getPercentOfMpsClickAdder(); // Regular number (small percentage)
    const mps = storage.getMewnitsPerSecond(); // Already Decimal
    const mpsBonus = mps.times(percent).floor();

    const totalClickPower = base.plus(tf).plus(mpsBonus);

    // --- display basic stats ---
    document.getElementById("stats-lifetime-mewnits-display").textContent =
      formatNumber(storage.getLifetimeMewnits());

    document.getElementById("stats-current-mewnits-display").textContent =
      formatNumber(storage.getMewnits());

    document.getElementById("stats-base-mps-display").textContent =
      formatNumber(mps);

    const yarnData = computeYarnBonus(allSubUpgrades, achievements);
    const yarnBonus = D(yarnData.yarnBonus || 0); // Ensure it's Decimal

    document.getElementById("stats-current-mps-display").innerHTML =
      `${formatNumber(
        mps.plus(yarnBonus),
      )} <span class="details">(+${formatNumber(yarnBonus)} from Yarn)</span>`;

    document.getElementById("stats-lifetime-clicks-display").textContent =
      formatNumber(storage.getLifetimeClicks());

    document.getElementById(
      "stats-lifetime-clicks-mewnits-display",
    ).textContent = formatNumber(storage.getLifetimeClickMewnits());

    document.getElementById("stats-base-click-power-display").textContent =
      formatNumber(base);

    // --- build breakdown text ---
    const baseText = `(+${formatNumber(base)} Base Click Power)`;
    const tfText = tf.gt(0) ? ` (+${formatNumber(tf)} from Thousand Pats)` : "";
    const mpsText =
      percent > 0 ? ` (+${formatNumber(mpsBonus)} from MPS Click Boost)` : "";

    document.getElementById("stats-current-clickpower-display").innerHTML =
      `${formatNumber(totalClickPower)} <span class="details">${baseText}${tfText}${mpsText}</span>`;

    // --- golden pawprints ---
    document.getElementById("stats-clicked-golden-display").textContent =
      formatNumber(storage.getNumberofGoldenPawClicks());

    function msToTime(ms) {
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / 60000);
      return {
        minutes,
        seconds,
        formatted: `${minutes ? minutes + "m" : ""} ${seconds ? seconds + "s" : ""}`,
      };
    }

    document.getElementById("stats-golden-lifetime-display").textContent =
      msToTime(storage.getGoldenPawSpawnLifetime()).formatted;

    document.getElementById("stats-golden-spawn-int-display").textContent =
      "~" + msToTime(storage.getGoldenPawSpawnInterval()).formatted;

    // --- active bonuses ---
    const yarn = computeYarnBonus(allSubUpgrades, achievements);
    const thousand = computeThousandFingers(allUpgrades, allSubUpgrades);

    document.getElementById("stats-yarn-display").innerHTML =
      `${yarn.yarnPercent}% <span class="details">(+${formatNumber(
        yarn.yarnBonus,
      )})</span>`;

    document.getElementById("stats-thousand-pats-display").innerHTML =
      `${formatNumber(tf)} <span class="details">(+${formatNumber(
        thousand.bonus,
      )} Click Power and +${formatNumber(
        thousand.bonus,
      )} Pats output for each non-Pats upgrade owned)</span>`;

    document.getElementById("stats-mps-click-boost-display").innerHTML =
      percent > 0
        ? `${formatNumber(mpsBonus)} <span class="details">(${Math.floor(percent * 100)}%)</span>`
        : "0";

    // --- general ---
    document.getElementById("stats-game-started-display").textContent =
      storage.getGameStartTimeFormatted();

    document.getElementById("stats-total-playtime-display").textContent =
      storage.getTotalPlayTimeFormatted();

    document.getElementById("stats-current-game-mode-display").textContent =
      isDesktop() ? "Desktop" : "Web";

    // --- pausing ---
    document.getElementById("stats-isPaused-display").textContent = isPaused;
    document.getElementById("stats-time-spent-paused-display").textContent =
      storage.getTotalPauseTimeFormatted();
    document.getElementById("stats-num-of-pauses-display").textContent =
      formatNumber(storage.getNumberOfPauses());

    // --- game version ---
    document.getElementById("stats-game-version-display").textContent =
      versionNumber;

    // --- biscuits ---
    document.getElementById("stats-lifetime-biscuits-display").textContent =
      formatNumber(storage.getLifetimeBiscuits());

    document.getElementById("stats-current-biscuits-display").textContent =
      formatNumber(storage.getBiscuits());

    document.getElementById("stats-base-efficiency-display").textContent =
      formatNumber(storage.getBaseBiscuitEfficiency());

    document.getElementById("stats-current-efficiency-display").textContent =
      formatNumber(storage.getBiscuitEfficiency());
  }
}, 1000);
