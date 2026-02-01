const handle = document.querySelector(".draggable");
const topContainer = document.querySelector(".sub-upgrades");

let dragging = false;
let startY = 0;
let startHeight = 0;

handle.addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) {
    return;
  }

  dragging = true;
  startY = e.clientY;
  startHeight = topContainer.getBoundingClientRect().height;

  handle.setPointerCapture(e.pointerId);
  handle.style.cursor = "grabbing";

  e.preventDefault();
});

handle.addEventListener("pointermove", (e) => {
  if (!dragging) {
    return;
  }

  const deltaY = e.clientY - startY;
  const newHeight = startHeight + deltaY;

  if (newHeight > 325 || newHeight < 100) return;

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
