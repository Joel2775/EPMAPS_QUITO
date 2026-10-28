import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSessionStore } from "@/store/session";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function TechnicianHomeScreen() {
  const employeeCode = useSessionStore((state) => state.employeeCode);
  const logout = useSessionStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Base lista</Text>
      <Text style={styles.employee}>Técnico: {employeeCode}</Text>

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  employee: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.primaryContrast,
  },
});
