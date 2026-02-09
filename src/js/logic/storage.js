import { D } from "../logic/decimalWrapper.js";

// Wait for pywebview to be injected
const waitForPywebview = (maxWait = 2000) => {
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
  const $ = (sel) => document.querySelector(sel);
  const deskOrWebDisplay = $("#desktop-or-web-display");
  deskOrWebDisplay.textContent = isDesktop() ? "(Desktop)" : "(Web)";
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
  // --- ALL NUMERIC GETTERS NOW RETURN DECIMALS ---
  getMewnits: () => D(getItem("mewnits") || "0"),
  getClickPower: () => D(getItem("clickPower") || "1"),
  getUpgradeMultiplier: (id) => D(getItem(`upgrade_${id}_multiplier`) || "1"),
  getMewnitsPerSecond: () => D(getItem("mewnitsPerSecond") || "0"),
  getLifetimeMewnits: () => D(getItem("lifetimeMewnits") || "0"),
  getLifetimeClickMewnits: () => D(getItem("lifetimeClickMewnits") || "0"),
  getUpgradeOwned: (id) => D(getItem(`upgrade_${id}_owned`) || "0"),
  getLifetimeClicks: () => D(getItem("lifetimeClicks") || "0"),
  getBoostOwned: (id) => D(getItem(`boost_${id}_owned`) || "0"),
  getThousandFingersBonus: () => D(getItem("thousandFingersBonus") || "0"),
  getAdoptedCatsNumber: () => D(getItem("adoptedCatsAmount") || "1"),
  getLivingRoomIndex: () => D(getItem("livingRoomIndex") || "0"),
  getNumberOfLivingRooms: () => D(getItem("livingRoomAmount") || "1"),
  getBiscuits: () => D(getItem("biscuits") || "0"),
  getBaseBiscuitEfficiency: () => D(getItem("baseBiscuitEfficiency") || "1"),
  getBiscuitEfficiency: () => D(getItem("biscuitEfficiency") || "1"),
  getLifetimeBiscuits: () => D(getItem("lifetimeBiscuits") || "0"),
  getNumberofGoldenPawClicks: () => D(getItem("goldenPawClicks") || "0"),
  getNumberOfPauses: () => D(getItem("numOfPauses") || "0"),
  getTimeSpentPaused: () => D(getItem("timeSpentPaused") || "0"),
  getGameStartTimeMs: () => {
    let t = getItem("gameStartTime");
    if (!t) {
      t = Date.now();
      setItem("gameStartTime", t);
    }
    return D(t);
  },

  // --- STRING/BOOLEAN GETTERS (non-numeric) ---
  getSubUpgradeOwned: (id) => getItem(`subUpgrade_${id}_owned`),
  getPercentOfMpsClickAdder: () =>
    Number(getItem("percentOfMpsClickAdder")) || 0, // Keep as number - it's a small percentage
  getIsUiFlipped: () => JSON.parse(getItem("isUiFlipped") ?? "false"),
  getIsInColorblindMode: () =>
    JSON.parse(getItem("isInColorblindMode") ?? "false"),
  getCurrentFont: () => getItem("currentFont") || "Finger Paint",
  getIsMeowAudioOn: () => JSON.parse(getItem("isMeowAudioOn") ?? "true"),
  getIsSfxAudioOn: () => JSON.parse(getItem("isSfxAudioOn") ?? "true"),
  getMeowAudioLevel: () => getItem("meowAudioLevel") || "5",
  getSfxAudioLevel: () => getItem("sfxAudioLevel") || "5",
  getIsInBiscuitsMode: () => JSON.parse(getItem("isInBiscuitsMode") ?? "false"),
  getNumberFormat: () => getItem("numberFormat") || "suffix",

  // --- BIG NUMBER SETTERS (accept strings or Decimals) ---
  setMewnits: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("mewnits", v);
  },
  setClickPower: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("clickPower", v);
  },
  setUpgradeMultiplier: (id, value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem(`upgrade_${id}_multiplier`, v);
  },
  setMewnitsPerSecond: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("mewnitsPerSecond", v);
  },

  // --- NUMERIC SETTERS (accept Decimals or numbers) ---
  setUpgradeOwned: (id, value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem(`upgrade_${id}_owned`, v);
  },
  setSubUpgradeOwned: (id) => setItem(`subUpgrade_${id}_owned`, "true"),
  setBoostOwned: (id, value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem(`boost_${id}_owned`, v);
  },

  // --- Lifetime Mewnits (Decimal-safe) ---
  addLifetimeMewnits: (amount) => {
    const current = D(getItem("lifetimeMewnits") || "0");
    const amountD =
      typeof amount === "object" && amount.plus ? amount : D(amount);
    const newValue = current.plus(amountD);
    setItem("lifetimeMewnits", newValue.toString());
  },
  resetLifetimeMewnits: () => setItem("lifetimeMewnits", "0"),

  // --- Lifetime Clicks (Decimal-safe) ---
  addLifetimeClicks: (amount = 1) => {
    const current = D(getItem("lifetimeClicks") || "0");
    const amountD = D(amount);
    const newValue = current.plus(amountD);
    setItem("lifetimeClicks", newValue.toString());
  },
  resetLifetimeClicks: () => setItem("lifetimeClicks", "0"),

  // --- Lifetime Click-Generated Mewnits (Decimal-safe) ---
  addLifetimeClickMewnits: (amount) => {
    const current = D(getItem("lifetimeClickMewnits") || "0");
    const amountD =
      typeof amount === "object" && amount.plus ? amount : D(amount);
    const newValue = current.plus(amountD);
    setItem("lifetimeClickMewnits", newValue.toString());
  },
  resetLifetimeClickMewnits: () => setItem("lifetimeClickMewnits", "0"),

  // --- Thousand Fingers Bonus ---
  setThousandFingersBonus: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("thousandFingersBonus", v);
  },

  // --- Percent-of-MPS-to-Click bonus ---
  setPercentOfMpsClickAdder: (value) =>
    setItem("percentOfMpsClickAdder", value),

  // --- Settings ---
  setIsUiFlipped: (value) => setItem("isUiFlipped", JSON.stringify(value)),
  setIsInColorblindMode: (value) =>
    setItem("isInColorblindMode", JSON.stringify(value)),
  setCurrentFont: (fontName) => setItem("currentFont", fontName),
  setIsMeowAudioOn: (value) => setItem("isMeowAudioOn", JSON.stringify(value)),
  setIsSfxAudioOn: (value) => setItem("isSfxAudioOn", JSON.stringify(value)),
  setMeowAudioLevel: (level) => setItem("meowAudioLevel", level),
  setSfxAudioLevel: (level) => setItem("sfxAudioLevel", level),

  // --- Golden Pawprint ---
  addGoldenPawClick: () => {
    const current = D(getItem("goldenPawClicks") || "0");
    const newValue = current.plus(1);
    setItem("goldenPawClicks", newValue.toString());
  },

  // --- Cat Unlocking ---
  initAdoptedCatsNumber: () => setItem("adoptedCatsAmount", "1"),
  addAdoptedCatsNumber: () => {
    const current = D(getItem("adoptedCatsAmount") || "1");
    const newValue = current.plus(1);
    setItem("adoptedCatsAmount", newValue.toString());
  },

  // --- Living Rooms ---
  addLivingRoomIndex: () => {
    const current = D(getItem("livingRoomIndex") || "0");
    const newValue = current.plus(1);
    setItem("livingRoomIndex", newValue.toString());
  },
  addNumberOfLivingRooms: () => {
    const current = D(getItem("livingRoomAmount") || "1");
    const newValue = current.plus(1);
    setItem("livingRoomAmount", newValue.toString());
  },

  // --- Biscuits ---
  setIsInBiscuitsMode: (value) =>
    setItem("isInBiscuitsMode", JSON.stringify(value)),
  setBiscuits: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("biscuits", v);
  },
  setBaseBiscuitEfficiency: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("baseBiscuitEfficiency", v);
  },
  setBiscuitEfficiency: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("biscuitEfficiency", v);
  },
  setLifetimeBiscuits: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("lifetimeBiscuits", v);
  },

  // --- Pause ---
  setNumberOfPauses: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("numOfPauses", v);
  },
  setTimeSpentPaused: (value) => {
    const v =
      typeof value === "object" && value.toString
        ? value.toString()
        : String(value);
    setItem("timeSpentPaused", v);
  },
  getTotalPauseTimeFormatted: () => {
    const ms = D(getItem("timeSpentPaused") || "0");
    const totalSeconds = ms.div(1000).floor().toNumber();

    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400);

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    if (minutes || hours || days) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  },

  // --- Game Age ---
  getGameStartTimeFormatted: () => {
    const startTime = D(getItem("gameStartTime") || String(Date.now()));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(startTime.toNumber()));
  },
  setGameStartTime: () => setItem("gameStartTime", Date.now()),
  getTotalPlayTimeMs: () => {
    const startTime = D(getItem("gameStartTime") || String(Date.now()));
    return D(Date.now()).minus(startTime);
  },
  getTotalPlayTimeFormatted: () => {
    const ms = storage.getTotalPlayTimeMs();
    const totalSeconds = ms.div(1000).floor().toNumber();

    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / 86400);

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    if (minutes || hours || days) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  },

  // --- Number Format ---
  setNumberFormat: (format) => setItem("numberFormat", format),
};
