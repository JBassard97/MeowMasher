import { storage } from "./storage.js";

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
  if (statsDialog.classList.contains("active")) {
    // Mewnits
    document.getElementById("stats-lifetime-mewnits-display").textContent =
      storage.getLifetimeMewnits().toLocaleString() || "0";
    document.getElementById("stats-current-mewnits-display").textContent =
      storage.getMewnits().toLocaleString() || "0";
    // Clicks
    document.getElementById("stats-lifetime-clicks-display").textContent =
      storage.getLifetimeClicks().toLocaleString() || "0";
    document.getElementById(
      "stats-lifetime-clicks-mewnits-display"
    ).textContent = storage.getLifetimeClickMewnits().toLocaleString() || "0";
    document.getElementById(
      "stats-current-clickpower-display"
    ).textContent = `${storage.getClickPower().toLocaleString() || "1"} ${
      storage.getThousandFingersBonus()
        ? `(+${storage
            .getThousandFingersBonus()
            .toLocaleString()} from Thousand Pats)`
        : ""
    }`;
    // Active Bonuses
    document.getElementById("stats-thousand-pats-display").textContent =
      storage.getThousandFingersBonus().toLocaleString() || "0";
  }
}, 1000);
