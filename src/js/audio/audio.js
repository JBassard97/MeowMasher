const meowSources = [
  "src/assets/sounds/gary_meow.mp3",
  "src/assets/sounds/meow_1.mp3",
  "src/assets/sounds/mario-meow.mp3",
];

// Preload all audio objects
const meowAudios = meowSources.map((src) => {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
});

export const AudioList = {
  Meow() {
    // Pick random Audio instance
    const randomAudio =
      meowAudios[Math.floor(Math.random() * meowAudios.length)];

    // Reset so it can replay instantly
    randomAudio.currentTime = 0;

    // Play!
    randomAudio.play().catch((err) => {
      console.error("Audio play error:", err);
    });
  },
};
