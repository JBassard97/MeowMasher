import { storage, clearAll } from "../logic/storage.js";

const settingsIcon = document.getElementById("settings-icon");
const settingsDialog = document.getElementById("settings-dialog");
const closeDialog = document.getElementById("close-settings-dialog");
const resetGame = document.getElementById("reset-game");
const flipUiCheckbox = document.getElementById("flip-ui");
const colorblindModeCheckbox = document.getElementById("color-blind-mode");
const fontSelect = document.getElementById("font-select");
const isMeowAudioOnCheckbox = document.getElementById("is-meow-on");
const meowAudioVolumeSlider = document.getElementById("meow-audio-level");
const meowLevelDisplay = document.getElementById("meow-level-display");
const isSfxAudioOnCheckbox = document.getElementById("is-sfx-on");
const sfxAudioVolumeSlider = document.getElementById("sfx-audio-level");
const sfxLevelDisplay = document.getElementById("sfx-level-display");

const bodyEl = document.querySelector("body");
const mainEl = document.querySelector("main");

// --- Load initial state from storage ---
flipUiCheckbox.checked = storage.getIsUiFlipped();
colorblindModeCheckbox.checked = storage.getIsInColorblindMode();
if (!storage.getCurrentFont()) {
  storage.setCurrentFont("Finger Paint");
}
fontSelect.value = storage.getCurrentFont() || "Finger Paint";
isMeowAudioOnCheckbox.checked = storage.getIsMeowAudioOn();
meowAudioVolumeSlider.disabled = !isMeowAudioOnCheckbox.checked;
meowAudioVolumeSlider.value = storage.getMeowAudioLevel();
meowLevelDisplay.textContent = storage.getIsMeowAudioOn()
  ? `${meowAudioVolumeSlider.value}0%`
  : "0%";
isSfxAudioOnCheckbox.checked = storage.getIsSfxAudioOn();
sfxAudioVolumeSlider.disabled = !isSfxAudioOnCheckbox.checked;
sfxAudioVolumeSlider.value = storage.getSfxAudioLevel();
sfxLevelDisplay.textContent = storage.getIsSfxAudioOn()
  ? `${sfxAudioVolumeSlider.value}0%`
  : "0%";

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

// --- When color blind checkbox changes, save setting ---
colorblindModeCheckbox.addEventListener("change", () => {
  storage.setIsInColorblindMode(colorblindModeCheckbox.checked);

  bodyEl.style.filter = colorblindModeCheckbox.checked
    ? "grayscale(100%) contrast(120%)"
    : "none";
});

// --- When Flip Ui checkbox changes, save setting ---
flipUiCheckbox.addEventListener("change", () => {
  storage.setIsUiFlipped(flipUiCheckbox.checked);

  mainEl.style.flexDirection = flipUiCheckbox.checked ? "row-reverse" : "row";
});

// --- When Meow audio checkbox changes, save setting ---
isMeowAudioOnCheckbox.addEventListener("change", () => {
  storage.setIsMeowAudioOn(isMeowAudioOnCheckbox.checked);
  if (isMeowAudioOnCheckbox.checked) {
    meowAudioVolumeSlider.removeAttribute("disabled");
    meowLevelDisplay.textContent = `${meowAudioVolumeSlider.value}0%`;
  } else {
    meowAudioVolumeSlider.setAttribute("disabled", "true");
    meowLevelDisplay.textContent = "0%";
  }
});

// --- When Meow audio volume changes, save setting ---
meowAudioVolumeSlider.addEventListener("input", () => {
  storage.setMeowAudioLevel(meowAudioVolumeSlider.value);
  meowLevelDisplay.textContent = `${meowAudioVolumeSlider.value}0%`;
});

// --- When SFX audio checkbox changes, save setting ---
isSfxAudioOnCheckbox.addEventListener("change", () => {
  storage.setIsSfxAudioOn(isSfxAudioOnCheckbox.checked);
  if (isSfxAudioOnCheckbox.checked) {
    sfxAudioVolumeSlider.removeAttribute("disabled");
    sfxLevelDisplay.textContent = `${sfxAudioVolumeSlider.value}0%`;
  } else {
    sfxAudioVolumeSlider.setAttribute("disabled", "true");
    sfxLevelDisplay.textContent = "0%";
  }
});

// --- When SFX audio volume changes, save setting ---
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

resetGame.addEventListener("click", () => {
  clearAll();
  location.reload();
});

settingsDialog.addEventListener("click", (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.classList.remove("active");
  }
});
