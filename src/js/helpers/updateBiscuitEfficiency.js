import { storage } from "../logic/storage.js";

export function updateBiscuitEfficiency() {
  const biscuitEfficiencyDisplay = document.getElementById("efficiency-number");
  const efficiency = storage.getBiscuitEfficiency();
  biscuitEfficiencyDisplay.textContent = efficiency.toLocaleString();
}
