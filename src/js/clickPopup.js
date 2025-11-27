export function spawnClickPopup(x, y, value, clickerButton) {
  const el = document.createElement("div");
  el.className = "click-popup";
  el.textContent = "+" + value.toLocaleString();

  el.style.left = x + "px";
  el.style.top = y + "px";

  clickerButton.appendChild(el);

  // Remove after animation
  setTimeout(() => el.remove(), 1000);
}
