const handle = document.querySelector(".draggable");
const topContainer = document.querySelector(".sub-upgrades");

console.log("handle found:", handle);
console.log("topContainer found:", topContainer);

let dragging = false;
let startY = 0;
let startHeight = 0;

handle.addEventListener("pointerdown", (e) => {
  console.log("👇 pointerdown fired", e.pointerType);

  dragging = true;
  startY = e.clientY;
  startHeight = topContainer.getBoundingClientRect().height;

  console.log("startY:", startY);
  console.log("startHeight:", startHeight);

  handle.setPointerCapture(e.pointerId);
  handle.style.cursor = "grabbing";

  e.preventDefault();
});

handle.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  let deltaY = e.clientY - startY;

  // ⛔ limit drag travel to ±400px
  const MAX_TRAVEL = 150;
  deltaY = Math.max(-MAX_TRAVEL, Math.min(MAX_TRAVEL, deltaY));

  const newHeight = startHeight + deltaY;

  topContainer.style.minHeight = `${newHeight}px`;
});

function stopDrag(e) {
  console.log("🛑 stopDrag fired", e.type);

  dragging = false;

  try {
    handle.releasePointerCapture(e.pointerId);
    console.log("pointer capture released");
  } catch (err) {
    console.warn("releasePointerCapture failed", err);
  }

  handle.style.cursor = "row-resize";
}

handle.addEventListener("pointerup", stopDrag);
handle.addEventListener("pointercancel", stopDrag);
