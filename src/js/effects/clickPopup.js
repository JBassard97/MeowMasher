import { formatNumber } from "../helpers/formatNumber.js";

export function spawnClickPopup(x, y, value, clickerButton) {
  const el = document.createElement("div");
  el.className = "click-popup";

  // Use the same formatter as the rest of the game
  el.textContent = "+" + formatNumber(value);

  el.style.left = x + "px";
  el.style.top = y + "px";

  clickerButton.appendChild(el);

  // Remove after animation
  setTimeout(() => el.remove(), 1000);
}
