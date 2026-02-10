import { storage } from "../logic/storage.js";
import { D } from "../logic/decimalWrapper.js";

export function computeThousandFingers(upgrades, subUpgrades) {
  const ownedTFs = subUpgrades.filter(
    (u) => u.type === "thousandFingers" && storage.getSubUpgradeOwned(u.id),
  );

  if (!ownedTFs.length) {
    upgrades.forEach((u) => (u.extraBonus = D(0)));
    storage.setThousandFingersBonus(0);
    return { total: 0, bonus: 0 }; // Return regular numbers when there's no TF
  }

  // FIXED: Use Decimal for owned count
  const nonPatsOwned = upgrades
    .filter((u) => u.name !== "Pats")
    .reduce((sum, u) => sum.plus(u.owned), D(0)); // u.owned is already Decimal from storage

  let bonus = D(1); // "+n click power for every non-pats upgrade owned"

  let total = nonPatsOwned;
  ownedTFs.forEach((tf) => {
    total = total.times(tf.bonus);
    bonus = bonus.times(tf.bonus);
  });

  upgrades.forEach((u) => {
    u.extraBonus = u.name === "Pats" ? total : D(0);
  });

  storage.setThousandFingersBonus(total);

  // Return Decimals directly - caller should handle formatting
  return {
    total: total, // Keep as Decimal
    bonus: bonus, // Keep as Decimal
  };
}
