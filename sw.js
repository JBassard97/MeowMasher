const CACHE_NAME = "meow-masher-v1";

const catImages = Array.from(
  { length: 23 },
  (_, i) => `/src/assets/images/clickable-cats/${i}.png`
);

const livingRoomImages = Array.from(
  { length: 4 },
  (_, i) => `/src/assets/images/living-rooms/${i}.jpg`
);

const upgradeImages = [
  "/src/assets/images/upgrades/box.png",
  "/src/assets/images/upgrades/catbed.png",
  "/src/assets/images/upgrades/catio.png",
  "/src/assets/images/upgrades/catnip.png",
  "/src/assets/images/upgrades/cattree.png",
  "/src/assets/images/upgrades/churu.png",
  "/src/assets/images/upgrades/crinkleballs.png",
  "/src/assets/images/upgrades/drycatfood.png",
  "/src/assets/images/upgrades/humanbed.png",
  "/src/assets/images/upgrades/laserpointer.png",
  "/src/assets/images/upgrades/litterbox.png",
  "/src/assets/images/upgrades/mousetoy.png",
  "/src/assets/images/upgrades/paperbag.png",
  "/src/assets/images/upgrades/pats.png",
  "/src/assets/images/upgrades/robot.png",
  "/src/assets/images/upgrades/scratchingpost.png",
  "/src/assets/images/upgrades/wandtoy.png",
  "/src/assets/images/upgrades/waterbowl.png",
  "/src/assets/images/upgrades/waterfountain.png",
  "/src/assets/images/upgrades/wetcatfood.png",
];

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/package.json",
  "/src/css/style.css",
  "/src/js/main.js",
  "/site.webmanifest",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  ...catImages,
  ...livingRoomImages,
  ...upgradeImages,
  "/src/assets/images/goldenPawprint.svg",
  "/src/assets/images/calico.png",
  "/src/assets/images/neonleopard.jpg",
  "/src/assets/images/neonstripes.jpg",
  "/src/assets/fonts/FingerPaint-Regular.ttf",
  "/src/assets/sounds/mouseclick.mp3",
  "/src/assets/sounds/gary_meow.mp3",
  "/src/assets/sounds/mario-meow.mp3",
  "/src/assets/sounds/meow_1.mp3",
  "/src/data/upgrades.json",
  "/src/data/subUpgrades.json",
  "/src/js/audio/audio.js",
  "/src/js/bonuses/thousandFingers.js",
  "/src/js/effects/animateCounter.js",
  "/src/js/effects/catRotation.js",
  "/src/js/effects/clickPopup.js",
  "/src/js/effects/goldenPawMode.js",
  "/src/js/effects/setLivingRoom.js",
  "/src/js/effects/upgradeStyles.js",
  "/src/js/golden/goldenPawprint.js",
  "/src/js/logic/chooseWeighted.js",
  "/src/js/logic/storage.js",
  "/src/js/logic/handleClick.js",
  "/src/js/logic/describeSubBonus.js",
  "/src/js/logic/describeSubUnlock.js",
  "/src/js/menus/achievements.js",
  "/src/js/menus/settings.js",
  "/src/js/menus/stats.js",
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
