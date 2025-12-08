// effects/goldenPawprint.js
import { storage } from "../logic/storage.js";

export function startGoldenPawprintSpawner(clickerButton, onClick) {
  // Spawn every 5 minutes
  const SPAWN_INTERVAL = 5 * 60 * 1000; // 9 min
  const LIFETIME = 9000; // 9 seconds

  function spawnGoldenPawprint() {
    const el = document.createElement("img");
    el.className = "golden-pawprint";
    el.src = "src/assets/images/goldenPawprint.svg";

    // Position it randomly inside the clicker area
    const rect = clickerButton.getBoundingClientRect();
    el.style.position = "absolute";
    el.style.left = Math.random() * (rect.width - 60) + "px";
    el.style.top = Math.random() * (rect.height - 60) + "px";
    el.style.width = "75px";
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    el.style.zIndex = 10;

    clickerButton.appendChild(el);

    // Remove after 9 seconds unless clicked
    const timeout = setTimeout(() => {
      if (el.isConnected) el.remove();
    }, LIFETIME);

    // Clicking removes & rewards
    el.onclick = () => {
      clearTimeout(timeout);
      if (onClick) onClick(); // give reward
      storage.addGoldenPawClick();
      updateGoldenPawprintClicksDisplay();
      el.remove();
    };
  }

  // Start interval
  updateGoldenPawprintClicksDisplay();
  spawnGoldenPawprint(); // optional immediate first spawn
  setInterval(spawnGoldenPawprint, SPAWN_INTERVAL);
}

function updateGoldenPawprintClicksDisplay() {
  const display = document.getElementById("golden-paws-clicked-number");
  display.textContent = storage.getNumberofGoldenPawClicks().toLocaleString();
}
