import { storage } from "../logic/storage.js";

(() => {
  const bgm = new Audio("src/assets/music/resonance.mp3");

  bgm.loop = true;
  bgm.preload = "auto";

  // Initial settings
  bgm.volume = storage.getBgmAudioLevel() / 10;
  bgm.muted = !storage.getIsBgmAudioOn();

  // Audio processing
  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(bgm);

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 22000;

  source.connect(filter);
  filter.connect(audioContext.destination);

  // Start music
  const events = ["pointerdown", "keydown", "touchstart"];

  const startMusic = async () => {
    try {
      await audioContext.resume();

      if (storage.getIsBgmAudioOn()) {
        await bgm.play();
      }

      console.log("BGM Started");

      events.forEach((event) =>
        document.removeEventListener(event, startMusic),
      );
    } catch (err) {
      console.warn("BGM playback failed:", err);
    }
  };

  events.forEach((event) =>
    document.addEventListener(event, startMusic, { once: true }),
  );

  // Dialogue effects
  window.addEventListener("dialogueOpen", () => {
    filter.frequency.setValueAtTime(600, audioContext.currentTime);
  });

  window.addEventListener("dialogueClose", () => {
    filter.frequency.setValueAtTime(22000, audioContext.currentTime);
  });

  // Pause and resume
  window.addEventListener("pause", () => bgm.pause());

  window.addEventListener("resume", async () => {
    if (!storage.getIsBgmAudioOn()) return;

    try {
      await audioContext.resume();
      await bgm.play();
    } catch (err) {
      console.warn("BGM resume failed:", err);
    }
  });

  // BGM toggle
  window.addEventListener("bgmToggle", async () => {
    const enabled = storage.getIsBgmAudioOn();

    bgm.muted = !enabled;

    if (enabled) {
      try {
        await audioContext.resume();
        await bgm.play();
      } catch (err) {
        console.warn("BGM toggle playback failed:", err);
      }
    }
  });

  // Volume adjustment
  window.addEventListener("bgmVolumeChange", () => {
    bgm.volume = storage.getBgmAudioLevel() / 10;
  });
})();
