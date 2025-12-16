import { describeSubBonus } from "../logic/describeSubBonus.js";
import { describeSubUnlock } from "../logic/describeSubUnlock.js";
import { SUB_UPGRADE_STYLES } from "../effects/upgradeStyles.js";
// --- Achievements Dialog ---
const achievementsIcon = document.getElementById("achievements-icon");
const achievementsDialog = document.getElementById("achievements-dialog");
const closeDialog = document.getElementById("close-achievements-dialog");
const ownedSubUpgradesContainer =
  achievementsDialog.querySelector(".owned-subupgrades");
const ownedRatioEl = document.querySelector(".owned-ratio");
const achievementsContent = document.querySelector(".achievements-content");

// Load both JSON data files ONCE
let allSubUpgrades = [];
let allUpgrades = [];
let dataLoaded = false;

Promise.all([
  fetch("src/data/subUpgrades.json").then((r) => r.json()),
  fetch("src/data/upgrades.json").then((r) => r.json()),
]).then(([subs, ups]) => {
  allSubUpgrades = subs;
  allUpgrades = ups;
  dataLoaded = true;
});

// ----------------------------------
// DIALOG EVENT LISTENERS
// ----------------------------------
achievementsIcon.addEventListener("click", () => {
  if (!dataLoaded) return; // prevents race condition
  renderOwnedSubUpgrades();
  achievementsDialog.classList.add("active");
  requestAnimationFrame(() => {
    achievementsContent.scrollTop = 0;
  });
});

closeDialog.addEventListener("click", () => {
  achievementsDialog.classList.remove("active");
});

// Close when clicking backdrop
achievementsDialog.addEventListener("click", (e) => {
  if (e.target === achievementsDialog) {
    achievementsDialog.classList.remove("active");
  }
});

// ----------------------------------
// RENDER OWNED SUB-UPGRADES
// ----------------------------------
function renderOwnedSubUpgrades() {
  if (!dataLoaded) return;
  ownedRatioEl.textContent = "";
  ownedSubUpgradesContainer.innerHTML = "";

  // Find owned sub-upgrades
  const owned = allSubUpgrades.filter(
    (u) => localStorage.getItem(`subUpgrade_${u.id}_owned`) === "true"
  );

  if (owned.length === 0) {
    ownedSubUpgradesContainer.innerHTML = `
      <p class="no-owned">No sub-upgrades owned yet!</p>
    `;
    return;
  }

  // OWNED RATIO
  const percent = Math.floor((owned.length / allSubUpgrades.length) * 100);

  ownedRatioEl.textContent = `${owned.length}/${allSubUpgrades.length} (${percent}%)`;

  // LIST EACH OWNED SUB-UPGRADE
  owned.forEach((u, i) => {
    const div = document.createElement("div");
    div.className = "owned-subupgrade";

    const style = SUB_UPGRADE_STYLES[u.type];
    if (style) {
      Object.assign(div.style, style);
    }
    div.style.animationDelay = `${i * 0.05}s`;

    div.innerHTML = `
      <strong>${u.name}</strong>
      <ul>
        <li style="color:salmon">Cost: <b>${u.cost.toLocaleString()}</b></li>
        <li style="color:lightgreen">Bonus: <b>${describeSubBonus(
          u,
          allUpgrades
        )}</b></li>
        <li style="color:lightblue">Unlock Requirement: <b>${describeSubUnlock(
          u,
          allUpgrades
        )}</b></li>
        <span id="id">ID: ${u.id}</span>
      </ul>
    `;

    ownedSubUpgradesContainer.appendChild(div);
  });
}
