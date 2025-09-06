import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useFocusStore } from "@/stores/focus-store";

export function useTimer() {
  const {
    isActive,
    isPaused,
    timeLeft,
    currentSession,
    settings,
    tick,
    completeSession,
  } = useFocusStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeRef = useRef<number>(timeLeft);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, tick]);

  // Handle session completion with haptic feedback
  useEffect(() => {
    if (lastTimeRef.current > 0 && timeLeft === 0 && isActive) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      completeSession();
    }
    lastTimeRef.current = timeLeft;
  }, [timeLeft, isActive, completeSession]);

  // Haptic feedback for last 10 seconds
  useEffect(() => {
    if (isActive && !isPaused && timeLeft <= 10 && timeLeft > 0) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [timeLeft, isActive, isPaused]);

  return {
    isActive,
    isPaused,
    timeLeft,
    currentSession,
    settings,
  };
}
