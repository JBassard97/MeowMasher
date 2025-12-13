const header = document.querySelector(".image-header");
const imageHeaderTargets = document.querySelectorAll(".image-header-target");

const images = [
  "src/assets/images/neonleopard.jpg",
  "src/assets/images/tigerstripes.jpg",
  "src/assets/images/legopattern.jpg",
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
}

header.addEventListener("click", changeHeaderImage);
