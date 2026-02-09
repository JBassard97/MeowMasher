import { storage } from "../logic/storage.js";
const header = document.querySelector(".image-header");
const imageHeaderTargets = document.querySelectorAll(".image-header-target");

const images = [
  "src/assets/images/neonleopard.jpg",
  "src/assets/images/tigerstripes.jpg",
  "src/assets/images/legopattern.jpg",
  "src/assets/images/waves.gif",
];

let index = 0;

header.style.backgroundImage = `url(${images[index]})`;
for (const target of imageHeaderTargets) {
  target.style.backgroundImage = `url(${images[index]})`;
}

function changeHeaderImage() {
  if (index + 1 < images.length) {
    index += 1;
  } else {
    index = 0;
  }
  header.style.backgroundImage = `url(${images[index]})`;
  for (const target of imageHeaderTargets) {
    target.style.backgroundImage = `url(${images[index]})`;
  }

  // Dev Easter Egg
  if (index === 3) {
    storage.setBoostOwned(0, 5);
    storage.setBiscuits(5000);
  }
}

header.addEventListener("click", changeHeaderImage);
