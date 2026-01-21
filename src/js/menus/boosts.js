import { storage } from "../logic/storage.js";
import { updateBiscuitsDisplay } from "../helpers/updateBiscuitsDisplay.js";
import { createBoostIcon } from "../helpers/createBoostIcon.js";

const boostsIcon = document.getElementById("boosts-icon");
const boostsDialog = document.getElementById("boosts-dialog");
const closeBoostsDialog = document.getElementById("close-boosts-dialog");
const boostsContainer = document.getElementById("boosts-container");

boostsIcon.addEventListener("click", () => {
  boostsDialog.classList.add("active");
  updateBiscuitsDisplay();
  renderBoosts();
});
boostsDialog.addEventListener("click", (e) => {
  if (e.target === boostsDialog) {
    boostsDialog.classList.remove("active");
  }
});
closeBoostsDialog.addEventListener("click", () => {
  boostsDialog.classList.remove("active");
});

let boostData;

fetch("src/data/boosts.json")
  .then((r) => r.json())
  .then((data) => {
    boostData = data;
  });

function renderBoosts() {
  if (!boostData) return;
  boostsContainer.innerHTML = "";

  for (const boost of boostData) {
    if (!boost["bonus-header"]) {
      const boostEl = document.createElement("div");
      boostEl.classList.add("boost-item");
      boostEl.innerHTML = `
      <div class="boost-icon-and-text">
        ${createBoostIcon(boost.type, boost.time)}
        <div class="boost-text-container">
          <p class="boost-name">${boost.name}</p>
          <p class="boost-desc">${boost.desc}</p>
        </div>
      </div>
      <div class="owned-boosts">
        <span>Owned:</span>
        <span class="owned-count">${storage.getBoostOwned(boost.id)}</span>
      </div>
        <button class="buy-boost-button" ${storage.getBiscuits() < boost.price ? "disabled" : ""}>
          <span>Buy For</span>
          <span>${boost.price.toLocaleString()}</span>
          <span>Biscuits</span>
        </button>
      `;

      boostEl
        .querySelector(".buy-boost-button")
        .addEventListener("click", () => buyBoost(boost.id));

      boostsContainer.appendChild(boostEl);
    } else {
      const headerEl = document.createElement("div");
      headerEl.classList.add("bonus-header");
      headerEl.innerHTML = `
        <h3>${boost["bonus-header"]}</h3>
        <span class="bonus-header-details">${boost["bonus-header-details"] || ""}</span>
      `;
      boostsContainer.appendChild(headerEl);
    }
  }
}

function buyBoost(boostId) {
  const boost = boostData.find((b) => b.id === boostId);
  const biscuits = storage.getBiscuits();
  if (biscuits < boost.price) return;

  storage.setBiscuits(biscuits - boost.price);
  const owned = storage.getBoostOwned(boostId);
  storage.setBoostOwned(boostId, owned + 1);

  updateBiscuitsDisplay();
  renderBoosts();
}
