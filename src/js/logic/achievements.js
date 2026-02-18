import { storage, getItem } from "./storage.js";
import { D } from "./decimalWrapper.js";

export const giveSpecificAchievement = async (id) => {
  console.log("giveSpecificAchievement called with ID:", id);
  if (storage.getAchievementOwned(id)) return; // Already owned

  let achievementsData = await fetch("src/data/achievements.json").then((res) =>
    res.json().catch((err) => {
      console.error("Error parsing achievements.json:", err);
      achievementsData = null;
    }),
  );

  const achievement = achievementsData.find((a) => a.id === id);
  if (!achievement) {
    console.error(`Achievement with ID ${id} not found.`);
    return;
  }

  storage.setAchievementOwned(id);
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: {
        header: "Achievement Unlocked:",
        content: achievement.name,
        desc: achievement.desc,
      },
    }),
  );
};

export const checkForAchievements = (achievements, upgrades, subUpgrades) => {
  if (!achievements || achievements.length === 0) {
    console.warn("No achievements data available to check.");
    return;
  }
  achievements.forEach((a) => {
    // Only check achievements that are not yet owned
    if (!storage.getAchievementOwned(a.id)) {
      switch (a.type) {
        case "number_of_clicks":
          if (storage.getLifetimeClicks().gte(D(a.requirement))) {
            giveSpecificAchievement(a.id);
          }
          break;
        case "number_of_upgrades":
          const ownedUpgrades = upgrades.reduce(
            (sum, u) => sum.plus(u.owned),
            D(0),
          );
          if (ownedUpgrades.gte(D(a.requirement))) {
            giveSpecificAchievement(a.id);
          }
          break;
        case "number_of_subupgrades":
          const owned = subUpgrades.filter(
            (u) => getItem(`subUpgrade_${u.id}_owned`) === "true",
          ).length;
          if (D(owned).gte(D(a.requirement))) {
            giveSpecificAchievement(a.id);
          }
          break;
        case "number_of_pauses":
          if (storage.getNumberOfPauses().gte(D(a.requirement))) {
            giveSpecificAchievement(a.id);
          }
          break;
        default:
          break;
      }
    }
  });
};
