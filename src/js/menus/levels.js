import { storage } from "../logic/storage.js";

const biscuitDisplay = document.getElementById("levels-current-biscuits");
const spawnFreqBar = document.querySelector(".spawn-freq-bar");

const updateBiscuitsDisplay = () => {
  biscuitDisplay.textContent = storage.getBiscuits().toLocaleString();
};

updateBiscuitsDisplay();

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
