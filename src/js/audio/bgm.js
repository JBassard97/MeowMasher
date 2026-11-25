(() => {
  const bgm = new Audio("src/assets/music/resonance.mp3");

  bgm.loop = true;
  bgm.preload = "auto";
  bgm.volume = 0.3;

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
      await bgm.play();

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

  // Dialogue audio effects
  window.addEventListener("dialogueOpen", () => {
    filter.frequency.setTargetAtTime(600, audioContext.currentTime, 0.15);
  });

  window.addEventListener("dialogueClose", () => {
    filter.frequency.setTargetAtTime(22000, audioContext.currentTime, 0.15);
  });

  // Pause and resume
  window.addEventListener("pause", () => {
    bgm.pause();
  });

  window.addEventListener("resume", async () => {
    try {
      await audioContext.resume();
      await bgm.play();
    } catch (err) {
      console.warn("BGM resume failed:", err);
    }
  });
})();
