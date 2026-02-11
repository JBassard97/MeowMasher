import { storage, clearAll } from "../logic/storage.js";
import { setNumberFormat } from "../helpers/formatNumber.js";

const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeDialog = document.getElementById("close-settings-dialog");
const resetGame = document.getElementById("reset-game");
const flipUiCheckbox = document.getElementById("flip-ui");
const colorblindModeCheckbox = document.getElementById("color-blind-mode");
const fontSelect = document.getElementById("font-select");
const numberFormatSelect = document.getElementById("number-format-select");
const isMeowAudioOnCheckbox = document.getElementById("is-meow-on");
const meowAudioVolumeSlider = document.getElementById("meow-audio-level");
const meowLevelDisplay = document.getElementById("meow-level-display");
const isSfxAudioOnCheckbox = document.getElementById("is-sfx-on");
const sfxAudioVolumeSlider = document.getElementById("sfx-audio-level");
const sfxLevelDisplay = document.getElementById("sfx-level-display");

const bodyEl = document.querySelector("body");
const mainEl = document.querySelector("main");

/* ===============================
   INIT (called AFTER initStorage)
================================ */
export const initSettings = () => {
  // --- Load initial state from storage ---
  flipUiCheckbox.checked = storage.getIsUiFlipped();
  colorblindModeCheckbox.checked = storage.getIsInColorblindMode();

  if (!storage.getCurrentFont()) {
    storage.setCurrentFont("Finger Paint");
  }

  fontSelect.value = storage.getCurrentFont();
  numberFormatSelect.value = storage.getNumberFormat();
  isMeowAudioOnCheckbox.checked = storage.getIsMeowAudioOn();

  meowAudioVolumeSlider.disabled = !isMeowAudioOnCheckbox.checked;
  meowAudioVolumeSlider.value = storage.getMeowAudioLevel();
  meowLevelDisplay.textContent = isMeowAudioOnCheckbox.checked
    ? `${meowAudioVolumeSlider.value}0%`
    : "0%";

  isSfxAudioOnCheckbox.checked = storage.getIsSfxAudioOn();
  sfxAudioVolumeSlider.disabled = !isSfxAudioOnCheckbox.checked;
  sfxAudioVolumeSlider.value = storage.getSfxAudioLevel();
  sfxLevelDisplay.textContent = isSfxAudioOnCheckbox.checked
    ? `${sfxAudioVolumeSlider.value}0%`
    : "0%";

  // --- Apply initial layout ---
  mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";
  bodyEl.style.filter = colorblindModeCheckbox.checked
    ? "grayscale(100%) contrast(120%)"
    : "none";
  bodyEl.style.fontFamily = `${fontSelect.value}, Finger Paint, sans-serif`;
};

/* ===============================
   EVENT LISTENERS (safe to bind early)
================================ */

// Font
fontSelect.addEventListener("change", () => {
  const selectedFont = fontSelect.value;
  bodyEl.style.fontFamily = selectedFont;
  storage.setCurrentFont(selectedFont);
});

// Number format
numberFormatSelect.addEventListener("change", () => {
  const selectedFormat = numberFormatSelect.value;
  setNumberFormat(selectedFormat);
  storage.setNumberFormat(selectedFormat);
  window.dispatchEvent(new Event("numberFormatChanged"));
});

// Colorblind mode
colorblindModeCheckbox.addEventListener("change", () => {
  storage.setIsInColorblindMode(colorblindModeCheckbox.checked);
  bodyEl.style.filter = colorblindModeCheckbox.checked
    ? "grayscale(100%) contrast(120%)"
    : "none";
});

// Flip UI
flipUiCheckbox.addEventListener("change", () => {
  storage.setIsUiFlipped(flipUiCheckbox.checked);
  mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";
});

// Meow audio toggle
isMeowAudioOnCheckbox.addEventListener("change", () => {
  storage.setIsMeowAudioOn(isMeowAudioOnCheckbox.checked);
  meowAudioVolumeSlider.disabled = !isMeowAudioOnCheckbox.checked;
  meowLevelDisplay.textContent = isMeowAudioOnCheckbox.checked
    ? `${meowAudioVolumeSlider.value}0%`
    : "0%";
});

// Meow volume
meowAudioVolumeSlider.addEventListener("input", () => {
  storage.setMeowAudioLevel(meowAudioVolumeSlider.value);
  meowLevelDisplay.textContent = `${meowAudioVolumeSlider.value}0%`;
});

// SFX toggle
isSfxAudioOnCheckbox.addEventListener("change", () => {
  storage.setIsSfxAudioOn(isSfxAudioOnCheckbox.checked);
  sfxAudioVolumeSlider.disabled = !isSfxAudioOnCheckbox.checked;
  sfxLevelDisplay.textContent = isSfxAudioOnCheckbox.checked
    ? `${sfxAudioVolumeSlider.value}0%`
    : "0%";
});

// SFX volume
sfxAudioVolumeSlider.addEventListener("input", () => {
  storage.setSfxAudioLevel(sfxAudioVolumeSlider.value);
  sfxLevelDisplay.textContent = `${sfxAudioVolumeSlider.value}0%`;
});

// Dialog open/close
settingsIcon.addEventListener("click", () => {
  settingsDialog.classList.add("active");
});

closeDialog.addEventListener("click", () => {
  settingsDialog.classList.remove("active");
});

settingsDialog.addEventListener("click", (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.classList.remove("active");
  }
});

// Reset
resetGame.addEventListener("click", () => {
  clearAll();
  location.reload();
});
