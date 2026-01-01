import { storage } from "../logic/storage.js";
import { AudioList } from "../audio/audio.js";

const leftPaw = document.getElementById("left-paw");
const rightPaw = document.getElementById("right-paw");
const leftArm = document.querySelector(".left-arm");
const rightArm = document.querySelector(".right-arm");
const biscuitsNumber = document.getElementById("biscuits-number");
const levelsIcon = document.getElementById("levels-icon");
const boostsIcon = document.getElementById("boosts-icon");
const levelsDialog = document.getElementById("levels-dialog");
const boostsDialog = document.getElementById("boosts-dialog");
const closeLevelsDialog = document.getElementById("close-levels-dialog");
const closeBoostsDialog = document.getElementById("close-boosts-dialog");

// Dialog open/close
levelsIcon.addEventListener("click", () => {
  levelsDialog.classList.add("active");
});
levelsDialog.addEventListener("click", (e) => {
  if (e.target === levelsDialog) {
    levelsDialog.classList.remove("active");
  }
});
closeLevelsDialog.addEventListener("click", () => {
  levelsDialog.classList.remove("active");
});

boostsIcon.addEventListener("click", () => {
  boostsDialog.classList.add("active");
});
boostsDialog.addEventListener("click", (e) => {
  if (e.target === boostsDialog) {
    boostsDialog.classList.remove("active");
  }
});
closeBoostsDialog.addEventListener("click", () => {
  boostsDialog.classList.remove("active");
});
// ---------------------------------------------------

const updateBiscuitsDisplay = () => {
  biscuitsNumber.textContent = storage.getBiscuits().toLocaleString();
};

const handlePawPress = (direction) => {
  if (direction == "left") {
    if (leftPaw == lastPawPressed) return;
    lastPawPressed = leftPaw;
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

leftPaw.addEventListener("click", (e) => {
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
