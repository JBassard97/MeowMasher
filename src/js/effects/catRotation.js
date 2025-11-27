export function createCatRotator(clickerImg) {
  const numberOfCatImages = 23;
  let catImages = [];

  for (let i = 0; i < numberOfCatImages; i++) {
    catImages.push(`src/assets/images/clickable-cats/${i}.png`);
  }

  // Shuffle helper function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(catImages); // initial shuffle
  let index = 0;

  // Set initial image
  clickerImg.src = catImages[index];
  index++;

  function rotateCat() {
    if (index >= catImages.length) {
      shuffleArray(catImages); // reshuffle when we've gone through all
      index = 0;
    }

    clickerImg.src = catImages[index];
    index++;
  }

  return rotateCat;
}
