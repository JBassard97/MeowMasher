// handleClick.js
import { spawnClickPopup } from "../effects/clickPopup.js";
import { createCatRotator } from "../effects/catRotation.js";
import { AudioList } from "../audio/audio.js";

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

  clickerButton.onclick = (e) => {
    if (storage.getIsInBiscuitsMode()) return;
    const rect = clickerButton.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickPower = getClickPower();

    spawnClickPopup(clickX, clickY, clickPower, clickerButton);
    rotateCat();
    AudioList.Meow();

    // update counts
    incrementCount(clickPower);

    storage.addLifetimeMewnits(clickPower);
    storage.addLifetimeClicks();
    storage.addLifetimeClickMewnits(clickPower);

    saveMewnits();
    updateAffordability();
  };
}
