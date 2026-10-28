import { Stack } from "expo-router";

import { colors } from "@/theme/tokens";

export default function TechnicianLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Inicio" }} />
    </Stack>
  );
}
