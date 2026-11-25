import { storage } from "../logic/storage.js";
import { formatNumber } from "./formatNumber.js";

export function updateBiscuitEfficiency() {
  const biscuitEfficiencyDisplay = document.getElementById("efficiency-number");
  const efficiency = storage.getBiscuitEfficiency();
  biscuitEfficiencyDisplay.textContent = formatNumber(efficiency);
}
