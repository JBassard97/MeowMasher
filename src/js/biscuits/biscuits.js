const leftPaw = document.getElementById("left-paw");
const rightPaw = document.getElementById("right-paw");
const biscuitsNumber = document.getElementById("biscuits-number");

let numberOfBiscuits = 0;
biscuitsNumber.textContent = numberOfBiscuits;

let pressIndex = 0;
let lastPawPressed;

leftPaw.addEventListener("click", (e) => {
  if (leftPaw == lastPawPressed) return;
  lastPawPressed = leftPaw;
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
  pressIndex++;
  console.log("Right", pressIndex);
  if (pressIndex == 2) {
    numberOfBiscuits++;
    biscuitsNumber.textContent = numberOfBiscuits;
    pressIndex = 0;
  }
});
