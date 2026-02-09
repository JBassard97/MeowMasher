import { storage } from "../logic/storage.js";
import { createBoostIcon } from "../helpers/createBoostIcon.js";
import { $ } from "../helpers/$.js";
import { isPaused } from "../helpers/isPaused.js";
import { D } from "../logic/decimalWrapper.js";

const useBoostsIcon = $("#use-boosts-icon");
const useBoostsDialog = $("#use-boosts-dialog");
const closeUseBoostsDialog = $("#close-use-boosts-dialog");
const useBoostsContainer = $("#use-boosts-container");

useBoostsIcon.addEventListener("click", () => {
  if (isPaused) return;
  useBoostsDialog.classList.add("active");
  renderBoosts();
});
useBoostsDialog.addEventListener("click", (e) => {
  if (e.target === useBoostsDialog) {
    useBoostsDialog.classList.remove("active");
  }
});
closeUseBoostsDialog.addEventListener("click", () => {
  useBoostsDialog.classList.remove("active");
});

let boostData;

fetch("src/data/boosts.json")
  .then((r) => r.json())
  .then((data) => {
    boostData = data;
  });

function renderBoosts() {
  if (!boostData) return;
  useBoostsContainer.innerHTML = "";

  for (const boost of boostData) {
    if (!boost["bonus-header"]) {
      const useBoostEl = document.createElement("div");
      useBoostEl.classList.add("boost-item");

      const owned = storage.getBoostOwned(boost.id); // Decimal-safe

      useBoostEl.innerHTML = `
      <div class="boost-icon-and-text">
        ${createBoostIcon(boost.type, boost.time)}
        <div class="boost-text-container">
          <p class="boost-name">${boost.name}</p>
          <p class="boost-desc">${boost.desc}</p>
        </div>
      </div>
      <div class="owned-boosts">
        <span>Owned:</span>
        <span class="owned-count">${owned.toString()}</span>
      </div>
        <button class="use-boost-button" ${owned.lt(1) ? "disabled" : ""}>
          Use!
        </button>
      `;

      useBoostEl
        .querySelector(".use-boost-button")
        .addEventListener("click", () => useBoost(boost.id));

      useBoostsContainer.appendChild(useBoostEl);
    } else {
      const headerEl = document.createElement("div");
      headerEl.classList.add("bonus-header");
      headerEl.innerHTML = `
        <h3>${boost["bonus-header"]}</h3>
        <span class="bonus-header-details">${boost["bonus-header-details"] || ""}</span>
      `;
      useBoostsContainer.appendChild(headerEl);
    }
  }
}

function useBoost(boostId) {
  const owned = storage.getBoostOwned(boostId); // Decimal-safe
  if (owned.lt(1)) return;

  const boost = boostData.find((b) => b.id === boostId);
  if (!boost) return;

  window.dispatchEvent(new CustomEvent("boostUsed", { detail: boost }));

  useBoostsDialog.classList.remove("active");
  storage.setBoostOwned(boostId, owned.minus(1)); // Decimal-safe subtraction
  renderBoosts();
}
