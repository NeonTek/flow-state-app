import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CircularProgress from "@/components/CircularProgress";
import NeonButton from "@/components/NeonButton";
import { useFocusStore } from "@/stores/focus-store";

import { useSound } from "@/hooks/useSound";

const { width, height } = Dimensions.get("window");

export default function FocusScreen() {
  const insets = useSafeAreaInsets();
  const {
    isActive,
    isPaused,
    timeLeft,
    currentSession,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
  } = useFocusStore();

  useSound();

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (isActive && !isPaused) {
        intervalRef.current = setInterval(() => {
          try {
            tick();
          } catch (error) {
            console.log("Error in timer tick:", error);
          }
        }, 1000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.log("Error setting up timer:", error);
    }

    return () => {
      try {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.log("Error cleaning up timer:", error);
      }
    };
  }, [isActive, isPaused, tick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    const totalTime =
      currentSession === "focus"
        ? settings.focusDuration
        : settings.breakDuration;
    return (totalTime - timeLeft) / totalTime;
  };

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    startTimer();
  };

  const handlePause = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isActive) {
      pauseTimer();
    }
  };

  const handleReset = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    resetTimer();
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0a0a0a" }]}>
      <LinearGradient
        colors={["#0a0a0a", "#1a1a1a"]}
        style={[
          styles.gradient,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.sessionType}>
            {currentSession === "focus"
              ? "FOCUS TIME"
              : currentSession === "break"
              ? "BREAK TIME"
              : "LONG BREAK"}
          </Text>
          <View
            style={[
              styles.sessionIndicator,
              { backgroundColor: settings.neonColor },
            ]}
          />
        </View>

        <View style={styles.timerContainer}>
          <View style={styles.circularProgressContainer}>
            <CircularProgress
              progress={getProgress()}
              size={280}
              strokeWidth={12}
              neonColor={settings.neonColor}
            />
            <View style={styles.timerContent}>
              <Text style={[styles.timeText, { color: settings.neonColor }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={styles.sessionLabel}>
                {currentSession === "focus" ? "Focus Session" : "Break Time"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          {!isActive ? (
            <NeonButton
              title="Start Session"
              onPress={handleStart}
              variant="primary"
              neonColor={settings.neonColor}
              style={styles.primaryButton}
            />
          ) : (
            <View style={styles.activeControls}>
              <NeonButton
                title={isPaused ? "Resume" : "Pause"}
                onPress={handlePause}
                variant="secondary"
                style={styles.controlButton}
              />
              <NeonButton
                title="Reset"
                onPress={handleReset}
                variant="outline"
                neonColor={settings.neonColor}
                style={styles.controlButton}
              />
            </View>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {useFocusStore.getState().getTodaysSessions().length}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(
                useFocusStore.getState().getWeeklyStats().totalMinutes
              )}
              m
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  sessionIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgressContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContent: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: 48,
    fontWeight: "300",
    marginBottom: 8,
    fontVariant: ["tabular-nums"],
  },
  sessionLabel: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  controls: {
    marginBottom: 40,
  },
  primaryButton: {
    width: "100%",
    height: 56,
  },
  activeControls: {
    flexDirection: "row",
    gap: 16,
  },
  controlButton: {
    flex: 1,
    height: 48,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#333",
    marginHorizontal: 20,
  },
});
