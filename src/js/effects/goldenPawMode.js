export function toggleGoldenPawMode(isInGoldenPawMode, modeType) {
  const clickerArea = document.querySelector(".clicker-area");
  if (isInGoldenPawMode) {
    clickerArea.style.border = "2px solid gold";
    clickerArea.style.boxShadow =
      "0 0 12px 4px rgba(255, 215, 0, 0.8), 0 0 12px 4px rgba(255, 215, 0, 0.4) inset";

    switch (modeType) {
      case "mps":
        document.querySelector(".rate-display").style.color = "lightgreen";
        break;
      default:
        break;
    }
  } else {
    clickerArea.style.border = "none";
    clickerArea.style.boxShadow = "0 0 5px 2px rgba(255, 255, 255, 0.856)";
    switch (modeType) {
      case "mps":
        document.querySelector(".rate-display").style.color = "white";
        break;
      default:
        break;
    }
  }

  return;
}
