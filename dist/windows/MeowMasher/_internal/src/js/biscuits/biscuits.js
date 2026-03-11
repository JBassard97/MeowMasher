import { storage } from "../logic/storage.js";
import { AudioList } from "../audio/audio.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";
import { $ } from "../helpers/$.js";
import { isPaused } from "../helpers/isPaused.js";

const leftPawButton = $("#left-paw");
const rightPaw = $("#right-paw");
const leftArm = $(".left-arm-container");
const rightArm = $(".right-arm-container");

const handlePawPress = (direction) => {
  if (isPaused) return;

  if (direction == "left") {
    if (leftPawButton == lastPawPressed) return;
    lastPawPressed = leftPawButton;
    leftArm.style.transform = "translate(20%, 4px)";
    rightArm.style.transform = "translate(-20%, 30px)";
    pressIndex++;

    if (pressIndex == 2) {
      // Decimal-safe math
      storage.setBiscuits(
        storage.getBiscuits().plus(storage.getBiscuitEfficiency()),
      );
      storage.setLifetimeBiscuits(
        storage.getLifetimeBiscuits().plus(storage.getBiscuitEfficiency()),
      );
      updateBiscuitsDisplay();
      pressIndex = 0;
      AudioList.Purr();
    }
  }

  if (direction == "right") {
    if (rightPaw == lastPawPressed) return;
    lastPawPressed = rightPaw;
    rightArm.style.transform = "translate(-20%, 4px)";
    leftArm.style.transform = "translate(20%, 30px)";
    pressIndex++;

    if (pressIndex == 2) {
      // Decimal-safe math
      storage.setBiscuits(
        storage.getBiscuits().plus(storage.getBiscuitEfficiency()),
      );
      storage.setLifetimeBiscuits(
        storage.getLifetimeBiscuits().plus(storage.getBiscuitEfficiency()),
      );
      updateBiscuitsDisplay();
      pressIndex = 0;
      AudioList.Purr();
    }
  }
};

updateBiscuitsDisplay();
leftArm.style.transform = "translate(20%, 30px)";
rightArm.style.transform = "translate(-20%, 30px)";

let pressIndex = 0;
let lastPawPressed;

leftPawButton.addEventListener("click", () => handlePawPress("left"));
rightPaw.addEventListener("click", () => handlePawPress("right"));

document.addEventListener("keydown", (e) => {
  if (!storage.getIsInBiscuitsMode()) return;
  if (e.key.toLowerCase() === "g") handlePawPress("left");
  if (e.key.toLowerCase() === "h") handlePawPress("right");
});
