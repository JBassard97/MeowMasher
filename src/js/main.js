import { createCatRotator } from "./catRotation.js";
import { describeSub } from "./describeSub.js";
import { spawnClickPopup } from "./clickPopup.js";
import { SUB_UPGRADE_STYLES, UPGRADE_GRADIENT } from "./upgradeStyles.js";
import { storage } from "./storage.js";

const mode = "de9v";
const devBonus = 5000000000;

document.addEventListener("DOMContentLoaded", async () => {
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
  let baseClickPower = storage.getClickPower();
  let autoRate = 0;
  let clickPower = 0;
  let autoInterval = null;
  let animationFrame = null;

  const rotateCat = createCatRotator(clickerImg);

  // Restore upgrade data
  upgrades.forEach((u) => {
    u.owned = storage.getUpgradeOwned(u.id);
    u.multiplier = storage.getUpgradeMultiplier(u.id);
    u.extraBonus = 0;
  });

  // -----------------------------
  // Animated Counter
  // -----------------------------
  function animateCounter(display, start, end, duration = 1000) {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    const startTime = performance.now();

    function update(now) {
      let p = Math.min((now - startTime) / duration, 1);
      display.textContent = Math.floor(
        start + (end - start) * p
      ).toLocaleString();
      if (p < 1) animationFrame = requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // -----------------------------
  // Thousand Fingers
  // -----------------------------
  function computeThousandFingers() {
    const ownedTFs = subUpgrades.filter(
      (u) => u.type === "thousandFingers" && storage.getSubUpgradeOwned(u.id)
    );

    if (!ownedTFs.length) {
      upgrades.forEach((u) => (u.extraBonus = 0));
      storage.setThousandFingersBonus(0);
      return 0;
    }

    const nonPatsOwned = upgrades
      .filter((u) => u.name !== "Pats")
      .reduce((sum, u) => sum + u.owned, 0);

    let total = nonPatsOwned;
    ownedTFs.forEach((tf) => (total *= tf.bonus));

    upgrades.forEach((u) => {
      u.extraBonus = u.name === "Pats" ? total : 0;
    });

    storage.setThousandFingersBonus(total);
    return total;
  }

  // -----------------------------
  // Full Click Power Recalc
  // -----------------------------
  function updateClickPower() {
    const tf = computeThousandFingers();
    const percent = storage.getPercentOfMpsClickAdder(); // e.g. 0.01
    const mpsBonus = Math.floor(autoRate * percent);

    clickPower = baseClickPower + tf + mpsBonus;

    if (mode === "dev") clickPower += devBonus;

    clickRateDisplay.textContent = clickPower.toLocaleString();
  }

  // -----------------------------
  // Auto Mewnits / second
  // -----------------------------
  function updateAutoRate() {
    autoRate = upgrades.reduce(
      (sum, u) =>
        sum + u.owned * (u.rate * (u.multiplier || 1) + (u.extraBonus || 0)),
      0
    );

    storage.setMewnitsPerSecond(autoRate);
    rateDisplay.textContent = autoRate.toLocaleString();
  }

  function startAutoIncrement() {
    if (autoInterval) clearInterval(autoInterval);
    if (autoRate <= 0) return;

    const tick = () => {
      const prev = count;
      count += autoRate;

      animateCounter(counterDisplay, prev, count);
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
          <strong>${u.name}</strong>
          <p><b>${u.cost.toLocaleString()}</b> <span style="font-size:0.5rem">Mewnits</span></p>
          <p>${describeSub(u, upgrades)}</p>
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
    }

    updateAutoRate();
    updateClickPower();
    saveMewnits();
    renderUpgrades();
    renderSubUpgrades();
    startAutoIncrement();

    div.remove();
  }

  // -----------------------------
  // Click
  // -----------------------------
  clickerButton.onclick = (e) => {
    const rect = clickerButton.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    spawnClickPopup(clickX, clickY, clickPower, clickerButton);

    count += clickPower;
    rotateCat();

    storage.addLifetimeMewnits(clickPower);
    storage.addLifetimeClicks();
    storage.addLifetimeClickMewnits(clickPower);

    counterDisplay.textContent = count.toLocaleString();
    saveMewnits();
    updateAffordability();
  };

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

  function saveMewnits() {
    storage.setMewnits(count);
    counterDisplay.textContent = count.toLocaleString();
  }

  // -----------------------------
  // INIT
  // -----------------------------
  updateAutoRate();
  updateClickPower();
  saveMewnits();
  renderUpgrades();
  renderSubUpgrades();
  startAutoIncrement();
});
