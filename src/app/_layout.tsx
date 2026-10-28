import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StyleSheet, Text, View } from "react-native";

import { initDatabase } from "@/db/init";
import { useSessionStore } from "@/store/session";
import { colors, fontSizes, spacing } from "@/theme/tokens";

function RootNavigator() {
  const employeeCode = useSessionStore((state) => state.employeeCode);
  const hasHydrated = useSessionStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!employeeCode}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(employeeCode)}>
        <Stack.Screen name="(tecnico)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="medidores.db" onInit={initDatabase}>
      <RootNavigator />
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
});
