import { storage } from "../logic/storage.js";

export function computeThousandFingers(upgrades, subUpgrades) {
  const ownedTFs = subUpgrades.filter(
    (u) => u.type === "thousandFingers" && storage.getSubUpgradeOwned(u.id)
  );

  if (!ownedTFs.length) {
    upgrades.forEach((u) => (u.extraBonus = 0));
    storage.setThousandFingersBonus(0);
    return 0;
  }

  const nonPatsOwned = upgrades
    .filter((u) => u.name !== "Pats")
    .reduce((sum, u) => sum + u.owned, 0);

  let total = nonPatsOwned;
  ownedTFs.forEach((tf) => (total *= tf.bonus));

  upgrades.forEach((u) => {
    u.extraBonus = u.name === "Pats" ? total : 0;
  });

  storage.setThousandFingersBonus(total);
  return total;
}
