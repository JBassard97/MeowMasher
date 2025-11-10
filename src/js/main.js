import { createCatRotator } from "./catRotation.js";
import { storage } from "./storage.js";
const mode = "dev";
const devBonus = 500000;

document.addEventListener("DOMContentLoaded", async () => {
  const counterDisplay = document.getElementById("counter");
  const rateDisplay = document.getElementById("rate");
  const clickRateDisplay = document.getElementById("click-rate");
  const clickerButton = document.getElementById("clicker");
  const clickerImg = clickerButton.querySelector("img");
  const upgradesContainer = document.querySelector(".upgrades");
  const subUpgradesContainer = document.querySelector(".sub-upgrades");

  // --- Load data from JSON ---
  const [upgrades, subUpgrades] = await Promise.all([
    fetch("src/data/upgrades.json").then((res) => res.json()),
    fetch("src/data/subUpgrades.json").then((res) => res.json()),
  ]);

  // --- Persistent State ---
  let count = storage.getMewnits();
  let clickPower = storage.getClickPower();
  let autoRate = 0;
  let autoInterval = null;
  let animationFrame = null;

  // --- Cat rotation setup ---
  const rotateCat = createCatRotator(clickerImg);

  // --- Load owned upgrades ---
  upgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id);
    u.multiplier = storage.getUpgradeMultiplier(u.id);
  });

  // --- Helper: Animate Counter ---
  function animateCounter(display, start, end, duration = 1000) {
    if (animationFrame) cancelAnimationFrame(animationFrame);

    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (end - start) * progress);
      display.textContent = value.toLocaleString();
      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      } else {
        animationFrame = null;
      }
    }
    requestAnimationFrame(update);
  }

  // --- Thousand Fingers Helper ---
  // --- Thousand Fingers Helper ---
  function updateThousandFingersBonus() {
    const tf = subUpgrades.find((u) => u.type === "thousandFingers");
    if (!tf || !storage.getSubUpgradeOwned(tf.id)) return;

    // Count all non-(Dry) Cat Food upgrades owned
    const nonDryOwned = upgrades
      .filter((u) => u.name !== "(Dry) Cat Food" && u.owned > 0)
      .reduce((sum, u) => sum + u.owned, 0);

    const totalBonus = nonDryOwned * tf.bonus;

    // Apply bonus to click power
    clickPower = storage.getClickPower() + totalBonus;

    // Apply bonus ONLY to (Dry) Cat Food's extraBonus for auto rate
    upgrades.forEach((u) => {
      if (u.name === "(Dry) Cat Food") {
        u.extraBonus = totalBonus;
      }
    });
  }

  // --- Rendering functions ---
  function renderUpgrades() {
    upgradesContainer.innerHTML = "";
    upgrades.forEach((u) => {
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      const affordable = count >= cost;
      const multiplier = u.multiplier || 1;
      const effectiveRate = u.rate * multiplier + (u.extraBonus || 0); // ← add extraBonus here

      const div = document.createElement("div");
      div.className = "upgrade";
      div.innerHTML = `
      <img src="${u.image || "src/assets/images/placeholder.png"}" alt="${
        u.name
      }" style="height: 100%" />
      <div class="upgrade-info">
        <strong>${u.name}</strong>
        <p>${cost.toLocaleString()} Mewnits</p>
        <p>+${effectiveRate.toLocaleString()} Mew/S</p>
      </div>
      <p class="owned-number">${u.owned}</p>
    `;

      div.style.opacity = affordable ? "1" : "0.4";
      div.style.pointerEvents = affordable ? "auto" : "none";

      div.addEventListener("click", () => buyUpgrade(u, cost));
      upgradesContainer.appendChild(div);
    });
  }

  function renderSubUpgrades() {
    subUpgradesContainer.innerHTML = "";

    const sortedSubs = [...subUpgrades].sort((a, b) => a.cost - b.cost);

    sortedSubs.forEach((u) => {
      const owned = storage.getSubUpgradeOwned(u.id);
      if (owned) return;

      if (
        u.unlockRequirement !== undefined &&
        u.targetUpgradeId !== undefined
      ) {
        const targetUpgrade = upgrades.find(
          (upgrade) => upgrade.id === u.targetUpgradeId
        );
        if (targetUpgrade && targetUpgrade.owned < u.unlockRequirement) return;
      }

      if (u.unlockRateRequirement !== undefined) {
        if (autoRate < u.unlockRateRequirement) return;
      }

      const div = document.createElement("div");
      div.className = "sub-upgrade";

      let description = "";
      const targetUpgrade = upgrades.find(
        (upgrade) => upgrade.id === u.targetUpgradeId
      );

      if (u.type === "clickPowerAdder") {
        div.style.borderColor = "cyan";
        description = `+${u.bonus} Click Power`;
      } else if (u.type === "clickPowerMultiplier") {
        div.style.borderColor = "cyan";
        if (u.alsoUpgradeMultiplier && targetUpgrade) {
          description = `${u.bonus}x Click Power & ${u.bonus}x ${targetUpgrade.name}`;
        } else {
          description = `${u.bonus}x Click Power`;
        }
      } else if (u.type === "upgradeMultiplier") {
        div.style.borderColor = "magenta";
        description = `${u.bonus}x ${
          targetUpgrade?.name || "Unknown"
        } Production`;
      } else if (u.type === "thousandFingers") {
        div.style.borderColor = "gold";
        description = `+1 Click Power & Dry Cat Food per non-Dry upgrade owned`;
      }

      div.innerHTML = `
        <strong>${u.name}</strong>
        <p>${u.cost.toLocaleString()} Mewnits</p>
        <p>${description}</p>
      `;

      div.addEventListener("click", () => buySubUpgrade(u, div));
      subUpgradesContainer.appendChild(div);
    });

    updateAffordability();
    updateSubUpgradeAffordability();
  }

  // --- Purchase functions ---
  function buyUpgrade(u, cost) {
    if (count < cost) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    count -= cost;
    u.owned++;
    counterDisplay.textContent = count.toLocaleString();
    updateSubUpgradeAffordability();
    saveAndUpdate();
    updateThousandFingersBonus();
    renderUpgrades();
    renderSubUpgrades();
  }

  function buySubUpgrade(u, div) {
    const owned = storage.getSubUpgradeOwned(u.id);
    if (owned || count < u.cost) return;

    if (animationFrame) cancelAnimationFrame(animationFrame);
    count -= u.cost;

    if (u.type === "clickPowerAdder") {
      clickPower += u.bonus;
      storage.setClickPower(clickPower);
    } else if (u.type === "clickPowerMultiplier") {
      clickPower *= u.bonus;
      storage.setClickPower(clickPower);

      if (u.targetUpgradeId !== undefined && u.alsoUpgradeMultiplier) {
        const targetUpgrade = upgrades.find(
          (upgrade) => upgrade.id === u.targetUpgradeId
        );
        if (targetUpgrade) {
          targetUpgrade.multiplier = (targetUpgrade.multiplier || 1) * u.bonus;
          storage.setUpgradeMultiplier(
            targetUpgrade.id,
            targetUpgrade.multiplier
          );
        }
      }
    } else if (u.type === "upgradeMultiplier") {
      const targetUpgrade = upgrades.find(
        (upgrade) => upgrade.id === u.targetUpgradeId
      );
      if (targetUpgrade) {
        targetUpgrade.multiplier = (targetUpgrade.multiplier || 1) * u.bonus;
        storage.setUpgradeMultiplier(
          targetUpgrade.id,
          targetUpgrade.multiplier
        );
      }
    } else if (u.type === "thousandFingers") {
      storage.setSubUpgradeOwned(u.id);
      updateThousandFingersBonus();
    }

    storage.setSubUpgradeOwned(u.id);
    storage.setMewnits(count);
    counterDisplay.textContent = count.toLocaleString();
    updateSubUpgradeAffordability();

    updateAutoRate();
    updateDisplayStats();
    renderUpgrades();
    startAutoIncrement();

    if (div && div.parentNode) div.parentNode.removeChild(div);
  }

  // --- Click logic ---
  clickerButton.addEventListener("click", () => {
    const increment = clickPower + (mode === "dev" ? devBonus : 0);
    count += increment;
    storage.addLifetimeMewnits(increment);
    rotateCat();
    counterDisplay.textContent = count.toLocaleString();
    updateSubUpgradeAffordability();
    saveAndUpdate();
  });

  // --- Helpers ---
  function updateAutoRate() {
    autoRate = upgrades.reduce((sum, u) => {
      const multiplier = u.multiplier || 1;
      const extra = u.extraBonus || 0;
      return sum + u.owned * (u.rate * multiplier + extra);
    }, 0);
  }

  function saveAndUpdate() {
    storage.setMewnits(count);
    upgrades.forEach((u) => {
      storage.setUpgradeOwned(u.id, u.owned);
    });

    const oldRate = autoRate;
    updateAutoRate();
    updateThousandFingersBonus();
    updateDisplayStats();
    updateAffordability();

    if (autoRate !== oldRate) startAutoIncrement();
  }

  function updateDisplayStats() {
    rateDisplay.textContent = autoRate.toLocaleString();
    clickRateDisplay.textContent = clickPower;
  }

  function updateSubUpgradeAffordability() {
    const sortedSubs = [...subUpgrades].sort((a, b) => a.cost - b.cost);
    const subDivs = subUpgradesContainer.querySelectorAll(".sub-upgrade");

    sortedSubs
      .filter((u) => !storage.getSubUpgradeOwned(u.id))
      .forEach((u, i) => {
        const div = subDivs[i];
        if (!div) return;

        const affordable = count >= u.cost;
        div.style.opacity = affordable ? "1" : "0.4";
        div.style.cursor = affordable ? "pointer" : "default";
        div.style.pointerEvents = affordable ? "auto" : "none";
      });
  }

  function updateAffordability() {
    const upgradeDivs = upgradesContainer.querySelectorAll(".upgrade");
    upgrades.forEach((u, i) => {
      const div = upgradeDivs[i];
      if (!div) return;
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.owned));
      const affordable = count >= cost;
      div.style.opacity = affordable ? "1" : "0.4";
      div.style.pointerEvents = affordable ? "auto" : "none";
    });

    updateSubUpgradeAffordability();
  }

  // --- Auto increment cycle ---
  function startAutoIncrement() {
    if (autoInterval) clearInterval(autoInterval);

    if (autoRate > 0) {
      const runTick = () => {
        const prev = count;
        count += autoRate;

        animateCounter(counterDisplay, prev, count, 1000);
        storage.setMewnits(count);
        storage.addLifetimeMewnits(autoRate);

        updateDisplayStats();
        updateAffordability();
        updateSubUpgradeAffordability();
      };

      runTick();
      autoInterval = setInterval(runTick, 1000);
    }
  }

  // --- Init ---
  updateAutoRate();
  updateThousandFingersBonus();
  counterDisplay.textContent = count.toLocaleString();
  updateDisplayStats();
  renderUpgrades();
  renderSubUpgrades();
  startAutoIncrement();
});
