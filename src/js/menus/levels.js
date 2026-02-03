// import { storage } from "../logic/storage.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";

const levelsIcon = document.getElementById("levels-icon");
const levelsDialog = document.getElementById("levels-dialog");
const closeLevelsDialog = document.getElementById("close-levels-dialog");

let isPaused = false;

window.addEventListener("pause", () => {
  isPaused = true;
});

window.addEventListener("resume", () => {
  isPaused = false;
});

// Dialog open/close
levelsIcon.addEventListener("click", () => {
  if (isPaused) return;
  levelsDialog.classList.add("active");
  updateBiscuitsDisplay();
});
levelsDialog.addEventListener("click", (e) => {
  if (e.target === levelsDialog) {
    levelsDialog.classList.remove("active");
  }
});
closeLevelsDialog.addEventListener("click", () => {
  levelsDialog.classList.remove("active");
});

const spawnFreqBar = document.querySelector(".spawn-freq-bar");
const level = 2;

for (let i = 0; i < 10; i++) {
  const section = document.createElement("div");
  section.textContent = i + 1;
  section.className = "chunk";
  if (i < level) {
    section.style.backgroundColor = "green";
  }
  spawnFreqBar.appendChild(section);
}
