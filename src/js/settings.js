// --- Settings Dialog ---
const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeDialog = document.getElementById("close-dialog");
const resetGame = document.getElementById("reset-game");

settingsIcon.addEventListener("click", () => {
  settingsDialog.classList.add("active");
});

closeDialog.addEventListener("click", () => {
  settingsDialog.classList.remove("active");
});

resetGame.addEventListener("click", () => {
  localStorage.clear();
  window.location.reload();
});

// Close dialog when clicking outside
settingsDialog.addEventListener("click", (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.classList.remove("active");
  }
});
