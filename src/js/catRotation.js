export function createCatRotator(clickerImg) {
  const numberOfCatImages = 19;
  let catImages = [];

  for (let i = 0; i < numberOfCatImages; i++) {
    catImages.push(`src/assets/images/clickable-cats/${i}.png`);
  }

  clickerImg.src = catImages[Math.floor(Math.random() * catImages.length)];

  function rotateCat() {
    clickerImg.src = catImages[Math.floor(Math.random() * catImages.length)];
  }

  return rotateCat;
}
