import { storage } from "../logic/storage.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";

const clickingNavItem = document.getElementById("clicking-nav-item");
const biscuitsNavItem = document.getElementById("biscuits-nav-item");
const biscuitsArea = document.querySelector(".biscuits-area");

let selectedItem = "clicking-nav-item";

function selected(el) {
  el.style.backgroundColor = "slateblue";
  if (el == biscuitsNavItem) {
    biscuitsArea.style.display = "block";
  } else {
    biscuitsArea.style.display = "none";
  }
}

function deselected(el) {
  el.style.backgroundColor = "black";
  if (el == biscuitsNavItem) {
    biscuitsArea.style.display = "none";
  } else {
    biscuitsArea.style.display = "block";
  }
}

storage.setIsInBiscuitsMode(false);

clickingNavItem.addEventListener("click", (e) => {
  if (e.target.id === selectedItem) return;
  console.log(e.target.id);
  selected(clickingNavItem);
  deselected(biscuitsNavItem);
  selectedItem = e.target.id;
  storage.setIsInBiscuitsMode(false);
});
biscuitsNavItem.addEventListener("click", (e) => {
  if (e.target.id === selectedItem) return;
  console.log(e.target.id);
  updateBiscuitsDisplay();
  selected(biscuitsNavItem);
  deselected(clickingNavItem);
  selectedItem = e.target.id;
  storage.setIsInBiscuitsMode(true);
});

// INIT
selected(clickingNavItem);
