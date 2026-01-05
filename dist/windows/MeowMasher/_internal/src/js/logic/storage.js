const isDesktop = () =>
  window.pywebview?.api !== undefined;

const waitForPyWebview = () =>
  new Promise((resolve) => {
    if (isDesktop()) return resolve();

    const interval = setInterval(() => {
      if (isDesktop()) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });

let cache = {};

/**
 * Call this once at app startup to load saved values
 */
export const initStorage = async () => {

  // Always wait briefly to see if pywebview appears
  await waitForPyWebview();

  if (isDesktop()) {
    let data = await window.pywebview.api.getAll();

    if (!data || Object.keys(data).length === 0) {
      console.warn("Desktop storage empty, retrying load...");
      await new Promise((r) => setTimeout(r, 300));
      data = await window.pywebview.api.getAll();
    }

    cache = data || {};
    alert(`Desktop storage loaded: ${JSON.stringify(cache, null, 2)}`);
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      cache[k] = localStorage.getItem(k);
    }
    alert(`Web storage loaded: ${JSON.stringify(cache, null, 2)}`);
  }
};

const getItem = (key) => cache[key] ?? null;

const setItem = (key, value) => {
  const v = String(value);
  cache[key] = v;

  if (isDesktop()) {
    // Fire-and-forget; updates Python save.json
    window.pywebview.api.setItem(key, v);
  } else {
    localStorage.setItem(key, v);
  }
};

export const storage = {
  // --- Getters ---
  getMewnits: () => Number(getItem("mewnits")) || 0,
  getClickPower: () => Number(getItem("clickPower")) || 1,
  getUpgradeOwned: (id) => Number(getItem(`upgrade_${id}_owned`)) || 0,
  getSubUpgradeOwned: (id) => getItem(`subUpgrade_${id}_owned`),
  getUpgradeMultiplier: (id) =>
    Number(getItem(`upgrade_${id}_multiplier`)) || 1,

  getLifetimeMewnits: () => Number(getItem("lifetimeMewnits")) || 0,
  getLifetimeClicks: () => Number(getItem("lifetimeClicks")) || 0,
  getThousandFingersBonus: () => Number(getItem("thousandFingersBonus")) || 0,
  getLifetimeClickMewnits: () => Number(getItem("lifetimeClickMewnits")) || 0,
  getPercentOfMpsClickAdder: () =>
    Number(getItem("percentOfMpsClickAdder")) || 0,
  getMewnitsPerSecond: () => Number(getItem("mewnitsPerSecond")) || 0,

  getIsUiFlipped: () => JSON.parse(getItem("isUiFlipped") ?? "false"),
  getIsInColorblindMode: () =>
    JSON.parse(getItem("isInColorblindMode") ?? "false"),
  getCurrentFont: () => getItem("currentFont") || "Finger Paint",
  getIsMeowAudioOn: () => JSON.parse(getItem("isMeowAudioOn") ?? "true"),
  getIsSfxAudioOn: () => JSON.parse(getItem("isSfxAudioOn") ?? "true"),
  getMeowAudioLevel: () => getItem("meowAudioLevel") || "5",
  getSfxAudioLevel: () => getItem("sfxAudioLevel") || "5",

  getAdoptedCatsNumber: () => JSON.parse(getItem("adoptedCatsAmount") || "1"),
  getLivingRoomIndex: () => Number(getItem("livingRoomIndex")) || 0,
  getNumberOfLivingRooms: () => Number(getItem("livingRoomAmount")) || 1,
  getNumberofGoldenPawClicks: () => Number(getItem("goldenPawClicks")) || 0,
  getIsInBiscuitsMode: () => JSON.parse(getItem("isInBiscuitsMode") ?? "false"),
  getBiscuits: () => Number(getItem("biscuits")) || 0,

  // --- Setters / Updaters ---
  setMewnits: (value) => setItem("mewnits", value),
  setClickPower: (value) => setItem("clickPower", value),
  setUpgradeOwned: (id, value) => setItem(`upgrade_${id}_owned`, value),
  setSubUpgradeOwned: (id) => setItem(`subUpgrade_${id}_owned`, "true"),
  setUpgradeMultiplier: (id, value) =>
    setItem(`upgrade_${id}_multiplier`, value),

  addLifetimeMewnits: (amount) => {
    const current = Number(getItem("lifetimeMewnits")) || 0;
    setItem("lifetimeMewnits", current + amount);
  },
  resetLifetimeMewnits: () => setItem("lifetimeMewnits", 0),

  addLifetimeClicks: (amount = 1) => {
    const current = Number(getItem("lifetimeClicks")) || 0;
    setItem("lifetimeClicks", current + amount);
  },
  resetLifetimeClicks: () => setItem("lifetimeClicks", 0),

  setThousandFingersBonus: (value) => setItem("thousandFingersBonus", value),

  addLifetimeClickMewnits: (amount) => {
    const current = Number(getItem("lifetimeClickMewnits")) || 0;
    setItem("lifetimeClickMewnits", current + amount);
  },
  resetLifetimeClickMewnits: () => setItem("lifetimeClickMewnits", 0),

  setPercentOfMpsClickAdder: (value) =>
    setItem("percentOfMpsClickAdder", value),
  setMewnitsPerSecond: (value) => setItem("mewnitsPerSecond", value),

  setIsUiFlipped: (value) => setItem("isUiFlipped", JSON.stringify(value)),
  setIsInColorblindMode: (value) =>
    setItem("isInColorblindMode", JSON.stringify(value)),
  setCurrentFont: (fontName) => setItem("currentFont", fontName),
  setIsMeowAudioOn: (value) => setItem("isMeowAudioOn", JSON.stringify(value)),
  setIsSfxAudioOn: (value) => setItem("isSfxAudioOn", JSON.stringify(value)),
  setMeowAudioLevel: (level) => setItem("meowAudioLevel", level),
  setSfxAudioLevel: (level) => setItem("sfxAudioLevel", level),

  initAdoptedCatsNumber: () => setItem("adoptedCatsAmount", 1),
  addAdoptedCatsNumber: () => {
    const current = JSON.parse(getItem("adoptedCatsAmount") || "1");
    setItem("adoptedCatsAmount", current + 1);
  },

  addLivingRoomIndex: () => {
    const current = Number(getItem("livingRoomIndex")) || 0;
    setItem("livingRoomIndex", current + 1);
  },
  addNumberOfLivingRooms: () => {
    const current = Number(getItem("livingRoomAmount")) || 1;
    setItem("livingRoomAmount", current + 1);
  },

  addGoldenPawClick: () => {
    const current = Number(getItem("goldenPawClicks")) || 0;
    setItem("goldenPawClicks", current + 1);
  },

  setIsInBiscuitsMode: (value) =>
    setItem("isInBiscuitsMode", JSON.stringify(value)),
  setBiscuits: (value) => setItem("biscuits", value),
};
