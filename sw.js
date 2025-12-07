const CACHE_NAME = "meow-masher-v1";

const catImages = Array.from(
  { length: 23 },
  (_, i) => `/MeowMasher/src/assets/images/clickable-cats/${i}.png`
);

const livingRoomImages = Array.from(
  { length: 4 },
  (_, i) => `/MeowMasher/src/assets/images/living-rooms/${i}.jpg`
);

const upgradeImages = [
  "/MeowMasher/src/assets/images/upgrades/box.png",
  "/MeowMasher/src/assets/images/upgrades/catbed.png",
  "/MeowMasher/src/assets/images/upgrades/catio.png",
  "/MeowMasher/src/assets/images/upgrades/catnip.png",
  "/MeowMasher/src/assets/images/upgrades/cattree.png",
  "/MeowMasher/src/assets/images/upgrades/churu.png",
  "/MeowMasher/src/assets/images/upgrades/crinkleballs.png",
  "/MeowMasher/src/assets/images/upgrades/drycatfood.png",
  "/MeowMasher/src/assets/images/upgrades/humanbed.png",
  "/MeowMasher/src/assets/images/upgrades/laserpointer.png",
  "/MeowMasher/src/assets/images/upgrades/litterbox.png",
  "/MeowMasher/src/assets/images/upgrades/mousetoy.png",
  "/MeowMasher/src/assets/images/upgrades/paperbag.png",
  "/MeowMasher/src/assets/images/upgrades/pats.png",
  "/MeowMasher/src/assets/images/upgrades/robot.png",
  "/MeowMasher/src/assets/images/upgrades/scratchingpost.png",
  "/MeowMasher/src/assets/images/upgrades/wandtoy.png",
  "/MeowMasher/src/assets/images/upgrades/waterbowl.png",
  "/MeowMasher/src/assets/images/upgrades/waterfountain.png",
  "/MeowMasher/src/assets/images/upgrades/wetcatfood.png",
];

const ASSETS_TO_CACHE = [
  "MeowMasher/",
  "MeowMasher/index.html",
  "MeowMasher/package.json",
  "MeowMasher/src/css/style.css",
  "MeowMasher/src/js/main.js",
  "MeowMasher/site.webmanifest",
  "MeowMasher/web-app-manifest-192x192.png",
  "MeowMasher/web-app-manifest-512x512.png",
  ...catImages,
  ...livingRoomImages,
  ...upgradeImages,
  "MeowMasher/src/assets/images/goldenPawprint.svg",
  "MeowMasher/src/assets/images/calico.png",
  "MeowMasher/src/assets/images/neonleopard.jpg",
  "MeowMasher/src/assets/images/neonstripes.jpg",
  "MeowMasher/src/assets/fonts/FingerPaint-Regular.ttf",
  "MeowMasher/src/assets/sounds/mouseclick.mp3",
  "MeowMasher/src/assets/sounds/gary_meow.mp3",
  "MeowMasher/src/assets/sounds/mario-meow.mp3",
  "MeowMasher/src/assets/sounds/meow_1.mp3",
  "MeowMasher/src/data/upgrades.json",
  "MeowMasher/src/data/subUpgrades.json",
  "MeowMasher/src/js/audio/audio.js",
  "MeowMasher/src/js/bonuses/thousandFingers.js",
  "MeowMasher/src/js/effects/animateCounter.js",
  "MeowMasher/src/js/effects/catRotation.js",
  "MeowMasher/src/js/effects/clickPopup.js",
  "MeowMasher/src/js/effects/goldenPawMode.js",
  "MeowMasher/src/js/effects/setLivingRoom.js",
  "MeowMasher/src/js/effects/upgradeStyles.js",
  "MeowMasher/src/js/golden/goldenPawprint.js",
  "MeowMasher/src/js/logic/chooseWeighted.js",
  "MeowMasher/src/js/logic/storage.js",
  "MeowMasher/src/js/logic/handleClick.js",
  "MeowMasher/src/js/logic/describeSubBonus.js",
  "MeowMasher/src/js/logic/describeSubUnlock.js",
  "MeowMasher/src/js/menus/achievements.js",
  "MeowMasher/src/js/menus/settings.js",
  "MeowMasher/src/js/menus/stats.js",
];

// ---------------------------
// INSTALL & UPDATE – cache everything
// ---------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // activate immediately
  console.log("Service Worker installed");
});

self.addEventListener("activate", (event) => {
  // Remove any old caches if they exist (in case you change CACHE_NAME later)
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("Deleting old cache:", key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
  console.log("Service Worker activated");
});

// ---------------------------
// FETCH – offline support
// ---------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache full responses
            if (networkResponse.ok && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // fallback if offline

        // Return cached immediately if exists, else wait for network
        return cachedResponse || fetchPromise;
      })
    )
  );
});
