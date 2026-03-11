import * as h from "https://cdn.jsdelivr.net/npm/web-haptics@0.0.6/+esm";

if (h) {
  console.log("Web-Haptics cdn found");
} else console.error("Web-Haptics CDN not found");

export const haptics = new h.WebHaptics();
