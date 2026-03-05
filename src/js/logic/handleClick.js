export function setupClickHandler({
  clickerButton,
  clickerImg,
  getClickPower,
  incrementCount,
  saveMewnits,
  updateAffordability,
  storage,
}) {
  const rotateCat = createCatRotator(clickerImg);

  const handleClick = (clientX, clientY) => {
    if (isPaused) return;
    if (storage.getIsInBiscuitsMode()) return;

    const rect = clickerButton.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    const clickPower = getClickPower();

    spawnClickPopup(clickX, clickY, clickPower, clickerButton);
    rotateCat();
    AudioList.Meow();

    incrementCount(clickPower);
    storage.addLifetimeMewnits(clickPower);
    storage.addLifetimeClicks();
    storage.addLifetimeClickMewnits(clickPower);

    saveMewnits();
    updateAffordability();
  };

  let isTouchDevice = false;

  clickerButton.addEventListener(
    "touchstart",
    () => {
      isTouchDevice = true;
    },
    { passive: true },
  );

  clickerButton.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault(); // blocks iOS zoom
      const touch = e.changedTouches[0];
      handleClick(touch.clientX, touch.clientY);
    },
    { passive: false },
  );

  clickerButton.addEventListener("mousedown", (e) => {
    if (isTouchDevice) return; // touch already handled it
    handleClick(e.clientX, e.clientY);
  });
}
