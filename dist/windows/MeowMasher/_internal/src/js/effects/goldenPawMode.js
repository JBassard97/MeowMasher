// ! LOGIC LIVES IN MAIN.JS

let goldenInterval = null;

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

  // ----- Turning OFF -----
  if (!isInGoldenPawMode) {
    if (goldenInterval) clearInterval(goldenInterval);
    goldenInterval = null;

    clickerArea.style.border = "none";
    clickerArea.style.boxShadow = "0 0 5px 2px rgba(255,255,255,0.85)";

    if (modeType === "mps") {
      rateDisplay.style.color = "white";
      catMask.classList.remove("rainbow");
    }

    if (modeType === "biscuit-efficiency") {
      efficiencyDisplay.style.color = "white";
      rightArmMask.classList.remove("rainbow");
      leftArmMask.classList.remove("rainbow");
    }

    biscuitsBonusDisplay.textContent = "";
    biscuitsBonusDisplay.style.display = "none";

    bonusDisplay.textContent = "";
    bonusDisplay.style.display = "none";

    return;
  }

  // ----- Turning ON -----
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

    let remaining = seconds;

    goldenInterval = setInterval(() => {
      remaining--;

      bonusDisplay.textContent = `2x Mewnits/S for ${remaining} Seconds`;

      if (remaining <= 0) {
        clearInterval(goldenInterval);
        goldenInterval = null;
        toggleGoldenPawMode(false, "mps");
      }
    }, 1000);

    return;
  }

  // =======================================
  //      BISCUITS EFFICIENCY MODE
  // =======================================
  if (modeType === "biscuit-efficiency") {
    efficiencyDisplay.style.color = "lightgreen";

    rightArmMask.classList.add("rainbow");
    leftArmMask.classList.add("rainbow");

    biscuitsBonusDisplay.style.display = "block";
    biscuitsBonusDisplay.textContent = `${value.toLocaleString()}x Efficiency for ${seconds} Seconds`;

    if (goldenInterval) clearInterval(goldenInterval);

    let remaining = seconds;

    goldenInterval = setInterval(() => {
      remaining--;

      biscuitsBonusDisplay.textContent = `${value.toLocaleString()}x Efficiency for ${remaining} Seconds`;

      if (remaining <= 0) {
        clearInterval(goldenInterval);
        goldenInterval = null;
        toggleGoldenPawMode(false, "biscuit-efficiency");
      }
    }, 1000);

    return;
  }

  // ======================
  //      MEW MODE
  // ======================
  if (modeType === "mew") {
    // Show reward instantly
    bonusDisplay.style.display = "block";
    bonusDisplay.textContent = `+${value.toLocaleString()} Mewnits`;

    // Clear any existing timer
    if (goldenInterval) clearInterval(goldenInterval);

    // Hide after 1 second
    goldenInterval = setTimeout(() => {
      toggleGoldenPawMode(false, "mew");
    }, 1000);

    return;
  }
}
