export function describeSubUnlock(u, upgrades) {
  const targetUpgrade = upgrades.find((x) => x.id === u.targetUpgradeId);
  switch (u.type) {
    case "clickPowerMultiplier":
    case "catAdopt":
      if (u.unlockRateRequirement) {
        return `Achieve ${Number(
          u.unlockRateRequirement
        ).toLocaleString()} Mewnits/S`;
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
    case "livingRoom":
      return `Adopt ${Number(u.adoptedCatsRequirement).toLocaleString()} Cats`;
    default:
      return "Yikes unhandled case in describeSubUnlock.js";
  }
}
