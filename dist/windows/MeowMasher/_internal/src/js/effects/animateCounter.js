import { formatNumber } from "../helpers/formatNumber.js";

// -----------------------------
// Dumb, authoritative counter renderer
// -----------------------------
export function animateCounter(display, value) {
  display.textContent = formatNumber(value);
}
