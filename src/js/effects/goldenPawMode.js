let goldenInterval = null;

export function toggleGoldenPawMode(
  isInGoldenPawMode,
  modeType = "mps",
  seconds = 30,
  value
) {
  const clickerArea = document.querySelector(".clicker-area");
  const bonusDisplay = document.getElementById("bonus-display");
  const rateDisplay = document.querySelector(".rate-display");

  // ----- Turning OFF -----
  if (!isInGoldenPawMode) {
    if (goldenInterval) clearInterval(goldenInterval);
    goldenInterval = null;

    clickerArea.style.border = "none";
    clickerArea.style.boxShadow = "0 0 5px 2px rgba(255,255,255,0.85)";

    if (modeType === "mps") {
      rateDisplay.style.color = "white";
    }

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
