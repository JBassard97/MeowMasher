import * as h from "https://cdn.jsdelivr.net/npm/web-haptics@0.0.6/+esm";
import { storage } from "../logic/storage.js";

export const HapticsList = {
  LittlePulse: () => {
    if (!h) return;
    if (!storage.getIsHapticsOn()) return;
    const haptics = new h.WebHaptics();
    haptics.trigger([{ duration: 20 }], {
      intensity: storage.getHapticsLevel() / 10,
    }); // Haptic
  },
};
