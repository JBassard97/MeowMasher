export const storage = {
  // --- Existing getters ---
  getMewnits: () => Number(localStorage.getItem("mewnits")) || 0,
  getClickPower: () => Number(localStorage.getItem("clickPower")) || 1,
  getUpgradeOwned: (id) =>
    Number(localStorage.getItem(`upgrade_${id}_owned`)) || 0,
  getSubUpgradeOwned: (id) => localStorage.getItem(`subUpgrade_${id}_owned`),
  getUpgradeMultiplier: (id) =>
    Number(localStorage.getItem(`upgrade_${id}_multiplier`)) || 1,

  // --- Existing setters ---
  setMewnits: (value) => localStorage.setItem("mewnits", value),
  setClickPower: (value) => localStorage.setItem("clickPower", value),
  setUpgradeOwned: (id, value) =>
    localStorage.setItem(`upgrade_${id}_owned`, value),
  setSubUpgradeOwned: (id) =>
    localStorage.setItem(`subUpgrade_${id}_owned`, "true"),
  setUpgradeMultiplier: (id, value) =>
    localStorage.setItem(`upgrade_${id}_multiplier`, value),

  // --- Lifetime Mewnits ---
  getLifetimeMewnits: () =>
    Number(localStorage.getItem("lifetimeMewnits")) || 0,
  addLifetimeMewnits: (amount) => {
    const current = Number(localStorage.getItem("lifetimeMewnits")) || 0;
    localStorage.setItem("lifetimeMewnits", current + amount);
  },
  resetLifetimeMewnits: () => localStorage.setItem("lifetimeMewnits", 0),

  // --- Lifetime Clicks ---
  getLifetimeClicks: () => Number(localStorage.getItem("lifetimeClicks")) || 0,
  addLifetimeClicks: (amount = 1) => {
    const current = Number(localStorage.getItem("lifetimeClicks")) || 0;
    localStorage.setItem("lifetimeClicks", current + amount);
  },
  resetLifetimeClicks: () => localStorage.setItem("lifetimeClicks", 0),

  // --- Thousand Fingers Bonus ---
  getThousandFingersBonus: () =>
    Number(localStorage.getItem("thousandFingersBonus")) || 0,
  setThousandFingersBonus: (value) =>
    localStorage.setItem("thousandFingersBonus", value),

  // --- Lifetime Click-Generated Mewnits ---
  getLifetimeClickMewnits: () =>
    Number(localStorage.getItem("lifetimeClickMewnits")) || 0,
  addLifetimeClickMewnits: (amount) => {
    const current = Number(localStorage.getItem("lifetimeClickMewnits")) || 0;
    localStorage.setItem("lifetimeClickMewnits", current + amount);
  },
  resetLifetimeClickMewnits: () =>
    localStorage.setItem("lifetimeClickMewnits", 0),

  // --- Percent-of-MPS-to-Click bonus ---
  getPercentOfMpsClickAdder: () =>
    Number(localStorage.getItem("percentOfMpsClickAdder")) || 0,
  setPercentOfMpsClickAdder: (value) =>
    localStorage.setItem("percentOfMpsClickAdder", value),

  // --- Stored Mewnits Per Second ---
  getMewnitsPerSecond: () =>
    Number(localStorage.getItem("mewnitsPerSecond")) || 0,
  setMewnitsPerSecond: (value) =>
    localStorage.setItem("mewnitsPerSecond", value),
};
