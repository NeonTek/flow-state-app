import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  neonColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function NeonButton({
  title,
  onPress,
  variant = "primary",
  neonColor = "#00d4ff",
  disabled = false,
  style,
  textStyle,
}: NeonButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return [styles.button, styles.primaryButton, style];
      case "secondary":
        return [styles.button, styles.secondaryButton, style];
      case "outline":
        return [
          styles.button,
          styles.outlineButton,
          { borderColor: neonColor },
          style,
        ];
      default:
        return [styles.button, style];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, textStyle];
    if (variant === "outline") {
      return [...baseStyle, { color: neonColor }];
    }
    return baseStyle;
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[getButtonStyle(), disabled && styles.disabled]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ["#333", "#333"] : [neonColor, `${neonColor}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={getTextStyle()}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), disabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    elevation: 4,
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  gradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
