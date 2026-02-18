import { describeSubBonus } from "../logic/describeSubBonus.js";
import { describeSubUnlock } from "../logic/describeSubUnlock.js";
import { SUB_UPGRADE_STYLES } from "../effects/upgradeStyles.js";
import { getItem } from "../logic/storage.js";
// --- Achievements Dialog ---
const achievementsIcon = document.getElementById("achievements-icon");
const achievementsDialog = document.getElementById("achievements-dialog");
const closeDialog = document.getElementById("close-achievements-dialog");
const earnedAchievementsContainer = achievementsDialog.querySelector(
  ".earned-achievements",
);
const ownedSubUpgradesContainer =
  achievementsDialog.querySelector(".owned-subupgrades");
const ownedRatioEl = document.querySelector(".owned-ratio");
const achievementsContent = document.querySelector(".achievements-content");

// Load both JSON data files ONCE
let allSubUpgrades = [];
let allUpgrades = [];
let allAchievements = [];
let dataLoaded = false;

Promise.all([
  fetch("src/data/subUpgrades.json").then((r) => r.json()),
  fetch("src/data/upgrades.json").then((r) => r.json()),
  fetch("src/data/achievements.json").then((r) => r.json()),
]).then(([subs, ups, achs]) => {
  allSubUpgrades = subs;
  allUpgrades = ups;
  allAchievements = achs;
  dataLoaded = true;
});

// ----------------------------------
// DIALOG EVENT LISTENERS
// ----------------------------------
achievementsIcon.addEventListener("click", () => {
  if (!dataLoaded) return; // prevents race condition
  renderEarnedAchievements();
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
// RENDER EARNED ACHIEVEMENTS
// ----------------------------------
function renderEarnedAchievements() {
  if (!dataLoaded) return;
  earnedAchievementsContainer.innerHTML = "";

  const owned = allAchievements.filter(
    (u) => getItem(`achievement_${u.id}_owned`) === "true",
  );

  if (owned.length === 0) {
    earnedAchievementsContainer.innerHTML = `
      <p class="no-owned">No achievements earned yet!</p>
    `;
    return;
  }

  owned.forEach((a, i) => {
    const outerDiv = document.createElement("div");
    outerDiv.className = "earned-achievement";
    outerDiv.style.animationDelay = `${i * 0.05}s`;
    const innerDiv = document.createElement("div");
    innerDiv.className = "earned-achievement-details";
    innerDiv.innerHTML = `<p><strong>#${a.id}: ${a.name}</strong></p><p>${a.desc}</p>`;
    outerDiv.appendChild(innerDiv);
    earnedAchievementsContainer.appendChild(outerDiv);
  });
}
// ----------------------------------

// ----------------------------------
// RENDER OWNED SUB-UPGRADES
// ----------------------------------
function renderOwnedSubUpgrades() {
  if (!dataLoaded) return;
  ownedRatioEl.textContent = "";
  ownedSubUpgradesContainer.innerHTML = "";

  // Find owned sub-upgrades
  const owned = allSubUpgrades.filter(
    (u) => getItem(`subUpgrade_${u.id}_owned`) === "true",
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
          allUpgrades,
        )}</b></li>
        <li style="color:lightblue">Unlock: <b>${describeSubUnlock(
          u,
          allUpgrades,
        )}</b></li>
        <span id="id">ID: ${u.id}</span>
      </ul>
    `;

    ownedSubUpgradesContainer.appendChild(div);
  });
}
