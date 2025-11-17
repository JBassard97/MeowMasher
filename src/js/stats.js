import { storage } from "./storage.js";

// --- Stats Dialog ---
const statsIcon = document.getElementById("stats-icon");
const statsDialog = document.getElementById("stats-dialog");
const closeStatsDialog = document.getElementById("close-stats-dialog");

statsIcon.addEventListener("click", () => {
  document.getElementById("stats-lifetime-mewnits-display").textContent =
    storage.getLifetimeMewnits() || "0";
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
    document.getElementById("stats-lifetime-mewnits-display").textContent =
      storage.getLifetimeMewnits().toLocaleString() || "0";
    document.getElementById("stats-current-mewnits-display").textContent =
      storage.getMewnits().toLocaleString() || "0";
  }
}, 1000);
