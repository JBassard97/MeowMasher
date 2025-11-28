export function describeSubUnlock(u, upgrades) {
  const targetUpgrade = upgrades.find((x) => x.id === u.targetUpgradeId);
  switch (u.type) {
    case "clickPowerMultiplier":
      if (u.unlockRateRequirement) {
        return `Achieve ${u.unlockRateRequirement} Mewnits/S`;
      }
    case "thousandFingers":
    case "upgradeMultiplier":
      return `Own ${u.unlockRequirement} ${targetUpgrade.name}`;
    case "clickPowerAdder":
      return `Achieve ${Number(
        u.unlockRateRequirement
      ).toLocaleString()} Mewnits/S`;
    case "percentOfMpsClickAdder":
      return `${Number(u.unlockClickedMewnitsRequirement).toLocaleString()}`;
    default:
      return "Yikes unhandled case!";
  }
}
