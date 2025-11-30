import { storage } from "../logic/storage.js";

export function createCatRotator(clickerImg) {
  // If nothing exists, initialize to 1
  if (!storage.getAdoptedCatsNumber()) {
    storage.initAdoptedCatsNumber();
  }

  // IMPORTANT: read again AFTER initializing
  let numberOfCatImages = storage.getAdoptedCatsNumber();

  let catImages = [];
  for (let i = 0; i < numberOfCatImages; i++) {
    catImages.push(`src/assets/images/clickable-cats/${i}.png`);
  }

  // If somehow still empty, prevent errors:
  if (catImages.length === 0) {
    catImages.push(`src/assets/images/clickable-cats/0.png`);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(catImages);
  let index = 0;

  clickerImg.src = catImages[index];
  index++;

  function rotateCat() {
    // 💡 Update dynamic cat count, so the rotator responds *during gameplay*
    const updatedCount = storage.getAdoptedCatsNumber();

    if (updatedCount !== numberOfCatImages) {
      numberOfCatImages = updatedCount;
      catImages = [];

      for (let i = 0; i < numberOfCatImages; i++) {
        catImages.push(`src/assets/images/clickable-cats/${i}.png`);
      }

      shuffleArray(catImages);
      index = 0;
    }

    if (index >= catImages.length) {
      shuffleArray(catImages);
      index = 0;
    }

    clickerImg.src = catImages[index];
    index++;
  }

  return rotateCat;
}
