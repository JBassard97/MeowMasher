import { storage, getItem } from "../logic/storage.js";
import { D } from "../logic/decimalWrapper.js";

export function computeYarnBonus(subUpgrades) {
  let yarnPercent = 0;
  let yarnBonus = D(0);

  const totalSubUpgrades = subUpgrades.length;
  const owned = subUpgrades.filter(
    (u) => getItem(`subUpgrade_${u.id}_owned`) === "true",
  );

  yarnPercent = Math.floor((owned.length / totalSubUpgrades) * 100);

  // FIXED: Use Decimal operations
  const mewnitsPerSecond = storage.getMewnitsPerSecond(); // Already returns Decimal
  yarnBonus = mewnitsPerSecond.times(yarnPercent).div(100).floor();

  return { yarnBonus: yarnBonus, yarnPercent: yarnPercent };
}
