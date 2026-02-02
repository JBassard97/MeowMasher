import { storage } from "../logic/storage.js";

export function computeThousandFingers(upgrades, subUpgrades) {
  const ownedTFs = subUpgrades.filter(
    (u) => u.type === "thousandFingers" && storage.getSubUpgradeOwned(u.id),
  );

  if (!ownedTFs.length) {
    upgrades.forEach((u) => (u.extraBonus = 0));
    storage.setThousandFingersBonus(0);
    return { total: 0, bonus: 0 };
  }

  const nonPatsOwned = upgrades
    .filter((u) => u.name !== "Pats")
    .reduce((sum, u) => sum + u.owned, 0);

  let bonus = 1; // "+n click power for every non-pats upgrade owned"

  let total = nonPatsOwned;
  ownedTFs.forEach((tf) => {
    total *= tf.bonus;
    bonus *= tf.bonus;
  });

  upgrades.forEach((u) => {
    u.extraBonus = u.name === "Pats" ? total : 0;
  });

  storage.setThousandFingersBonus(total);
  return { total: total, bonus: bonus };
}
