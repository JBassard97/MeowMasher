// Wait for pywebview to be injected
const waitForPywebview = (maxWait = 3000) => {
  return new Promise((resolve) => {
    if (window.pywebview?.api) {
      console.log("pywebview already present");
      return resolve(true);
    }

    const onReady = () => {
      console.log("pywebviewready event received");
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      window.removeEventListener("pywebviewready", onReady);
      clearTimeout(timeoutId);
    };

    window.addEventListener("pywebviewready", onReady);

    const timeoutId = setTimeout(() => {
      console.log("pywebview not found after waiting");
      cleanup();
      resolve(false);
    }, maxWait);
  });
};

let _isDesktop = null;

export const isDesktop = () => _isDesktop === true;

let desktopCache = null;

export const initStorage = async () => {
  console.log("Waiting for pywebview...");

  _isDesktop = await waitForPywebview();

  if (_isDesktop) {
    try {
      desktopCache = await window.pywebview.api.getAll();
      console.log("Desktop mode detected, cache loaded:", desktopCache);
    } catch (error) {
      console.error("Failed to load desktop cache:", error);
      _isDesktop = false;
    }
  }

  document.querySelector(".loading-spinner").style.display = "none";
  console.log(isDesktop() ? "DESKTOP MODE" : "WEB MODE");
};

export const getItem = (key) => {
  if (isDesktop()) return desktopCache?.[key] ?? null;
  return localStorage.getItem(key);
};

const setItem = (key, value) => {
  const v = String(value);
  if (isDesktop()) {
    desktopCache = desktopCache || {};
    desktopCache[key] = v;
    window.pywebview.api.setItem(key, v);
  } else {
    localStorage.setItem(key, v);
  }
};

export const clearAll = () => {
  if (isDesktop()) {
    window.pywebview.api.clearAll();
    desktopCache = {};
  } else {
    localStorage.clear();
  }
};

