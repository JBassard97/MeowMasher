import { storage, getItem } from "../logic/storage.js";

export function computeYarnBonus(subUpgrades) {
  let yarnPercent = 0;
  let yarnBonus = 0;

  const totalSubUpgrades = subUpgrades.length;
  const owned = subUpgrades.filter(
    (u) => getItem(`subUpgrade_${u.id}_owned`) === "true"
  );
  yarnPercent = Math.floor((owned.length / totalSubUpgrades) * 100);
  yarnBonus = Math.floor((yarnPercent / 100) * storage.getMewnitsPerSecond());
  return { yarnBonus: yarnBonus, yarnPercent: yarnPercent };
}
