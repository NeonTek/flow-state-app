import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

export interface Session {
  id: string;
  duration: number;
  completedAt: Date;
  type: 'focus' | 'break';
  journalEntry?: string;
}

export interface FocusSettings {
  focusDuration: number;
  breakDuration: number;
  neonColor: string;
  soundscape: string;
  notificationsEnabled: boolean;
}

interface FocusState {
  // Timer state
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentSession: 'focus' | 'break';
  
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
  breakDuration: 5 * 60,  // 5 minutes
  neonColor: '#00d4ff',
  soundscape: 'none',
  notificationsEnabled: true,
};

const createAsyncStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (name: string) => {
        try {
          const value = localStorage.getItem(name);
          return value;
        } catch (error) {
          console.log('Error getting item from storage:', error);
          return null;
        }
      },
      setItem: async (name: string, value: string) => {
        try {
          localStorage.setItem(name, value);
        } catch (error) {
          console.log('Error setting item in storage:', error);
        }
      },
      removeItem: async (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch (error) {
          console.log('Error removing item from storage:', error);
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
      currentSession: 'focus',
      settings: defaultSettings,
      sessions: [],

      startTimer: () => {
        const { settings, currentSession } = get();
        set({
          isActive: true,
          isPaused: false,
          timeLeft: currentSession === 'focus' ? settings.focusDuration : settings.breakDuration,
        });
      },

      pauseTimer: () => {
        set({ isPaused: true });
      },

      resetTimer: () => {
        const { settings, currentSession } = get();
        set({
          isActive: false,
          isPaused: false,
          timeLeft: currentSession === 'focus' ? settings.focusDuration : settings.breakDuration,
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
        const { currentSession, settings } = get();
        const newSession: Session = {
          id: Date.now().toString(),
          duration: currentSession === 'focus' ? settings.focusDuration : settings.breakDuration,
          completedAt: new Date(),
          type: currentSession,
        };

        const nextSession = currentSession === 'focus' ? 'break' : 'focus';
        const nextDuration = nextSession === 'focus' ? settings.focusDuration : settings.breakDuration;

        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSession: nextSession,
          timeLeft: nextDuration,
          isActive: false,
          isPaused: false,
        }));
      },

      updateSettings: (newSettings) => {
        set(state => {
          const updatedSettings = { ...state.settings, ...newSettings };
          let newTimeLeft = state.timeLeft;
          
          // Only update timeLeft if timer is not active and duration settings changed
          if (!state.isActive) {
            if (state.currentSession === 'focus' && newSettings.focusDuration !== undefined) {
              newTimeLeft = newSettings.focusDuration;
            } else if (state.currentSession === 'break' && newSettings.breakDuration !== undefined) {
              newTimeLeft = newSettings.breakDuration;
            }
          }
          
          return {
            settings: updatedSettings,
            timeLeft: newTimeLeft,
          };
        });
      },

      addJournalEntry: (sessionId, entry) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId ? { ...session, journalEntry: entry } : session
          ),
        }));
      },

      getTodaysSessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().sessions.filter(session => 
          new Date(session.completedAt) >= today && session.type === 'focus'
        );
      },

      getWeeklyStats: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSessions = get().sessions.filter(session => 
          new Date(session.completedAt) >= weekAgo && session.type === 'focus'
        );
        return {
          totalMinutes: weekSessions.reduce((total, session) => total + session.duration / 60, 0),
          sessionsCount: weekSessions.length,
        };
      },
    }),
    {
      name: 'neon-flow-storage',
      storage: createJSONStorage(() => createAsyncStorage()),
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
      }),
    }
  )
);