import { SOUNDSCAPE_URLS } from "@/constants/soundscapes";
import { useFocusStore } from "@/stores/focus-store";
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";

export function useSound() {
  const { isActive, isPaused, settings } = useFocusStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const manageSound = async () => {
      if (isActive && !isPaused && settings.soundscape !== "none") {
        if (soundRef.current) {
          await soundRef.current.playAsync();
        } else {
          try {
            const { sound } = await Audio.Sound.createAsync(
              SOUNDSCAPE_URLS[settings.soundscape],
              { shouldPlay: true, isLooping: true }
            );
            soundRef.current = sound;
          } catch (error) {
            console.log("Error playing sound:", error);
          }
        }
      } else if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    };

    manageSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isActive, isPaused, settings.soundscape]);
}
