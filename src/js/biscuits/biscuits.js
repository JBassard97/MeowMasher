import { storage } from "../logic/storage.js";
import { AudioList } from "../audio/audio.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";

const leftPawButton = document.getElementById("left-paw");
const rightPaw = document.getElementById("right-paw");
const leftArm = document.querySelector(".left-arm");
const rightArm = document.querySelector(".right-arm");

const handlePawPress = (direction) => {
  if (direction == "left") {
    if (leftPawButton == lastPawPressed) return;
    lastPawPressed = leftPawButton;
    leftArm.style.transform = "translateY(4px)";
    rightArm.style.transform = "translateY(30px)";
    pressIndex++;
    console.log("Left", pressIndex);
    if (pressIndex == 2) {
      storage.setBiscuits(storage.getBiscuits() + 1);
      updateBiscuitsDisplay();
      pressIndex = 0;
      AudioList.Purr();
    }
  }

  if (direction == "right") {
    if (rightPaw == lastPawPressed) return;
    lastPawPressed = rightPaw;
    rightArm.style.transform = "translateY(4px)";
    leftArm.style.transform = "translateY(30px)";
    pressIndex++;
    console.log("Right", pressIndex);
    if (pressIndex == 2) {
      storage.setBiscuits(storage.getBiscuits() + 1);
      updateBiscuitsDisplay();
      pressIndex = 0;
      AudioList.Purr();
    }
  }
};

updateBiscuitsDisplay();
leftArm.style.transform = "translateY(30px)";
rightArm.style.transform = "translateY(30px)";

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
