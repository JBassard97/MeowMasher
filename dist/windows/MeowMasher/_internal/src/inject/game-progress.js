import { storage } from "../js/logic/storage.js";

for (let i = 0; i < 20; i++) {
  storage.setUpgradeOwned(i, 200 - i * 10);
  storage.setBoostOwned(4, 5);
}
