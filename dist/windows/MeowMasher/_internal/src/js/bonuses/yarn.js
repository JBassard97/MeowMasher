import { storage, getItem } from "../logic/storage.js";
import { D } from "../logic/decimalWrapper.js";

export function computeYarnBonus(subUpgrades, achievements) {
  let yarnPercent = 0;
  let yarnBonus = D(0);

  const ownedSubUpgrades = subUpgrades.filter(
    (u) => getItem(`subUpgrade_${u.id}_owned`) === "true",
  );

  const ownedAchievements = achievements.filter(
    (a) => getItem(`achievement_${a.id}_owned`) === "true",
  );

  const totalItems = subUpgrades.length + achievements.length;
  const ownedItems = ownedSubUpgrades.length + ownedAchievements.length;

  if (totalItems > 0) {
    yarnPercent = Math.floor((ownedItems / totalItems) * 100);
  }

  const mewnitsPerSecond = storage.getMewnitsPerSecond();
  yarnBonus = mewnitsPerSecond.times(yarnPercent).div(100).floor();

  return { yarnBonus, yarnPercent };
}
