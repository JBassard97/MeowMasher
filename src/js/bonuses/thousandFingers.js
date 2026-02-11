import { storage } from "../logic/storage.js";
import { D } from "../logic/decimalWrapper.js";

export function computeThousandFingers(upgrades, subUpgrades) {
  const ownedTFs = subUpgrades.filter(
    (u) => u.type === "thousandFingers" && storage.getSubUpgradeOwned(u.id),
  );

  if (!ownedTFs.length) {
    storage.setThousandFingersBonus(D(0));
    return { total: D(0), bonus: D(0), patsBonus: D(0) };
  }

  const nonPatsOwned = upgrades
    .filter((u) => u.name !== "Pats")
    .reduce((sum, u) => sum.plus(u.owned), D(0));

  let bonus = D(1);
  let total = nonPatsOwned;

  ownedTFs.forEach((tf) => {
    total = total.times(tf.bonus);
    bonus = bonus.times(tf.bonus);
  });

  storage.setThousandFingersBonus(total);

  // Return values - don't modify upgrade objects here
  return {
    total: total, // For click power
    bonus: bonus, // For display
    patsBonus: total, // For Pats MPS bonus
  };
}
