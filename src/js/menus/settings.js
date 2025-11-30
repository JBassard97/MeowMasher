import { storage } from "../logic/storage.js";

const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeDialog = document.getElementById("close-settings-dialog");
const resetGame = document.getElementById("reset-game");
const flipUiCheckbox = document.getElementById("flip-ui");

const mainEl = document.querySelector("main");

// --- Load initial state from storage ---
flipUiCheckbox.checked = storage.getIsUiFlipped();

// Apply initial layout
mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";

// --- When checkbox changes, save setting ---
flipUiCheckbox.addEventListener("change", () => {
  storage.setIsUiFlipped(flipUiCheckbox.checked);

  mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";
});

// Dialog open/close
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

settingsDialog.addEventListener("click", (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.classList.remove("active");
  }
});
