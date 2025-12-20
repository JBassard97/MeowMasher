const leftPaw = document.getElementById("left-paw");
const rightPaw = document.getElementById("right-paw");
const leftArm = document.querySelector(".left-arm");
const rightArm = document.querySelector(".right-arm");
const biscuitsNumber = document.getElementById("biscuits-number");

let numberOfBiscuits = 0;
biscuitsNumber.textContent = numberOfBiscuits;
leftArm.style.transform = "translateY(30px)";
rightArm.style.transform = "translateY(30px)";

let pressIndex = 0;
let lastPawPressed;

leftPaw.addEventListener("click", (e) => {
  if (leftPaw == lastPawPressed) return;
  lastPawPressed = leftPaw;
  leftArm.style.transform = "translateY(4px)";
  rightArm.style.transform = "translateY(30px)";
  pressIndex++;
  console.log("Left", pressIndex);
  if (pressIndex == 2) {
    numberOfBiscuits++;
    biscuitsNumber.textContent = numberOfBiscuits;
    pressIndex = 0;
  }
});

rightPaw.addEventListener("click", (e) => {
  if (rightPaw == lastPawPressed) return;
  lastPawPressed = rightPaw;
  rightArm.style.transform = "translateY(4px)";
  leftArm.style.transform = "translateY(30px)";
  pressIndex++;
  console.log("Right", pressIndex);
  if (pressIndex == 2) {
    numberOfBiscuits++;
    biscuitsNumber.textContent = numberOfBiscuits;
    pressIndex = 0;
  }
});
