import * as h from "https://cdn.jsdelivr.net/npm/web-haptics@0.0.6/+esm";

export const HapticsList = {
  LitlePulse: () => {
    if (!h) return;
    const haptics = new h.WebHaptics();
    haptics.trigger([{ duration: 15 }], { intensity: 0.2 }); // Haptic
  },
};
