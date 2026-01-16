import { storage } from "../logic/storage.js";

const mainBiscuitDisplay = document.getElementById("biscuits-number");
const levelsBiscuitDisplay = document.getElementById("levels-current-biscuits");
const boostsBiscuitDisplay = document.getElementById("boosts-current-biscuits");

export const updateBiscuitsDisplay = () => {
  for (const display of [
    mainBiscuitDisplay,
    levelsBiscuitDisplay,
    boostsBiscuitDisplay,
  ]) {
    display.textContent = storage.getBiscuits().toLocaleString();
  }
};
