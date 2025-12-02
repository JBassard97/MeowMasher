import { storage } from "./storage.js";

export function describeSubBonus(u, upgrades) {
  const t = upgrades.find((x) => x.id === u.targetUpgradeId);
  switch (u.type) {
    case "clickPowerAdder":
      return `+${u.bonus} Base Click Power`;
    case "clickPowerMultiplier":
      if (u.alsoUpgradeMultiplier && t) {
        return `${u.bonus}× Base Click Power & ${u.bonus}× ${t.name}`;
      }
      return `${u.bonus}× Base Click Power`;
    case "upgradeMultiplier":
      return `${u.bonus}x ${t?.name || "Upgrade"}`;
    case "thousandFingers":
      return u.name !== "Thousand Pats"
        ? `${u.bonus}x Thousand Pats Bonus`
        : `+1 Click Power & +1 Pats Per Non-Pats Upgrade`;
    case "percentOfMpsClickAdder":
      return `+${u.bonus}% of Mew/S added to Click Power`;
    case "livingRoom":
      return `It's time to move${u.id !== 400000 ? " again" : ""}!`;
    case "catAdopt":
      return "Every cat deserves a home";
    default:
      return "Oops case not handled in describeSubBonus.js";
  }
}
