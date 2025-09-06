import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PenTool, Save, Calendar } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusStore } from "@/stores/focus-store";
import NeonButton from "@/components/NeonButton";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, settings, addJournalEntry } = useFocusStore();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");

  const recentSessions = sessions
    .filter((session) => session.type === "focus")
    .slice(0, 10);

  const handleSaveEntry = () => {
    if (!selectedSession || !journalText.trim()) {
      Alert.alert("Error", "Please select a session and write something!");
      return;
    }

    addJournalEntry(selectedSession, journalText.trim());
    setJournalText("");
    setSelectedSession(null);
    Alert.alert("Success", "Journal entry saved!");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionById = (id: string) => {
    return sessions.find((session) => session.id === id);
  };

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
          <View style={styles.header}>
            <PenTool color={settings.neonColor} size={28} />
            <Text style={styles.title}>Flow State Journal</Text>
          </View>

          <Text style={styles.description}>
            Reflect on your focus sessions. What helped you get into flow?
          </Text>

          <View style={styles.sessionSelector}>
            <Text style={styles.sectionTitle}>Select a Recent Session</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sessionList}>
                {recentSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={[
                      styles.sessionCard,
                      selectedSession === session.id && {
                        borderColor: settings.neonColor,
                        backgroundColor: `${settings.neonColor}10`,
                      },
                    ]}
                    onPress={() => {
                      setSelectedSession(session.id);
                      setJournalText(session.journalEntry || "");
                    }}
                  >
                    <View style={styles.sessionHeader}>
                      <Calendar color="#888" size={16} />
                      <Text style={styles.sessionDate}>
                        {formatDate(session.completedAt)}
                      </Text>
                    </View>
                    <Text style={styles.sessionDuration}>
                      {Math.round(session.duration / 60)}m focus
                    </Text>
                    {session.journalEntry && (
                      <View style={styles.hasEntryIndicator}>
                        <Text style={styles.hasEntryText}>Has entry</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {selectedSession && (
            <View style={styles.journalSection}>
              <Text style={styles.sectionTitle}>Your Reflection</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="How did this session feel? What helped you focus? Any insights?"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={6}
                  value={journalText}
                  onChangeText={setJournalText}
                  textAlignVertical="top"
                />
              </View>

              <NeonButton
                title="Save Reflection"
                onPress={handleSaveEntry}
                variant="primary"
                neonColor={settings.neonColor}
                style={styles.saveButton}
              />
            </View>
          )}

          <View style={styles.entriesSection}>
            <Text style={styles.sectionTitle}>Recent Reflections</Text>
            {sessions
              .filter((session) => session.journalEntry)
              .slice(0, 5)
              .map((session) => (
                <View key={session.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {formatDate(session.completedAt)}
                    </Text>
                    <Text style={styles.entryDuration}>
                      {Math.round(session.duration / 60)}m
                    </Text>
                  </View>
                  <Text style={styles.entryText}>{session.journalEntry}</Text>
                </View>
              ))}

            {sessions.filter((session) => session.journalEntry).length ===
              0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No reflections yet. Complete a session and share your
                  thoughts!
                </Text>
              </View>
            )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  description: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  sessionSelector: {
    marginBottom: 30,
  },
  sessionList: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 24,
  },
  sessionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#333",
    width: 160,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 12,
    color: "#888",
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  hasEntryIndicator: {
    backgroundColor: "#39ff1420",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  hasEntryText: {
    fontSize: 10,
    color: "#39ff14",
    fontWeight: "600",
  },
  journalSection: {
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  textInput: {
    color: "#ffffff",
    fontSize: 16,
    padding: 16,
    minHeight: 120,
    lineHeight: 22,
  },
  saveButton: {
    width: "100%",
  },
  entriesSection: {
    marginBottom: 30,
  },
  entryCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  entryDuration: {
    fontSize: 12,
    color: "#666",
  },
  entryText: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
