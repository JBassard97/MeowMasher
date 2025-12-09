import { storage } from "../logic/storage.js";

const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeDialog = document.getElementById("close-settings-dialog");
const resetGame = document.getElementById("reset-game");
const flipUiCheckbox = document.getElementById("flip-ui");
const colorblindModeCheckbox = document.getElementById("color-blind-mode");
const fontSelect = document.getElementById("font-select");

const bodyEl = document.querySelector("body");
const mainEl = document.querySelector("main");

// --- Load initial state from storage ---
flipUiCheckbox.checked = storage.getIsUiFlipped();
colorblindModeCheckbox.checked = storage.getIsInColorblindMode();
if (!storage.getCurrentFont()) {
  storage.setCurrentFont("Finger Paint");
}
fontSelect.value = storage.getCurrentFont() || "Finger Paint";

// Apply initial layout
mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";
bodyEl.style.filter = colorblindModeCheckbox.checked
  ? "grayscale(100%) contrast(120%)"
  : "none";
bodyEl.style.fontFamily = `${fontSelect.value}, Finger Paint, sans-serif`;

// --- When font selection changes, save setting ---
fontSelect.addEventListener("change", () => {
  const selectedFont = fontSelect.value;
  bodyEl.style.fontFamily = `${selectedFont}`;
  storage.setCurrentFont(selectedFont);
});

// --- When checkbox changes, save setting ---
colorblindModeCheckbox.addEventListener("change", () => {
  storage.setIsInColorblindMode(colorblindModeCheckbox.checked);

  bodyEl.style.filter = colorblindModeCheckbox.checked
    ? "grayscale(100%) contrast(120%)"
    : "none";
});

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
  location.reload();
});

settingsDialog.addEventListener("click", (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.classList.remove("active");
  }
});
