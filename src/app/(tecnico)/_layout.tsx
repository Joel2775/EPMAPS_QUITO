import { Stack } from "expo-router";

import ResumeDraftPrompt from "@/components/ResumeDraftPrompt";
import { colors } from "@/theme/tokens";

export default function TechnicianLayout() {
  return (
    <>
      <ResumeDraftPrompt />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { color: colors.textPrimary },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lectura" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
