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
import { updateBiscuitsDisplay } from "./helpers/updateBiscuitsDisplay.js";
import { $ } from "./helpers/$.js";
import { D } from "./logic/decimalWrapper.js";
import { formatNumber } from "./helpers/formatNumber.js";

const mode = "dev00";
const devBonus = D(50000);

document.addEventListener("DOMContentLoaded", async () => {
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

  // State - ALL using Decimal
  let count = storage.getMewnits();
  let baseAutoRate = D(0);
  let baseClickPower = storage.getClickPower();
  let autoRate = D(0);
  let clickPower = D(0);
  let autoInterval = null;
  let autoAnimFrame = null;

  let goldenPawActive = false;
  let boostMpsMultiplier = D(1);
  let activeTimedBoost = null;
  let activeTimedBoostTimeout = null;

  let isPaused = false;
  const MS_IN_A_SEC = 1000;
  let pauseInterval = null;

  let revealedUpgrades = new Set();

  // ADDED: Flag to prevent rate recalculation unless upgrades changed
  let ratesNeedUpdate = false;

  // Restore upgrade data - ALL using Decimal
  upgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id);
    u.multiplier = storage.getUpgradeMultiplier(u.id);
    u.extraBonus = D(0);
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
    if (goldenPawActive) return;

    const reward = chooseWeighted({
      mps: 1,
      mew: 2,
    });

    if (reward === "mps") {
      boostFuncs.mps(30);
    } else if (reward === "mew") {
      boostFuncs.mew(60);
    }
  });

  const boostFuncs = {
    mps: (seconds = 30, boost = 2) => {
      cancelActiveTimedBoost();

      activeTimedBoost = "mps";
      boostMpsMultiplier = D(boost);
      updateAutoRate();
      startAutoIncrement();

      toggleGoldenPawMode(true, "mps", seconds);

      activeTimedBoostTimeout = setTimeout(() => {
        cancelActiveTimedBoost();
      }, seconds * 1000);
    },

    mew: (secondsOfPayout = 60) => {
      const bonus = autoRate.times(secondsOfPayout);
      const bonusDisplay = bonus.gt(Number.MAX_SAFE_INTEGER)
        ? bonus.toExponential(2)
        : bonus.toNumber();
      toggleGoldenPawMode(true, "mew", 1, bonusDisplay);
      const bonusD = autoRate.times(secondsOfPayout);

      count = count.plus(bonusD);

      storage.setMewnits(count);

      if (autoAnimFrame) {
        cancelAnimationFrame(autoAnimFrame);
        autoAnimFrame = null;
      }
      animateCounter(counterDisplay, count);
    },

    biscuitEfficiency: (seconds = 30, boost = 2) => {
      cancelActiveTimedBoost();

      activeTimedBoost = "biscuit-efficiency";

      const baseBiscuitEff = storage.getBaseBiscuitEfficiency();
      storage.setBiscuitEfficiency(baseBiscuitEff.times(boost));
      updateBiscuitEfficiency();

      toggleGoldenPawMode(true, "biscuit-efficiency", seconds, boost);

      activeTimedBoostTimeout = setTimeout(() => {
        cancelActiveTimedBoost();
      }, seconds * 1000);
    },
  };

  function cancelActiveTimedBoost() {
    if (!activeTimedBoost) return;

    if (activeTimedBoostTimeout) {
      clearTimeout(activeTimedBoostTimeout);
      activeTimedBoostTimeout = null;
    }

    if (activeTimedBoost === "mps") {
      boostMpsMultiplier = D(1);
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

  function updateClickPower() {
    const tf = D(computeThousandFingers(upgrades, subUpgrades).total);
    const percent = storage.getPercentOfMpsClickAdder();

    const mpsBonus = baseAutoRate.times(percent).floor();

    clickPower = baseClickPower.plus(tf).plus(mpsBonus);

    if (mode === "dev") clickPower = clickPower.plus(devBonus);

    clickRateDisplay.textContent = formatNumber(clickPower);
  }

  function updateAutoRate() {
    // First, get the Pats bonus from Thousand Fingers
    const tfResult = computeThousandFingers(upgrades, subUpgrades);

    // Apply it to the Pats upgrade
    const patsUpgrade = upgrades.find((u) => u.name === "Pats");
    if (patsUpgrade) {
      patsUpgrade.extraBonus = tfResult.patsBonus;
    }

    // Now compute base rate with the updated extraBonus
    baseAutoRate = upgrades.reduce((sum, u) => {
      const rate = D(u.rate);
      const multiplier = u.multiplier;
      const extraBonus = u.extraBonus;
      const owned = u.owned;

      return sum.plus(owned.times(rate.times(multiplier).plus(extraBonus)));
    }, D(0));

    autoRate =
      activeTimedBoost === "mps"
        ? baseAutoRate.times(boostMpsMultiplier).floor()
        : baseAutoRate;

    storage.setMewnitsPerSecond(autoRate);

    const yarnBonus = D(computeYarnBonus(subUpgrades).yarnBonus || 0);
    autoRate = autoRate.plus(yarnBonus);

    rateDisplay.textContent = formatNumber(autoRate);
  }

  function startAutoIncrement() {
    if (autoInterval) clearInterval(autoInterval);
    if (autoRate.lte(0)) return;

    function animateAutoTick(from) {
      if (autoAnimFrame) cancelAnimationFrame(autoAnimFrame);

      const to = from.plus(autoRate);
      const startTime = performance.now();
      const duration = 1000;

      function frame(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const current = from.plus(to.minus(from).times(p)).floor();
        counterDisplay.textContent = formatNumber(current);

        if (p < 1) {
          autoAnimFrame = requestAnimationFrame(frame);
        } else {
          autoAnimFrame = null;
        }
      }

      autoAnimFrame = requestAnimationFrame(frame);
    }

    const tick = () => {
      const prev = count;

      count = count.plus(autoRate);

      storage.setMewnits(count);
      storage.addLifetimeMewnits(autoRate);

      animateAutoTick(prev, count);

      // FIXED: Only recalculate rates if upgrades were bought
      if (ratesNeedUpdate) {
        updateAutoRate();
        updateClickPower();
        ratesNeedUpdate = false;
      }

      updateAffordability();
    };

    tick();
    autoInterval = setInterval(tick, 1000);
  }

  function shouldRevealUpgrade(u, cost) {
    if (u.id === 0) return true;

    if (revealedUpgrades.has(u.id)) return true;

    const owned = u.owned.gte(1);
    const canAfford75 = count.gte(cost.times(0.75));

    if (owned || canAfford75) {
      revealedUpgrades.add(u.id);
      return true;
    }

    return false;
  }

  function renderUpgrades() {
    upgradesContainer.innerHTML = "";

    upgrades.forEach((u, i) => {
      const cost = D(u.baseCost).times(D(1.15).pow(u.owned)).floor();
      const afford = count.gte(cost);
      const effRate = D(u.rate).times(u.multiplier).plus(u.extraBonus);

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
            <p><b class="upgrade-cost">-${formatNumber(cost)}</b> <span style="font-size:0.6rem">Mewnits</span></p>
            <p><b class="upgrade-boost">+${formatNumber(effRate)}</b> <span style="font-size:0.6rem">Mew/S</span></p>
          </div>
        </div>
        <p class="owned-number">${u.owned}</p>
      `;

      div.onclick = () => buyUpgrade(u);
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

        const style = SUB_UPGRADE_STYLES[u.type];
        if (style) {
          Object.assign(div.style, style);
        }

        div.innerHTML = `
          <strong style="background:${style.strongBackground}">${
            u.name
          }</strong>
          <div>
          <p><b>${formatNumber(u.cost)}</b> <span style="font-size:0.5rem">Mewnits</span></p>
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
      if (!t || t.owned.lt(u.unlockRequirement)) return false;
    }
    if (u.unlockRateRequirement && autoRate.lt(u.unlockRateRequirement))
      return false;
    if (u.unlockClickedMewnitsRequirement) {
      const lifetimeClickMewnits = storage.getLifetimeClickMewnits();
      if (lifetimeClickMewnits.lt(u.unlockClickedMewnitsRequirement))
        return false;
    }
    if (u.adoptedCatsRequirement) {
      const adoptedCats = storage.getAdoptedCatsNumber();
      if (adoptedCats.lt(u.adoptedCatsRequirement)) return false;
    }

    return true;
  }

  function buyUpgrade(u) {
    if (isPaused) return;

    const cost = D(u.baseCost).times(D(1.15).pow(u.owned)).floor();

    if (count.lt(cost)) return;

    count = count.minus(cost);

    saveMewnits();

    if (autoAnimFrame) {
      cancelAnimationFrame(autoAnimFrame);
      autoAnimFrame = null;
    }

    counterDisplay.textContent = formatNumber(count);

    u.owned = u.owned.plus(1);
    storage.setUpgradeOwned(u.id, u.owned);

    AudioList.Click();

    updateAutoRate();
    updateClickPower();
    ratesNeedUpdate = true; // ADDED: Signal that rates changed
    renderUpgrades();
    renderSubUpgrades();

    if (!autoInterval && autoRate.gt(0)) {
      startAutoIncrement();
    }
  }

  function buySubUpgrade(u) {
    if (isPaused) return;
    const cost = D(u.cost);
    if (count.lt(cost)) return;
    count = count.minus(cost);

    if (autoAnimFrame) {
      cancelAnimationFrame(autoAnimFrame);
      autoAnimFrame = null;
    }

    counterDisplay.textContent = formatNumber(count);

    storage.setSubUpgradeOwned(u.id);

    if (u.type === "clickPowerAdder") {
      baseClickPower = baseClickPower.plus(u.bonus);
      storage.setClickPower(baseClickPower);
    } else if (u.type === "clickPowerMultiplier") {
      baseClickPower = baseClickPower.times(u.bonus);
      storage.setClickPower(baseClickPower);

      if (u.targetUpgradeId !== undefined && u.alsoUpgradeMultiplier) {
        const t = upgrades.find((x) => x.id === u.targetUpgradeId);
        t.multiplier = t.multiplier.times(u.bonus);
        storage.setUpgradeMultiplier(t.id, t.multiplier);
      }
    } else if (u.type === "upgradeMultiplier") {
      const t = upgrades.find((x) => x.id === u.targetUpgradeId);
      t.multiplier = t.multiplier.times(u.bonus);
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

    AudioList.Click();

    updateAutoRate();
    updateClickPower();
    ratesNeedUpdate = true; // ADDED: Signal that rates changed
    saveMewnits();
    renderUpgrades();
    renderSubUpgrades();

    const el = document.querySelector(`.sub-upgrade[data-id="${u.id}"]`);
    el?.remove();
  }

  setupClickHandler({
    clickerButton,
    clickerImg,
    getClickPower: () => clickPower,
    incrementCount: (amount) => {
      count = count.plus(amount);
      animateCounter(counterDisplay, count);
    },
    saveMewnits,
    updateAffordability,
    storage,
  });

  function updateAffordability() {
    let availUpgradesAmount = 0;
    let cheapestUpgrade = null;
    upgradesContainer.querySelectorAll(".upgrade").forEach((div, i) => {
      const u = upgrades[i];
      const cost = D(u.baseCost).times(D(1.15).pow(u.owned)).floor();
      const afford = count.gte(cost);
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
          (cheapestUpgrade && cost.lt(cheapestUpgrade.cost))
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
        buyUpgrade(cheapestUpgrade.u);
      };
    } else {
      autoBuyUpgradeButton.disabled = true;
      autoBuyUpgradeButton.title = "Not Yet...";
      autoBuyUpgradeButton.onclick = null;
    }

    let affordableUpgrades = [];

    upgrades.forEach((u) => {
      const cost = D(u.baseCost).times(D(1.15).pow(u.owned)).floor();
      if (count.gte(cost)) {
        affordableUpgrades.push({ u, cost });
      }
    });

    affordableUpgrades.sort((a, b) => {
      if (a.cost.lt(b.cost)) return -1;
      if (a.cost.gt(b.cost)) return 1;
      return 0;
    });

    let upgradeSpend = D(0);
    let purchasableUpgrades = [];

    for (const item of affordableUpgrades) {
      const nextSpend = upgradeSpend.plus(item.cost);
      if (count.gte(nextSpend)) {
        upgradeSpend = nextSpend;
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
        purchasableUpgrades.forEach(({ u }) => {
          buyUpgrade(u);
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
      const afford = count.gte(u.cost) && isSubUnlocked(u);
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
      count.gte(
        D(cheapestSubUpgrades[0].cost).plus(cheapestSubUpgrades[1].cost),
      )
    ) {
      let potentialSpend = D(0);
      let purchasableSubUpgrades = [];

      for (const u of cheapestSubUpgrades) {
        const uCost = D(u.cost);
        if (count.gte(potentialSpend.plus(uCost))) {
          potentialSpend = potentialSpend.plus(uCost);
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
  }

  function syncBiscuitEfficiencies() {
    storage.setBiscuitEfficiency(storage.getBaseBiscuitEfficiency());
  }

  function Pause() {
    if (isPaused) return;

    isPaused = true;
    pauseResumeButton.textContent = "▶️";

    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }

    if (activeTimedBoostTimeout) {
      clearTimeout(activeTimedBoostTimeout);
      activeTimedBoostTimeout = null;
    }

    const numPauses = storage.getNumberOfPauses();
    storage.setNumberOfPauses(numPauses.plus(1));

    if (!pauseInterval) {
      pauseInterval = setInterval(() => {
        const current = storage.getTimeSpentPaused();
        storage.setTimeSpentPaused(current.plus(MS_IN_A_SEC));
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

  const gameStartTime = storage.getGameStartTimeMs();
  if (gameStartTime.eq(0)) {
    storage.setGameStartTime();
    console.log("Game Started @: ", storage.getGameStartTimeMs());
  }

  window.addEventListener("numberFormatChanged", () => {
    console.log("Number format changed, updating displays...");
    // All displays that show numbers should be updated when the format changes
    updateAutoRate();
    updateClickPower();
    renderUpgrades();
    renderSubUpgrades();
    updateBiscuitsDisplay();
    updateBiscuitEfficiency();
  });

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
