import { storage } from "./storage.js";
import { D } from "./decimalWrapper.js";

let achievementsData = null;

export const loadAchievementsData = async () => {
  achievementsData = await fetch("src/data/achievements.json").then((res) =>
    res.json().catch((err) => {
      console.error("Error parsing achievements.json:", err);
      achievementsData = [];
    }),
  );

  console.log(achievementsData);
};

export const giveSpecificAchievement = (id) => {
  console.log("giveSpecificAchievement called with ID:", id);
  if (storage.getAchievementOwned(id)) return; // Already owned

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

export const checkForAchievements = () => {
  achievementsData.forEach((a) => {
    if (!storage.getAchievementOwned(a.id)) {
      switch (a.type) {
        case "clicks":
          if (storage.getLifetimeClicks().gte(a.requirement)) {
            giveSpecificAchievement(a.id);
          }
          break;
        default:
          break;
      }
    }
  });
};

setInterval(checkForAchievements, 1000); // Check every 5 seconds
