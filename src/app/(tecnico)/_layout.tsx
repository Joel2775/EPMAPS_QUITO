import { Stack } from "expo-router";

import ResumeDraftPrompt from "@/components/ResumeDraftPrompt";
import { colors } from "@/theme/tokens";

export default function TechnicianLayout() {
  return (
    <>
      <ResumeDraftPrompt />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Inicio" }} />
      </Stack>
    </>
  );
}
