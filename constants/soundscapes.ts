const rainSound = require("../assets/audio/rain.mp3");
const forestSound = require("../assets/audio/forest.mp3");
const oceanSound = require("../assets/audio/ocean.mp3");
const citySound = require("../assets/audio/city.mp3");
const whiteNoiseSound = require("../assets/audio/white-noice.mp3");
const gospel = require("../assets/audio/gospel.mp3");

export const SOUNDSCAPE_URLS = {
  rain: rainSound,
  forest: forestSound,
  ocean: oceanSound,
  city: citySound,
  whitenoise: whiteNoiseSound,
  gospel: gospel,
} as const;

export type Soundscape = keyof typeof SOUNDSCAPE_URLS;

export const SOUNDSCAPE_DESCRIPTIONS: Record<Soundscape | "none", string> = {
  none: "Complete silence for maximum focus",
  rain: "Gentle rainfall to calm your mind",
  forest: "Peaceful forest ambience",
  ocean: "Soothing wind chime sounds",
  city: "Distant city hum for urban focus",
  whitenoise: "Pure white noise for concentration",
  gospel: "Uplifting gospel music to inspire focus",
};
