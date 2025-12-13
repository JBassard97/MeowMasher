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

  // --- Settings Dialogue ---
  getIsUiFlipped: () =>
    JSON.parse(localStorage.getItem("isUiFlipped") ?? "false"),
  setIsUiFlipped: (value) =>
    localStorage.setItem("isUiFlipped", JSON.stringify(value)),
  getIsInColorblindMode: () =>
    JSON.parse(localStorage.getItem("isInColorblindMode") ?? "false"),
  setIsInColorblindMode: (value) =>
    localStorage.setItem("isInColorblindMode", JSON.stringify(value)),
  getCurrentFont: () => localStorage.getItem("currentFont") || "Finger Paint",
  setCurrentFont: (fontName) => localStorage.setItem("currentFont", fontName),
  // ? Still in settings: SFX and Meow audio levels
  getIsMeowAudioOn: () =>
    JSON.parse(localStorage.getItem("isMeowAudioOn") ?? "true"),
  setIsMeowAudioOn: (value) =>
    localStorage.setItem("isMeowAudioOn", JSON.stringify(value)),
  getIsSfxAudioOn: () =>
    JSON.parse(localStorage.getItem("isSfxAudioOn") ?? "true"),
  setIsSfxAudioOn: (value) =>
    localStorage.setItem("isSfxAudioOn", JSON.stringify(value)),
  getMeowAudioLevel: () => localStorage.getItem("meowAudioLevel") || "5",
  setMeowAudioLevel: (level) => localStorage.setItem("meowAudioLevel", level),
  getSfxAudioLevel: () => localStorage.getItem("sfxAudioLevel") || "5",
  setSfxAudioLevel: (level) => localStorage.setItem("sfxAudioLevel", level),

  // --- Cat Unlocking ---
  getAdoptedCatsNumber: () =>
    JSON.parse(localStorage.getItem("adoptedCatsAmount")) || 1,
  initAdoptedCatsNumber: () => localStorage.setItem("adoptedCatsAmount", 1),
  addAdoptedCatsNumber: () => {
    const current = JSON.parse(localStorage.getItem("adoptedCatsAmount")) || 1;
    localStorage.setItem("adoptedCatsAmount", JSON.stringify(current + 1));
  },

  // --- Living Rooms ---
  getLivingRoomIndex: () =>
    Number(localStorage.getItem("livingRoomIndex")) || 0,
  addLivingRoomIndex: () => {
    const currentIndex = Number(localStorage.getItem("livingRoomIndex")) || 0;
    localStorage.setItem("livingRoomIndex", String(currentIndex + 1));
  },

  getNumberOfLivingRooms: () =>
    Number(localStorage.getItem("livingRoomAmount")) || 1,
  addNumberOfLivingRooms: () => {
    const currentNumber = Number(localStorage.getItem("livingRoomAmount")) || 1;
    localStorage.setItem("livingRoomAmount", String(currentNumber + 1));
  },

  // --- Golden Pawprint ---
  getNumberofGoldenPawClicks: () =>
    Number(localStorage.getItem("goldenPawClicks")) || 0,
  addGoldenPawClick: () => {
    const current = Number(localStorage.getItem("goldenPawClicks")) || 0;
    localStorage.setItem("goldenPawClicks", String(current + 1));
  },
};
