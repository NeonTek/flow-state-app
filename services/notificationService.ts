import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get permissions for notifications!");
    return;
  }
}

export async function schedulePushNotification(
  timeLeft: number,
  currentSession: "focus" | "break" | "long-break"
) {
  let body = "Time to get back to focus!";
  if (currentSession === "focus") {
    body = "Your focus session is over. Time for a break!";
  } else if (currentSession === "long-break") {
    body = "Your focus session is over. Time for a long break!";
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Neon Flow",
      body,
      sound: "default",
    },
    trigger: timeLeft,
  });
}

export async function cancelAllScheduledNotificationsAsync() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
