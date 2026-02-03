import { startGoldenPawprintSpawner } from "./golden/goldenPawprint.js";
import { computeThousandFingers } from "./bonuses/thousandFingers.js";
import { computeYarnBonus } from "./bonuses/yarn.js";
import { describeSubBonus } from "./logic/describeSubBonus.js";
import { animateCounter } from "./effects/animateCounter.js";
import {
  SUB_UPGRADE_STYLES,
  UPGRADE_GRADIENT,
} from "./effects/upgradeStyles.js";
import { storage, initStorage } from "./logic/storage.js";
import { initSettings } from "./menus/settings.js";
import { setupClickHandler } from "./logic/handleClick.js";
import { toggleGoldenPawMode } from "./effects/goldenPawMode.js";
import { chooseWeighted } from "./logic/chooseWeighted.js";
import { setLivingRoom } from "./effects/setLivingRoom.js";
import { AudioList } from "./audio/audio.js";
import { updateBiscuitEfficiency } from "./helpers/updateBiscuitEfficiency.js";
import { $ } from "./helpers/$.js";

const mode = "dev00";
const devBonus = 50000;

document.addEventListener("DOMContentLoaded", async () => {
  // const $ = (sel) => document.querySelector(sel);

  const counterDisplay = $("#counter");
  const rateDisplay = $("#rate");
  const clickRateDisplay = $("#click-rate");
  const clickerButton = $(".clicker-area");
  const clickerImg = clickerButton.querySelector("img");
  const upgradesContainer = $(".upgrades");
  const subUpgradesContainer = $(".sub-upgrades");
  const availUpgradesDisplay = $("#available-upgrades-display");
  const availSubUpgradesDisplay = $("#available-sub-upgrades-display");
  const autoBuyUpgradeButton = $("#auto-buy-upgrade");
  const autoBuySubUpgradeButton = $("#auto-buy-sub-upgrade");
  const buyManyDisplay = $("#buy-many-display");
  const buyManyUpgradesButton = $("#buy-many-upgrades");
  const buyManyUpgradesDisplay = $("#buy-many-upgrades-display");
  const pauseResumeButton = $("#pause-resume");

  await initStorage();
  initSettings();

  // Load data
  const [upgrades, subUpgrades] = await Promise.all([
    fetch("src/data/upgrades.json").then((r) => r.json()),
    fetch("src/data/subUpgrades.json").then((r) => r.json()),
  ]);

  // State
  let count = storage.getMewnits();
  let baseAutoRate = 0;
  let baseClickPower = storage.getClickPower();
  let autoRate = 0;
  let clickPower = 0;
  let autoInterval = null;
  let animationFrame = null;

  let goldenPawActive = false;
  let boostMpsMultiplier = 1; // Temporary multiplier, is reset back to 1 at the end of boosts and on reload
  let activeTimedBoost = null;
  let activeTimedBoostTimeout = null;

  let isPaused = false;
  const MS_IN_A_SEC = 1000;
  let pauseInterval = null;

  let revealedUpgrades = new Set();

  // Restore upgrade data
  upgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id);
    u.multiplier = storage.getUpgradeMultiplier(u.id);
    u.extraBonus = 0;
  });

  // --- Boosts Custom Event Listener ---
  window.addEventListener("boostUsed", (e) => {
    const boost = e.detail;
    if (!boost) {
      console.error("Boost not passed to main.js in custom event!");
      return;
    }

    if (boost.type === "mps") {
      boostFuncs.mps(boost.time, boost.boost);
    } else if (boost.type === "mew") {
      boostFuncs.mew(boost.time);
    } else if (boost.type === "biscuit-efficiency") {
      boostFuncs.biscuitEfficiency(boost.time, boost.boost);
    }

    console.log("Boost Used: ", boost);
  });

  startGoldenPawprintSpawner(clickerButton, () => {
    // If they're already active, do nothing
    if (goldenPawActive) return;

    // Weight configuration
    const reward = chooseWeighted({
      mps: 1, // equal chance by default
      mew: 2, // equal chance
    });

    if (reward === "mps") {
      // --- Apply 30s MPS Boost ---
      boostFuncs.mps(30);
    } else if (reward === "mew") {
      // --- Immediate Mewnits payout ---
      boostFuncs.mew(60);
    }
  });

  const boostFuncs = {
    mps: (seconds = 30, boost = 2) => {
      cancelActiveTimedBoost();

      activeTimedBoost = "mps";
      boostMpsMultiplier = boost;
      updateAutoRate();
      startAutoIncrement();

      toggleGoldenPawMode(true, "mps", seconds);

      activeTimedBoostTimeout = setTimeout(() => {
        cancelActiveTimedBoost();
      }, seconds * 1000);
    },

    mew: (secondsOfPayout = 60) => {
      const bonus = autoRate * secondsOfPayout;
      toggleGoldenPawMode(true, "mew", 1, bonus);
      const prev = count;
      count += bonus;
      storage.setMewnits(count);
      animateCounter(counterDisplay, prev, count, 400);
    },

    biscuitEfficiency: (seconds = 30, boost = 2) => {
      cancelActiveTimedBoost();

      activeTimedBoost = "biscuit-efficiency";

      storage.setBiscuitEfficiency(storage.getBaseBiscuitEfficiency() * boost);
      updateBiscuitEfficiency();

      toggleGoldenPawMode(true, "biscuit-efficiency", seconds, boost);

      activeTimedBoostTimeout = setTimeout(() => {
        cancelActiveTimedBoost();
      }, seconds * 1000);
    },
  };

  function cancelActiveTimedBoost() {
    if (!activeTimedBoost) return;

    // Clear timer
    if (activeTimedBoostTimeout) {
      clearTimeout(activeTimedBoostTimeout);
      activeTimedBoostTimeout = null;
    }

    // Revert effects based on type
    if (activeTimedBoost === "mps") {
      boostMpsMultiplier = 1;
      updateAutoRate();
      startAutoIncrement();
      toggleGoldenPawMode(false, "mps");
    }

    if (activeTimedBoost === "biscuit-efficiency") {
      storage.setBiscuitEfficiency(storage.getBaseBiscuitEfficiency());
      updateBiscuitEfficiency();
      toggleGoldenPawMode(false, "biscuit-efficiency");
    }

    activeTimedBoost = null;
  }

  // -----------------------------
  // Full Click Power Recalc
  // -----------------------------
  function updateClickPower() {
    const tf = computeThousandFingers(upgrades, subUpgrades).total;
    const percent = storage.getPercentOfMpsClickAdder(); // e.g. 0.01

    // Use baseAutoRate, not the multiplied autoRate
    const mpsBonus = Math.floor(baseAutoRate * percent);

    clickPower = baseClickPower + tf + mpsBonus;

    if (mode === "dev") clickPower += devBonus;

    clickRateDisplay.textContent = clickPower.toLocaleString();
  }

  // -----------------------------
  // Auto Mewnits / second
  // -----------------------------
  function updateAutoRate() {
    // Compute base rate only from upgrades
    baseAutoRate = upgrades.reduce(
      (sum, u) =>
        sum + u.owned * (u.rate * (u.multiplier || 1) + (u.extraBonus || 0)),
      0,
    );

    // Apply golden pawprint multiplier only to autoRate
    autoRate =
      activeTimedBoost === "mps"
        ? Math.floor(baseAutoRate * boostMpsMultiplier)
        : baseAutoRate;

    storage.setMewnitsPerSecond(autoRate);

    autoRate += computeYarnBonus(subUpgrades).yarnBonus; // Add yarn (but don't actually save it)

    rateDisplay.textContent = autoRate.toLocaleString();
  }

  function startAutoIncrement() {
    if (autoInterval) clearInterval(autoInterval);
    if (autoRate <= 0) return;

    const tick = () => {
      const prev = count;
      count += autoRate;

      animateCounter(counterDisplay, prev, count, 1000, animationFrame);
      storage.setMewnits(count);
      storage.addLifetimeMewnits(autoRate);

      updateAutoRate();
      updateClickPower();
      updateAffordability();
    };

    tick();
    autoInterval = setInterval(tick, 1000);
  }

  function shouldRevealUpgrade(u, cost) {
    if (u.id === 0) return true;

    if (revealedUpgrades.has(u.id)) return true;

    const owned = storage.getUpgradeOwned(u.id) >= 1;
    const canAfford75 = count >= cost * 0.75;

    if (owned || canAfford75) {
      revealedUpgrades.add(u.id);
      return true;
    }

    return false;
  }

  // -----------------------------
  // Rendering
  // -----------------------------
  function renderUpgrades() {
    upgradesContainer.innerHTML = "";

    upgrades.forEach((u, i) => {
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      const afford = count >= cost;
      const effRate = u.rate * (u.multiplier || 1) + (u.extraBonus || 0);

      const div = document.createElement("div");
      div.className = "upgrade";
      div.style.opacity = afford ? "1" : "0.4";
      div.style.pointerEvents = afford ? "auto" : "none";
      div.style.borderColor = UPGRADE_GRADIENT[i];
      div.style.boxShadow = `inset 0 -10px 8px -10px ${UPGRADE_GRADIENT[i]}`;

      div.innerHTML = `
        <img src="${
          u.image || "src/assets/images/neonstripes.jpg"
        }" style="height:100%" />
        <div class="upgrade-info">
          <strong>${u.name}</strong>
          <div>
            <p><b>${cost.toLocaleString()}</b> <span style="font-size:0.6rem">Mewnits</span></p>
            <p><b>+${effRate.toLocaleString()}</b> <span style="font-size:0.6rem">Mew/S</span></p>
          </div>
        </div>
        <p class="owned-number">${u.owned}</p>
      `;

      div.onclick = () => buyUpgrade(u, cost);
      upgradesContainer.appendChild(div);
    });
  }

  function renderSubUpgrades() {
    subUpgradesContainer.innerHTML = "";

    [...subUpgrades]
      .filter((u) => !storage.getSubUpgradeOwned(u.id))
      .sort((a, b) => a.cost - b.cost)
      .forEach((u) => {
        if (!isSubUnlocked(u)) return;

        const div = document.createElement("div");
        div.className = "sub-upgrade";
        div.dataset.id = u.id;

        // Apply dynamic border/glow based on type
        const style = SUB_UPGRADE_STYLES[u.type];
        if (style) {
          Object.assign(div.style, style);
        }

        div.innerHTML = `
          <strong style="background:${style.strongBackground}">${
            u.name
          }</strong>
          <div>
          <p><b>${u.cost.toLocaleString()}</b> <span style="font-size:0.5rem">Mewnits</span></p>
          <p>${describeSubBonus(u, upgrades)}</p>
          </div>
        `;

        div.onclick = () => buySubUpgrade(u);
        subUpgradesContainer.appendChild(div);
      });

    updateAffordability();
  }

  function isSubUnlocked(u) {
    if (u.targetUpgradeId !== undefined) {
      const t = upgrades.find((x) => x.id === u.targetUpgradeId);
      if (!t || t.owned < u.unlockRequirement) return false;
    }
    if (u.unlockRateRequirement && autoRate < u.unlockRateRequirement)
      return false;
    if (
      u.unlockClickedMewnitsRequirement &&
      storage.getLifetimeClickMewnits() < u.unlockClickedMewnitsRequirement
    )
      return false;
    if (
      u.adoptedCatsRequirement &&
      storage.getAdoptedCatsNumber() < u.adoptedCatsRequirement
    )
      return false;

    return true;
  }

  // -----------------------------
  // Purchases
  // -----------------------------
  function buyUpgrade(u, cost) {
    if (isPaused) return;
    if (count < cost) return;
    count -= cost;

    u.owned++;
    storage.setUpgradeOwned(u.id, u.owned);

    AudioList.Click(); // ? Audio Effect

    updateAutoRate();
    updateClickPower();
    saveMewnits();
    renderUpgrades();
    renderSubUpgrades();
    startAutoIncrement();
  }

  function buySubUpgrade(u) {
    if (isPaused) return;
    if (count < u.cost) return;

    count -= u.cost;
    storage.setSubUpgradeOwned(u.id);

    // Apply upgrade effect
    if (u.type === "clickPowerAdder") {
      baseClickPower += u.bonus;
      storage.setClickPower(baseClickPower);
    } else if (u.type === "clickPowerMultiplier") {
      baseClickPower *= u.bonus;
      storage.setClickPower(baseClickPower);

      if (u.targetUpgradeId !== undefined && u.alsoUpgradeMultiplier) {
        const t = upgrades.find((x) => x.id === u.targetUpgradeId);
        t.multiplier *= u.bonus;
        storage.setUpgradeMultiplier(t.id, t.multiplier);
      }
    } else if (u.type === "upgradeMultiplier") {
      const t = upgrades.find((x) => x.id === u.targetUpgradeId);
      t.multiplier *= u.bonus;
      storage.setUpgradeMultiplier(t.id, t.multiplier);
    } else if (u.type === "percentOfMpsClickAdder") {
      const current = storage.getPercentOfMpsClickAdder();
      storage.setPercentOfMpsClickAdder(current + u.bonus / 100);
    } else if (u.type === "catAdopt") {
      storage.addAdoptedCatsNumber();
      updateOwnedCatsDisplay();
    } else if (u.type === "livingRoom") {
      storage.addLivingRoomIndex();
      storage.addNumberOfLivingRooms();
      setLivingRoom();
    }

    AudioList.Click(); // ? Audio Effect

    updateAutoRate();
    updateClickPower();
    saveMewnits();
    renderUpgrades();
    renderSubUpgrades();
    startAutoIncrement();

    const el = document.querySelector(`.sub-upgrade[data-id="${u.id}"]`);
    el?.remove();
  }

  setupClickHandler({
    clickerButton,
    clickerImg,
    getClickPower: () => clickPower,
    incrementCount: (amount) => {
      count += amount;
    },
    saveMewnits,
    updateAffordability,
    storage,
  });

  // -----------------------------
  // Helpers
  // -----------------------------
  function updateAffordability() {
    let availUpgradesAmount = 0;
    let cheapestUpgrade = null;
    upgradesContainer.querySelectorAll(".upgrade").forEach((div, i) => {
      const u = upgrades[i];
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      const afford = count >= cost;
      if (!shouldRevealUpgrade(u, cost)) {
        div.classList.add("hidden");
      } else {
        div.classList.remove("hidden");
      }
      div.style.opacity = afford ? "1" : "0.4";
      div.style.pointerEvents = afford ? "auto" : "none";
      if (afford) {
        availUpgradesAmount++;
        if (
          !cheapestUpgrade ||
          (cheapestUpgrade && cost < cheapestUpgrade.cost)
        ) {
          cheapestUpgrade = { u: u, cost: cost };
        }
      }
    });
    availUpgradesDisplay.textContent =
      availUpgradesAmount <= 99 ? availUpgradesAmount : 99;
    availUpgradesAmount > 0
      ? availUpgradesDisplay.classList.add("positive")
      : availUpgradesDisplay.classList.remove("positive");
    if (availUpgradesAmount > 0 && cheapestUpgrade) {
      autoBuyUpgradeButton.disabled = false;
      autoBuyUpgradeButton.title = cheapestUpgrade.u.name;
      autoBuyUpgradeButton.onclick = () => {
        if (isPaused) return;
        buyUpgrade(cheapestUpgrade.u, cheapestUpgrade.cost);
      };
    } else {
      autoBuyUpgradeButton.disabled = true;
      autoBuyUpgradeButton.title = "Not Yet...";
      autoBuyUpgradeButton.onclick = null;
    }

    // -----------------------------
    // Buy MANY Upgrades Logic
    // -----------------------------
    let affordableUpgrades = [];

    upgrades.forEach((u) => {
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      if (count >= cost) {
        affordableUpgrades.push({ u, cost });
      }
    });

    // Sort cheapest first (important)
    affordableUpgrades.sort((a, b) => a.cost - b.cost);

    let upgradeSpend = 0;
    let purchasableUpgrades = [];

    for (const item of affordableUpgrades) {
      if (count >= upgradeSpend + item.cost) {
        upgradeSpend += item.cost;
        purchasableUpgrades.push(item);
      } else {
        break;
      }
    }

    if (purchasableUpgrades.length > 0) {
      buyManyUpgradesButton.disabled = false;
      buyManyUpgradesButton.title = `Buy ${purchasableUpgrades.length}`;
      buyManyUpgradesDisplay.textContent =
        purchasableUpgrades.length <= 99 ? purchasableUpgrades.length : 99;

      buyManyUpgradesButton.onclick = () => {
        if (isPaused) return;
        purchasableUpgrades.forEach(({ u, cost }) => {
          buyUpgrade(u, cost);
        });
      };
    } else {
      buyManyUpgradesButton.disabled = true;
      buyManyUpgradesButton.title = "Not Yet...";
      buyManyUpgradesDisplay.textContent = 0;
      buyManyUpgradesButton.onclick = null;
    }

    let availSubUpgradesAmount = 0;
    let cheapestSubUpgrades = [];
    subUpgradesContainer.querySelectorAll(".sub-upgrade").forEach((div) => {
      const u = subUpgrades.find((x) => x.id == div.dataset.id);
      const afford = count >= u.cost && isSubUnlocked(u);
      div.style.opacity = afford ? "1" : "0.4";
      div.style.pointerEvents = afford ? "auto" : "none";
      if (afford) {
        availSubUpgradesAmount++;
        cheapestSubUpgrades.push(u);
      }
    });
    availSubUpgradesDisplay.textContent =
      availSubUpgradesAmount <= 99 ? availSubUpgradesAmount : 99;
    availSubUpgradesAmount > 0
      ? availSubUpgradesDisplay.classList.add("positive")
      : availSubUpgradesDisplay.classList.remove("positive");
    if (
      cheapestSubUpgrades.length >= 2 &&
      count >= cheapestSubUpgrades[0].cost + cheapestSubUpgrades[1].cost
    ) {
      let potentialSpend = 0;
      let purchasableSubUpgrades = [];

      for (const u of cheapestSubUpgrades) {
        if (count >= potentialSpend + u.cost) {
          potentialSpend += u.cost;
          purchasableSubUpgrades.push(u);
        } else {
          break;
        }
      }
      if (purchasableSubUpgrades.length > 0) {
        autoBuySubUpgradeButton.disabled = false;
        autoBuySubUpgradeButton.title = `Buy ${purchasableSubUpgrades.length}`;
        buyManyDisplay.textContent =
          purchasableSubUpgrades.length <= 99
            ? purchasableSubUpgrades.length
            : 99;
        autoBuySubUpgradeButton.onclick = () => {
          if (isPaused) return;
          purchasableSubUpgrades.forEach(buySubUpgrade);
        };
      }
    } else {
      autoBuySubUpgradeButton.disabled = true;
      autoBuySubUpgradeButton.title = "Not Yet...";
      buyManyDisplay.textContent = 0;
      autoBuySubUpgradeButton.onclick = null;
    }
  }

  function updateOwnedCatsDisplay() {
    document.getElementById("owned-cats-number").textContent =
      storage.getAdoptedCatsNumber();
  }

  function saveMewnits() {
    storage.setMewnits(count);
    counterDisplay.textContent = count.toLocaleString();
  }

  function syncBiscuitEfficiencies() {
    storage.setBiscuitEfficiency(storage.getBaseBiscuitEfficiency());
  }

  function Pause() {
    if (isPaused) return;

    isPaused = true;
    pauseResumeButton.textContent = "▶️";

    // Stop auto tick
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }

    // Stop timed boosts safely
    if (activeTimedBoostTimeout) {
      clearTimeout(activeTimedBoostTimeout);
      activeTimedBoostTimeout = null;
    }

    // Add to numOfPauses
    storage.setNumberOfPauses(storage.getNumberOfPauses() + 1);

    // ⏱️ Start pause time tracker
    if (!pauseInterval) {
      pauseInterval = setInterval(() => {
        const current = storage.getTimeSpentPaused();
        storage.setTimeSpentPaused(current + MS_IN_A_SEC);
      }, MS_IN_A_SEC);
    }

    console.log("⏸️ Game Paused");
    window.dispatchEvent(new CustomEvent("pause"));
  }

  function Resume() {
    if (!isPaused) return;

    isPaused = false;
    pauseResumeButton.textContent = "⏸️";

    updateAutoRate();
    startAutoIncrement();

    // ⏹️ Stop pause time tracker
    if (pauseInterval) {
      clearInterval(pauseInterval);
      pauseInterval = null;
    }

    console.log("▶️ Game Resumed");
    window.dispatchEvent(new CustomEvent("resume"));
  }

  document.addEventListener("keypress", (e) => {
    if (e.key.toLowerCase() === "p") {
      !isPaused ? Pause() : Resume();
    }
  });

  pauseResumeButton.addEventListener("click", () => {
    !isPaused ? Pause() : Resume();
  });

  // ? ---------------------------
  // ? ONLY ON FIRST GAME LOAD
  // ? ---------------------------
  if (!storage.getGameStartTimeMs()) {
    storage.setGameStartTime();
    console.log("Game Started @: ", storage.getGameStartTimeMs());
  }

  // -----------------------------
  // INIT
  // -----------------------------
  syncBiscuitEfficiencies();
  setLivingRoom();
  updateAutoRate();
  updateClickPower();
  saveMewnits();
  renderUpgrades();
  startAutoIncrement();
  renderSubUpgrades();
  updateOwnedCatsDisplay();
});
