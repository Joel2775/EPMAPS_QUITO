import { useRouter, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

import { discardDraft } from "@/services/drafts";
import { colors, dimensions, spacing, typography } from "@/theme/tokens";

export default function ReadingLayout() {
  const db = useSQLiteContext();
  const router = useRouter();
  const headerRight = () => (
    <Pressable
      accessibilityRole="button"
      onPress={confirmDiscard}
      hitSlop={spacing.sm}
      style={styles.headerAction}
    >
      <Text style={styles.headerActionText}>Descartar</Text>
    </Pressable>
  );

  function confirmDiscard() {
    Alert.alert(
      "Descartar registro",
      "¿Deseas descartar el registro actual? También se eliminará su foto.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            void discardDraft(db)
              .then(() => router.replace("/"))
              .catch((error: unknown) => {
                Alert.alert(
                  "No se pudo descartar",
                  error instanceof Error ? error.message : "Intenta de nuevo."
                );
              });
          },
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <Stack
      screenOptions={{
        headerRight,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="paso-1"
        options={{ title: "Estado del medidor" }}
      />
      <Stack.Screen
        name="paso-2"
        options={{ title: "Lectura del medidor" }}
      />
      <Stack.Screen
        name="paso-3"
        options={{ title: "Resumen de lectura" }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    minHeight: dimensions.touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  headerActionText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.electricBlue,
  },
});
