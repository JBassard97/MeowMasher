import { storage } from "../logic/storage.js";
import { AudioList } from "../audio/audio.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";

const leftPawButton = document.getElementById("left-paw");
const rightPaw = document.getElementById("right-paw");
const leftArm = document.querySelector(".left-arm-container");
const rightArm = document.querySelector(".right-arm-container");

const handlePawPress = (direction) => {
  if (direction == "left") {
    if (leftPawButton == lastPawPressed) return;
    lastPawPressed = leftPawButton;
    leftArm.style.transform = "translate(20%, 4px)";
    rightArm.style.transform = "translate(-20%, 30px)";
    pressIndex++;
    console.log("Left", pressIndex);
    if (pressIndex == 2) {
      storage.setBiscuits(
        storage.getBiscuits() + storage.getBiscuitEfficiency(),
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
    console.log("Right", pressIndex);
    if (pressIndex == 2) {
      storage.setBiscuits(
        storage.getBiscuits() + storage.getBiscuitEfficiency(),
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

leftPawButton.addEventListener("click", (e) => {
  handlePawPress("left");
});
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "g" && storage.getIsInBiscuitsMode()) {
    handlePawPress("left");
  }
});

rightPaw.addEventListener("click", (e) => {
  handlePawPress("right");
});
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "h" && storage.getIsInBiscuitsMode()) {
    handlePawPress("right");
  }
});
