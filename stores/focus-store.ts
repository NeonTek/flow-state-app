import { Soundscape } from "@/constants/soundscapes";
import {
  cancelAllScheduledNotificationsAsync,
  schedulePushNotification,
} from "@/services/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Session {
  id: string;
  duration: number;
  completedAt: Date;
  type: "focus" | "break";
  journalEntry?: string;
}

export interface FocusSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  neonColor: string;
  soundscape: Soundscape | "none";
  notificationsEnabled: boolean;
}

interface FocusState {
  // Timer state
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentSession: "focus" | "break" | "long-break";
  sessionCount: number;

  // Settings
  settings: FocusSettings;

  // Sessions history
  sessions: Session[];

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  updateSettings: (settings: Partial<FocusSettings>) => void;
  addJournalEntry: (sessionId: string, entry: string) => void;
  getTodaysSessions: () => Session[];
  getWeeklyStats: () => { totalMinutes: number; sessionsCount: number };
}

const defaultSettings: FocusSettings = {
  focusDuration: 25 * 60, // 25 minutes
  breakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsBeforeLongBreak: 4,
  neonColor: "#00d4ff",
  soundscape: "none",
  notificationsEnabled: true,
};

const createAsyncStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: async (name: string) => {
        try {
          const value = localStorage.getItem(name);
          return value;
        } catch (error) {
          console.error("Error getting item from storage:", error);
          return null;
        }
      },
      setItem: async (name: string, value: string) => {
        try {
          localStorage.setItem(name, value);
        } catch (error) {
          console.error("Error setting item in storage:", error);
        }
      },
      removeItem: async (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch (error) {
          console.error("Error removing item from storage:", error);
        }
      },
    };
  } else {
    return {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
      removeItem: AsyncStorage.removeItem,
    };
  }
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isActive: false,
      isPaused: false,
      timeLeft: defaultSettings.focusDuration,
      currentSession: "focus",
      sessionCount: 0,
      settings: defaultSettings,
      sessions: [],

      startTimer: () => {
        const { settings, currentSession, timeLeft } = get();
        let duration = timeLeft;
        if (duration <= 0) {
          duration =
            currentSession === "focus"
              ? settings.focusDuration
              : currentSession === "break"
              ? settings.breakDuration
              : settings.longBreakDuration;
        }

        set({ isActive: true, isPaused: false, timeLeft: duration });

        if (settings.notificationsEnabled) {
          schedulePushNotification(duration, currentSession);
        }
      },

      pauseTimer: () => {
        set((state) => {
          if (state.isPaused) {
            // Resuming
            if (state.settings.notificationsEnabled) {
              schedulePushNotification(state.timeLeft, state.currentSession);
            }
          } else {
            // Pausing
            cancelAllScheduledNotificationsAsync();
          }
          return { isPaused: !state.isPaused };
        });
      },

      resetTimer: () => {
        const { settings, currentSession } = get();
        cancelAllScheduledNotificationsAsync();
        let newTimeLeft = settings.focusDuration;
        if (currentSession === "focus") {
          newTimeLeft = settings.focusDuration;
        } else if (currentSession === "break") {
          newTimeLeft = settings.breakDuration;
        } else if (currentSession === "long-break") {
          newTimeLeft = settings.longBreakDuration;
        }
        set({
          isActive: false,
          isPaused: false,
          timeLeft: newTimeLeft,
        });
      },

      tick: () => {
        const { timeLeft, isActive, isPaused } = get();
        if (!isActive || isPaused) return;

        if (timeLeft <= 1) {
          get().completeSession();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      completeSession: () => {
        cancelAllScheduledNotificationsAsync();
        const { currentSession, settings, sessionCount } = get();
        const newSession: Session = {
          id: Date.now().toString(),
          duration:
            currentSession === "focus"
              ? settings.focusDuration
              : currentSession === "break"
              ? settings.breakDuration
              : settings.longBreakDuration,
          completedAt: new Date(),
          type: currentSession === "long-break" ? "break" : currentSession,
        };

        let nextSession: "focus" | "break" | "long-break" = "focus";
        let nextDuration = settings.focusDuration;
        let newSessionCount = sessionCount;

        if (currentSession === "focus") {
          newSessionCount++;
          if (newSessionCount % settings.sessionsBeforeLongBreak === 0) {
            nextSession = "long-break";
            nextDuration = settings.longBreakDuration;
          } else {
            nextSession = "break";
            nextDuration = settings.breakDuration;
          }
        } else {
          nextSession = "focus";
          nextDuration = settings.focusDuration;
        }

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSession: nextSession,
          timeLeft: nextDuration,
          isActive: false,
          isPaused: false,
          sessionCount: newSessionCount,
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          let newTimeLeft = state.timeLeft;

          if (!state.isActive) {
            if (
              state.currentSession === "focus" &&
              newSettings.focusDuration !== undefined
            ) {
              newTimeLeft = newSettings.focusDuration;
            } else if (
              state.currentSession === "break" &&
              newSettings.breakDuration !== undefined
            ) {
              newTimeLeft = newSettings.breakDuration;
            } else if (
              state.currentSession === "long-break" &&
              newSettings.longBreakDuration !== undefined
            ) {
              newTimeLeft = newSettings.longBreakDuration;
            }
          }

          return {
            settings: updatedSettings,
            timeLeft: newTimeLeft,
          };
        });
      },

      addJournalEntry: (sessionId, entry) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, journalEntry: entry }
              : session
          ),
        }));
      },

      getTodaysSessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().sessions.filter(
          (session) =>
            new Date(session.completedAt) >= today && session.type === "focus"
        );
      },

      getWeeklyStats: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSessions = get().sessions.filter(
          (session) =>
            new Date(session.completedAt) >= weekAgo && session.type === "focus"
        );
        return {
          totalMinutes: weekSessions.reduce(
            (total, session) => total + session.duration / 60,
            0
          ),
          sessionsCount: weekSessions.length,
        };
      },
    }),
    {
      name: "neon-flow-storage",
      storage: createJSONStorage(() => createAsyncStorage()),
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        sessionCount: state.sessionCount,
      }),
    }
  )
);
