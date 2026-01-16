import { storage } from "../logic/storage.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";

const boostsIcon = document.getElementById("boosts-icon");
const boostsDialog = document.getElementById("boosts-dialog");
const closeBoostsDialog = document.getElementById("close-boosts-dialog");
const boostsContainer = document.getElementById("boosts-container");

boostsIcon.addEventListener("click", () => {
  boostsDialog.classList.add("active");
  updateBiscuitsDisplay();
});
boostsDialog.addEventListener("click", (e) => {
  if (e.target === boostsDialog) {
    boostsDialog.classList.remove("active");
  }
});
closeBoostsDialog.addEventListener("click", () => {
  boostsDialog.classList.remove("active");
});

Promise.all([fetch("src/data/boosts.json").then((r) => r.json())]).then(
  ([boostData]) => {
    for (const boost of boostData) {
      const boostEl = document.createElement("div");
      boostEl.classList.add("boost-item");
      boostEl.innerHTML = `
        <p class="boost-name">${boost.name}</p>
        <p class="boost-desc">${boost.desc}</p>
        <p class="boost-price">Price: ${boost.price} Biscuits</p>
        <button class="buy-boost-button">Buy</button>
      `;
      boostsContainer.appendChild(boostEl);
    }
  }
);