export const storage = {
  // --- Existing getters ---
  getMewnits: () => Number(getItem("mewnits")) || 0,
  getClickPower: () => Number(getItem("clickPower")) || 1,
  getUpgradeOwned: (id) => Number(getItem(`upgrade_${id}_owned`)) || 0,
  getSubUpgradeOwned: (id) => getItem(`subUpgrade_${id}_owned`),
  getUpgradeMultiplier: (id) =>
    Number(getItem(`upgrade_${id}_multiplier`)) || 1,

  // --- Existing setters ---
  setMewnits: (value) => setItem("mewnits", value),
  setClickPower: (value) => setItem("clickPower", value),
  setUpgradeOwned: (id, value) => setItem(`upgrade_${id}_owned`, value),
  setSubUpgradeOwned: (id) => setItem(`subUpgrade_${id}_owned`, "true"),
  setUpgradeMultiplier: (id, value) =>
    setItem(`upgrade_${id}_multiplier`, value),

  // --- Boosts ---
  getBoostOwned: (id) => Number(getItem(`boost_${id}_owned`)) || 0,
  setBoostOwned: (id, value) => setItem(`boost_${id}_owned`, value),

  // --- Stored Mewnits Per Second ---
  getMewnitsPerSecond: () => Number(getItem("mewnitsPerSecond")) || 0,
  setMewnitsPerSecond: (value) => setItem("mewnitsPerSecond", value),

  // --- Lifetime Mewnits ---
  getLifetimeMewnits: () => Number(getItem("lifetimeMewnits")) || 0,
  addLifetimeMewnits: (amount) => {
    const current = Number(getItem("lifetimeMewnits")) || 0;
    setItem("lifetimeMewnits", current + amount);
  },
  resetLifetimeMewnits: () => setItem("lifetimeMewnits", 0),

  // --- Lifetime Clicks ---
  getLifetimeClicks: () => Number(getItem("lifetimeClicks")) || 0,
  addLifetimeClicks: (amount = 1) => {
    const current = Number(getItem("lifetimeClicks")) || 0;
    setItem("lifetimeClicks", current + amount);
  },
  resetLifetimeClicks: () => setItem("lifetimeClicks", 0),

  // --- Lifetime Click-Generated Mewnits ---
  getLifetimeClickMewnits: () => Number(getItem("lifetimeClickMewnits")) || 0,
  addLifetimeClickMewnits: (amount) => {
    const current = Number(getItem("lifetimeClickMewnits")) || 0;
    setItem("lifetimeClickMewnits", current + amount);
  },
  resetLifetimeClickMewnits: () => setItem("lifetimeClickMewnits", 0),

  // --- Thousand Fingers Bonus ---
  getThousandFingersBonus: () => Number(getItem("thousandFingersBonus")) || 0,
  setThousandFingersBonus: (value) => setItem("thousandFingersBonus", value),

  // --- Percent-of-MPS-to-Click bonus ---
  getPercentOfMpsClickAdder: () =>
    Number(getItem("percentOfMpsClickAdder")) || 0,
  setPercentOfMpsClickAdder: (value) =>
    setItem("percentOfMpsClickAdder", value),

  // --- Settings ---
  getIsUiFlipped: () => JSON.parse(getItem("isUiFlipped") ?? "false"),
  setIsUiFlipped: (value) => setItem("isUiFlipped", JSON.stringify(value)),
  getIsInColorblindMode: () =>
    JSON.parse(getItem("isInColorblindMode") ?? "false"),
  setIsInColorblindMode: (value) =>
    setItem("isInColorblindMode", JSON.stringify(value)),

  getCurrentFont: () => getItem("currentFont") || "Finger Paint",
  setCurrentFont: (fontName) => setItem("currentFont", fontName),

  getIsMeowAudioOn: () => JSON.parse(getItem("isMeowAudioOn") ?? "true"),
  setIsMeowAudioOn: (value) => setItem("isMeowAudioOn", JSON.stringify(value)),

  getIsSfxAudioOn: () => JSON.parse(getItem("isSfxAudioOn") ?? "true"),
  setIsSfxAudioOn: (value) => setItem("isSfxAudioOn", JSON.stringify(value)),

  getMeowAudioLevel: () => getItem("meowAudioLevel") || "5",
  setMeowAudioLevel: (level) => setItem("meowAudioLevel", level),

  getSfxAudioLevel: () => getItem("sfxAudioLevel") || "5",
  setSfxAudioLevel: (level) => setItem("sfxAudioLevel", level),

  // --- Golden Pawprint ---
  getNumberofGoldenPawClicks: () => Number(getItem("goldenPawClicks")) || 0,
  addGoldenPawClick: () => {
    const current = Number(getItem("goldenPawClicks")) || 0;
    setItem("goldenPawClicks", String(current + 1));
  },

  // --- Cat Unlocking ---
  getAdoptedCatsNumber: () => JSON.parse(getItem("adoptedCatsAmount")) || 1,
  initAdoptedCatsNumber: () => setItem("adoptedCatsAmount", 1),
  addAdoptedCatsNumber: () => {
    const current = JSON.parse(getItem("adoptedCatsAmount")) || 1;
    setItem("adoptedCatsAmount", JSON.stringify(current + 1));
  },

  // --- Living Rooms ---
  getLivingRoomIndex: () => Number(getItem("livingRoomIndex")) || 0,
  addLivingRoomIndex: () => {
    const currentIndex = Number(getItem("livingRoomIndex")) || 0;
    setItem("livingRoomIndex", String(currentIndex + 1));
  },
  getNumberOfLivingRooms: () => Number(getItem("livingRoomAmount")) || 1,
  addNumberOfLivingRooms: () => {
    const currentNumber = Number(getItem("livingRoomAmount")) || 1;
    setItem("livingRoomAmount", String(currentNumber + 1));
  },

  // --- Biscuits ---
  getIsInBiscuitsMode: () => JSON.parse(getItem("isInBiscuitsMode") ?? "false"),
  setIsInBiscuitsMode: (value) =>
    setItem("isInBiscuitsMode", JSON.stringify(value)),
  getBiscuits: () => Number(getItem("biscuits")) || 0,
  setBiscuits: (value) => setItem("biscuits", value),
  getBaseBiscuitEfficiency: () => Number(getItem("baseBiscuitEfficiency")) || 1,
  setBaseBiscuitEfficiency: (value) => setItem("baseBiscuitEfficiency", value),
  getBiscuitEfficiency: () => Number(getItem("biscuitEfficiency")) || 1,
  setBiscuitEfficiency: (value) => setItem("biscuitEfficiency", value),
};
