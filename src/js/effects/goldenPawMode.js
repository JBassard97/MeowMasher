// ! LOGIC LIVES IN MAIN.JS

let goldenInterval = null;
let remainingSeconds = 0;
let currentModeType = null;
let currentValue = null;

// ======================
//   PAUSE / RESUME
// ======================
window.addEventListener("pause", () => {
  if (goldenInterval) {
    clearInterval(goldenInterval);
    goldenInterval = null;
  }
});

window.addEventListener("resume", () => {
  if (!goldenInterval && remainingSeconds > 0 && currentModeType) {
    startGoldenTimer();
  }
});

// ======================
//   TIMER CORE
// ======================
function startGoldenTimer() {
  const bonusDisplay = document.getElementById("bonus-display");
  const biscuitsBonusDisplay = document.getElementById(
    "biscuits-bonus-display",
  );

  goldenInterval = setInterval(() => {
    remainingSeconds--;

    if (currentModeType === "mps") {
      bonusDisplay.textContent = `2x Mewnits/S for ${remainingSeconds} Seconds`;
    }

    if (currentModeType === "biscuit-efficiency") {
      biscuitsBonusDisplay.textContent = `${currentValue.toLocaleString()}x Efficiency for ${remainingSeconds} Seconds`;
    }

    if (remainingSeconds <= 0) {
      clearInterval(goldenInterval);
      goldenInterval = null;
      toggleGoldenPawMode(false, currentModeType);
    }
  }, 1000);
}

// ======================
//   MAIN TOGGLE
// ======================
export function toggleGoldenPawMode(
  isInGoldenPawMode,
  modeType = "mps",
  seconds = 30,
  value,
) {
  const clickerArea = document.querySelector(".clicker-area");
  const bonusDisplay = document.getElementById("bonus-display");
  const biscuitsBonusDisplay = document.getElementById(
    "biscuits-bonus-display",
  );
  const rateDisplay = document.querySelector(".rate-display");
  const efficiencyDisplay = document.querySelector(".efficiency-display");
  const catMask = document.querySelector(".cat-mask");
  const rightArmMask = document.querySelector(".right-arm-mask");
  const leftArmMask = document.querySelector(".left-arm-mask");

  // ======================
  //      TURNING OFF
  // ======================
  if (!isInGoldenPawMode) {
    if (goldenInterval) clearInterval(goldenInterval);
    goldenInterval = null;

    remainingSeconds = 0;
    currentModeType = null;
    currentValue = null;

    clickerArea.style.border = "none";
    clickerArea.style.boxShadow = "0 0 5px 2px rgba(255,255,255,0.85)";

    rateDisplay.style.color = "white";
    efficiencyDisplay.style.color = "white";

    catMask.classList.remove("rainbow");
    rightArmMask.classList.remove("rainbow");
    leftArmMask.classList.remove("rainbow");

    biscuitsBonusDisplay.textContent = "";
    biscuitsBonusDisplay.style.display = "none";

    bonusDisplay.textContent = "";
    bonusDisplay.style.display = "none";

    return;
  }

  // ======================
  //      TURNING ON
  // ======================
  clickerArea.style.border = "2px solid gold";
  clickerArea.style.boxShadow =
    "0 0 12px 4px rgba(255,215,0,0.8), 0 0 12px 4px rgba(255,215,0,0.4) inset";

  // ======================
  //      MPS MODE
  // ======================
  if (modeType === "mps") {
    rateDisplay.style.color = "lightgreen";
    catMask.classList.add("rainbow");

    bonusDisplay.style.display = "block";
    bonusDisplay.textContent = `2x Mewnits/S for ${seconds} Seconds`;

    if (goldenInterval) clearInterval(goldenInterval);

    remainingSeconds = seconds;
    currentModeType = "mps";
    currentValue = null;

    startGoldenTimer();
    return;
  }

  // ================================
  //   BISCUIT EFFICIENCY MODE
  // ================================
  if (modeType === "biscuit-efficiency") {
    efficiencyDisplay.style.color = "lightgreen";

    rightArmMask.classList.add("rainbow");
    leftArmMask.classList.add("rainbow");

    biscuitsBonusDisplay.style.display = "block";
    biscuitsBonusDisplay.textContent = `${value.toLocaleString()}x Efficiency for ${seconds} Seconds`;

    if (goldenInterval) clearInterval(goldenInterval);

    remainingSeconds = seconds;
    currentModeType = "biscuit-efficiency";
    currentValue = value;

    startGoldenTimer();
    return;
  }

  // ======================
  //        MEW MODE
  // ======================
  if (modeType === "mew") {
    bonusDisplay.style.display = "block";
    bonusDisplay.textContent = `+${value.toLocaleString()} Mewnits`;

    if (goldenInterval) clearInterval(goldenInterval);

    goldenInterval = setTimeout(() => {
      toggleGoldenPawMode(false, "mew");
    }, 1000);

    return;
  }
}
