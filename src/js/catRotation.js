export function createCatRotator(clickerImg) {
  const catImages = [
    "src/assets/images/clickable-cats/alert_jar.png",
    "src/assets/images/clickable-cats/0.png",
    "src/assets/images/clickable-cats/1.png",
    "src/assets/images/clickable-cats/2.png",
    "src/assets/images/clickable-cats/3.png",
    "src/assets/images/clickable-cats/jar_loaf.png",
    "src/assets/images/clickable-cats/4.png",
    "src/assets/images/clickable-cats/5.png",
    "src/assets/images/clickable-cats/6.png",
    "src/assets/images/clickable-cats/7.png",
    "src/assets/images/clickable-cats/8.png",
    "src/assets/images/clickable-cats/9.png",
    "src/assets/images/clickable-cats/10.png",
    "src/assets/images/clickable-cats/11.png",
  ];

  let currentCatIndex = Number(localStorage.getItem("currentCatIndex")) || 0;
  clickerImg.src = catImages[currentCatIndex];

  function rotateCat() {
    currentCatIndex = (currentCatIndex + 1) % catImages.length;
    clickerImg.src = catImages[currentCatIndex];
    localStorage.setItem("currentCatIndex", currentCatIndex);
  }

  return rotateCat;
}
