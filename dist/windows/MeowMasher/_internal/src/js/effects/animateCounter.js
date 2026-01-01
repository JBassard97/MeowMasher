// -----------------------------
// Animated Counter
// -----------------------------
export function animateCounter(
  display,
  start,
  end,
  duration = 1000,
  animationFrame
) {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  const startTime = performance.now();

  function update(now) {
    let p = Math.min((now - startTime) / duration, 1);
    display.textContent = Math.floor(
      start + (end - start) * p
    ).toLocaleString();
    if (p < 1) animationFrame = requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
