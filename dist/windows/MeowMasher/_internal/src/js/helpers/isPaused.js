export let isPaused = false;

window.addEventListener("pause", () => {
  isPaused = true;
});

window.addEventListener("resume", () => {
  isPaused = false;
});
