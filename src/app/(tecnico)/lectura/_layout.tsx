import { Stack } from "expo-router";

export default function ReadingLayout() {
  return (
    <Stack>
      <Stack.Screen name="paso-1" options={{ title: "Estado del medidor" }} />
      <Stack.Screen name="paso-2" options={{ title: "Lectura del medidor" }} />
      <Stack.Screen name="paso-3" options={{ title: "Resumen de lectura" }} />
    </Stack>
  );
}
