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
import { setupClickHandler } from "./logic/handleClick.js";
import { toggleGoldenPawMode } from "./effects/goldenPawMode.js";
import { chooseWeighted } from "./logic/chooseWeighted.js";
import { setLivingRoom } from "./effects/setLivingRoom.js";
import { AudioList } from "./audio/audio.js";

const mode = "dev00";
const devBonus = 50000000000;

document.addEventListener("DOMContentLoaded", async () => {
  await initStorage();

  const $ = (sel) => document.querySelector(sel);

  const counterDisplay = $("#counter");
  const rateDisplay = $("#rate");
  const clickRateDisplay = $("#click-rate");
  const clickerButton = $(".clicker-area");
  const clickerImg = clickerButton.querySelector("img");
  const upgradesContainer = $(".upgrades");
  const subUpgradesContainer = $(".sub-upgrades");

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
  let goldenPawMpsMultiplier = 2; // Temporary multiplier

  // Restore upgrade data
  upgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id);
    u.multiplier = storage.getUpgradeMultiplier(u.id);
    u.extraBonus = 0;
  });

  startGoldenPawprintSpawner(clickerButton, () => {
    // Weight configuration
    const reward = chooseWeighted({
      mps: 1, // equal chance by default
      mew: 2, // equal chance
    });

    if (reward === "mps") {
      // --- Apply 30s MPS Boost ---
      goldenPawActive = true;
      toggleGoldenPawMode(true, "mps", 30);
      updateAutoRate();
      startAutoIncrement();

      setTimeout(() => {
        goldenPawActive = false;
        toggleGoldenPawMode(false, "mps");
        updateAutoRate();
        startAutoIncrement();
      }, 1000 * 30);
    } else if (reward === "mew") {
      // --- Immediate Mewnits payout ---
      const bonus = autoRate * 60; // e.g. 60 seconds worth
      toggleGoldenPawMode(true, "mew", 1, bonus);
      const prev = count;
      count += bonus;
      storage.setMewnits(count);
      animateCounter(counterDisplay, prev, count, 400);
    }
  });

  // -----------------------------
  // Living Room Init
  // -----------------------------

  // -----------------------------
  // Full Click Power Recalc
  // -----------------------------
  function updateClickPower() {
    const tf = computeThousandFingers(upgrades, subUpgrades);
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
      0
    );

    // Apply golden pawprint multiplier only to autoRate
    autoRate = goldenPawActive
      ? Math.floor(baseAutoRate * goldenPawMpsMultiplier)
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

        div.onclick = () => buySubUpgrade(u, div);
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

  function buySubUpgrade(u, div) {
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

    div.remove();
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
    upgradesContainer.querySelectorAll(".upgrade").forEach((div, i) => {
      const u = upgrades[i];
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      const afford = count >= cost;
      div.style.opacity = afford ? "1" : "0.4";
      div.style.pointerEvents = afford ? "auto" : "none";
    });

    subUpgradesContainer.querySelectorAll(".sub-upgrade").forEach((div) => {
      const u = subUpgrades.find((x) => x.id == div.dataset.id);
      const afford = count >= u.cost && isSubUnlocked(u);
      div.style.opacity = afford ? "1" : "0.4";
      div.style.pointerEvents = afford ? "auto" : "none";
    });
  }

  function updateOwnedCatsDisplay() {
    document.getElementById("owned-cats-number").textContent =
      storage.getAdoptedCatsNumber();
  }

  function saveMewnits() {
    storage.setMewnits(count);
    counterDisplay.textContent = count.toLocaleString();
  }

  // -----------------------------
  // INIT
  // -----------------------------
  setLivingRoom();
  updateAutoRate();
  updateClickPower();
  saveMewnits();
  renderUpgrades();
  startAutoIncrement();
  renderSubUpgrades();
  updateOwnedCatsDisplay();
});
