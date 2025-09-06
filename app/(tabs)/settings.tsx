import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Settings as SettingsIcon,
  Clock,
  Palette,
  Volume2,
  Bell,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useFocusStore } from "@/stores/focus-store";

const NEON_COLORS = [
  { name: "Electric Blue", value: "#00d4ff" },
  { name: "Neon Green", value: "#39ff14" },
  { name: "Hot Pink", value: "#ff0080" },
  { name: "Purple", value: "#bf00ff" },
  { name: "Orange", value: "#ff6600" },
  { name: "Cyan", value: "#00ffff" },
];

const SOUNDSCAPES = [
  { name: "None", value: "none" },
  { name: "Rain", value: "rain" },
  { name: "Forest", value: "forest" },
  { name: "Ocean", value: "ocean" },
  { name: "City", value: "city" },
  { name: "White Noise", value: "whitenoise" },
];

const TIME_PRESETS = [
  { name: "15 min", focus: 15 * 60, break: 3 * 60 },
  { name: "25 min", focus: 25 * 60, break: 5 * 60 },
  { name: "45 min", focus: 45 * 60, break: 10 * 60 },
  { name: "60 min", focus: 60 * 60, break: 15 * 60 },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Use stable selectors to prevent infinite re-renders
  const settings = useFocusStore((state) => state.settings);
  const updateSettings = useFocusStore((state) => state.updateSettings);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}m`;
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
            <SettingsIcon color={settings.neonColor} size={28} />
            <Text style={styles.title}>Settings</Text>
          </View>

          {/* Timer Settings */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection("timer")}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Clock color="#888" size={20} />
                <Text style={styles.sectionTitle}>Timer Settings</Text>
              </View>
              <Text style={styles.sectionValue}>
                {formatTime(settings.focusDuration)} /{" "}
                {formatTime(settings.breakDuration)}
              </Text>
            </View>

            {expandedSection === "timer" && (
              <View style={styles.sectionContent}>
                <Text style={styles.subsectionTitle}>Quick Presets</Text>
                <View style={styles.presetGrid}>
                  {TIME_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      style={[
                        styles.presetButton,
                        settings.focusDuration === preset.focus && {
                          borderColor: settings.neonColor,
                          backgroundColor: `${settings.neonColor}10`,
                        },
                      ]}
                      onPress={() => {
                        try {
                          updateSettings({
                            focusDuration: preset.focus,
                            breakDuration: preset.break,
                          });
                        } catch (error) {
                          console.log("Error updating timer settings:", error);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          settings.focusDuration === preset.focus && {
                            color: settings.neonColor,
                          },
                        ]}
                      >
                        {preset.name}
                      </Text>
                      <Text style={styles.presetSubtext}>
                        {Math.floor(preset.break / 60)}m break
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Theme Settings */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection("theme")}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Palette color="#888" size={20} />
                <Text style={styles.sectionTitle}>Neon Theme</Text>
              </View>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: settings.neonColor },
                ]}
              />
            </View>

            {expandedSection === "theme" && (
              <View style={styles.sectionContent}>
                <Text style={styles.subsectionTitle}>
                  Choose Your Neon Color
                </Text>
                <View style={styles.colorGrid}>
                  {NEON_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color.value },
                        settings.neonColor === color.value &&
                          styles.selectedColor,
                      ]}
                      onPress={() => {
                        try {
                          updateSettings({ neonColor: color.value });
                        } catch (error) {
                          console.log("Error updating neon color:", error);
                        }
                      }}
                    >
                      {settings.neonColor === color.value && (
                        <View style={styles.colorCheckmark} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.colorLabels}>
                  {NEON_COLORS.map((color) => (
                    <Text
                      key={color.value}
                      style={[
                        styles.colorLabel,
                        settings.neonColor === color.value && {
                          color: color.value,
                        },
                      ]}
                    >
                      {color.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>

          {/* Sound Settings */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => toggleSection("sound")}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Volume2 color="#888" size={20} />
                <Text style={styles.sectionTitle}>Soundscapes</Text>
              </View>
              <Text style={styles.sectionValue}>
                {SOUNDSCAPES.find((s) => s.value === settings.soundscape)
                  ?.name || "None"}
              </Text>
            </View>

            {expandedSection === "sound" && (
              <View style={styles.sectionContent}>
                <Text style={styles.subsectionTitle}>Background Sounds</Text>
                {SOUNDSCAPES.map((sound) => (
                  <TouchableOpacity
                    key={sound.value}
                    style={[
                      styles.soundOption,
                      settings.soundscape === sound.value && {
                        borderColor: settings.neonColor,
                        backgroundColor: `${settings.neonColor}10`,
                      },
                    ]}
                    onPress={() => {
                      try {
                        updateSettings({ soundscape: sound.value });
                      } catch (error) {
                        console.log("Error updating soundscape:", error);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.soundText,
                        settings.soundscape === sound.value && {
                          color: settings.neonColor,
                        },
                      ]}
                    >
                      {sound.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Bell color="#888" size={20} />
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => {
                  try {
                    updateSettings({ notificationsEnabled: value });
                  } catch (error) {
                    console.log("Error updating notifications:", error);
                  }
                }}
                trackColor={{ false: "#333", true: `${settings.neonColor}40` }}
                thumbColor={
                  settings.notificationsEnabled ? settings.neonColor : "#666"
                }
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Neon Flow v1.0</Text>
            <Text style={styles.footerSubtext}>
              Crafted for deep focus and mindful productivity
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  section: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  sectionValue: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 16,
    marginTop: 8,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  presetButton: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#333",
    minWidth: 80,
    alignItems: "center",
  },
  presetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  presetSubtext: {
    fontSize: 12,
    color: "#666",
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  colorCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  colorLabels: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  colorLabel: {
    fontSize: 12,
    color: "#666",
    width: 48,
    textAlign: "center",
  },
  soundOption: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#333",
  },
  soundText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
