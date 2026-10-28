import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";

import ConnectionBanner from "@/components/ConnectionBanner";
import SyncManager from "@/components/SyncManager";
import { initDatabase } from "@/db/init";
import { queryClient } from "@/services/queryClient";
import { useSessionStore } from "@/store/session";
import { colors, spacing, typography } from "@/theme/tokens";

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
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
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
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <ConnectionBanner />
          <RootNavigator />
          <SyncManager />
        </View>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.title,
  },
});
