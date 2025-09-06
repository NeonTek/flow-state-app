import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, Clock, Target, Zap } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusStore } from "@/stores/focus-store";

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, settings } = useFocusStore();

  const todaysSessions = useFocusStore.getState().getTodaysSessions();
  const weeklyStats = useFocusStore.getState().getWeeklyStats();

  const getStreakDays = () => {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(checkDate);
      nextDay.setDate(checkDate.getDate() + 1);

      const hasSessions = sessions.some((session) => {
        const sessionDate = new Date(session.completedAt);
        return (
          sessionDate >= checkDate &&
          sessionDate < nextDay &&
          session.type === "focus"
        );
      });

      if (hasSessions) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const getWeeklyData = () => {
    const weekData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const daySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.completedAt);
        return (
          sessionDate >= date &&
          sessionDate < nextDay &&
          session.type === "focus"
        );
      });

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        sessions: daySessions.length,
        minutes: daySessions.reduce(
          (total, session) => total + session.duration / 60,
          0
        ),
      });
    }

    return weekData;
  };

  const weeklyData = getWeeklyData();
  const maxSessions = Math.max(...weeklyData.map((d) => d.sessions), 1);

  return (
    <View style={[styles.container, { backgroundColor: "#0a0a0a" }]}>
      <LinearGradient
        colors={["#0a0a0a", "#1a1a1a"]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          <Text style={styles.title}>Your Flow Stats</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryCard]}>
              <LinearGradient
                colors={[`${settings.neonColor}20`, `${settings.neonColor}10`]}
                style={styles.cardGradient}
              >
                <View style={styles.statHeader}>
                  <Zap color={settings.neonColor} size={24} />
                  <Text
                    style={[styles.statTitle, { color: settings.neonColor }]}
                  >
                    Current Streak
                  </Text>
                </View>
                <Text style={styles.statValue}>{getStreakDays()}</Text>
                <Text style={styles.statUnit}>days</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Target color="#888" size={20} />
                <Text style={styles.statTitle}>Today</Text>
              </View>
              <Text style={styles.statValue}>{todaysSessions.length}</Text>
              <Text style={styles.statUnit}>sessions</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Clock color="#888" size={20} />
                <Text style={styles.statTitle}>This Week</Text>
              </View>
              <Text style={styles.statValue}>
                {Math.round(weeklyStats.totalMinutes)}
              </Text>
              <Text style={styles.statUnit}>minutes</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp color="#888" size={20} />
                <Text style={styles.statTitle}>Total Sessions</Text>
              </View>
              <Text style={styles.statValue}>
                {sessions.filter((s) => s.type === "focus").length}
              </Text>
              <Text style={styles.statUnit}>completed</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Activity</Text>
            <View style={styles.chart}>
              {weeklyData.map((day, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max((day.sessions / maxSessions) * 80, 4),
                        backgroundColor:
                          day.sessions > 0 ? settings.neonColor : "#333",
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{day.day}</Text>
                  <Text style={styles.chartValue}>{day.sessions}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.flowVisualization}>
            <Text style={styles.chartTitle}>Your Neon Flow</Text>
            <View style={styles.flowContainer}>
              {sessions.slice(0, 20).map((session, index) => (
                <View
                  key={session.id}
                  style={[
                    styles.flowDot,
                    {
                      backgroundColor:
                        session.type === "focus" ? settings.neonColor : "#333",
                      opacity: 1 - index * 0.05,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.flowDescription}>
              Each dot represents a completed session. Watch your flow grow!
            </Text>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    borderWidth: 1,
    borderColor: "#333",
  },
  primaryCard: {
    width: width - 48,
    borderColor: "transparent",
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    margin: -20,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  chartContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 10,
    color: "#666",
  },
  flowVisualization: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#333",
  },
  flowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  flowDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  flowDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
});
