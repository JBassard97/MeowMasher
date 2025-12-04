const meowSources = [
  "src/assets/sounds/gary_meow.mp3",
  "src/assets/sounds/meow_1.mp3",
  "src/assets/sounds/mario-meow.mp3",
];

const meowVolume = 0.4;

// Preload all audio objects
const meowAudios = meowSources.map((src) => {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = meowVolume;
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

  Click() {
    const clickAudio = new Audio("src/assets/sounds/mouseclick.mp3");
    clickAudio.preload = "auto";
    clickAudio.currentTime = 0;
    clickAudio.play().catch((err) => {
      console.error("Audio play error:", err);
    });
  },
};
