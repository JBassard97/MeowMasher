export function describeSub(u, upgrades) {
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
    default:
      return "";
  }
}
