// --- Achievements Dialog ---
const achievementsIcon = document.getElementById("achievements-icon");
const achievementsDialog = document.getElementById("achievements-dialog");
const closeDialog = document.getElementById("close-achievements-dialog");
const ownedSubUpgradesContainer =
  achievementsDialog.querySelector(".owned-subupgrades");

// Load the sub-upgrade data ONCE
let allSubUpgrades = [];
fetch("src/data/subUpgrades.json")
  .then((r) => r.json())
  .then((json) => (allSubUpgrades = json));

achievementsIcon.addEventListener("click", () => {
  renderOwnedSubUpgrades(); // ⬅️ populate before showing
  achievementsDialog.classList.add("active");
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

// -------------------------------
// RENDER OWNED SUB-UPGRADES
// -------------------------------
function renderOwnedSubUpgrades() {
  if (!allSubUpgrades.length) return;

  ownedSubUpgradesContainer.innerHTML = ""; // Clear previous content

  // Filter only the owned sub-upgrades
  const owned = allSubUpgrades.filter(
    (u) => localStorage.getItem(`subUpgrade_${u.id}_owned`) === "true"
  );

  if (owned.length === 0) {
    ownedSubUpgradesContainer.innerHTML = `<p class="no-owned">No sub-upgrades owned yet!</p>`;
    return;
  }

  const ownedRatioEl = document.createElement("h4");
  ownedRatioEl.className = "owned-ratio";
  ownedRatioEl.innerHTML = `
    <h3>
      ${owned.length}/${allSubUpgrades.length} (${Math.floor(
    (owned.length / allSubUpgrades.length) * 100
  )}%)
    </h3>
  `;
  ownedSubUpgradesContainer.appendChild(ownedRatioEl);

  // Generate a nice list
  owned.forEach((u) => {
    const div = document.createElement("div");
    div.className = "owned-subupgrade";

    div.innerHTML = `
      <strong>${u.name}</strong>
    `;

    ownedSubUpgradesContainer.appendChild(div);
  });
}
