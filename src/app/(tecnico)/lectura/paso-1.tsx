import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";
import type { ReadingCondition } from "@/types";

const conditions: { value: ReadingCondition; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "inaccesible", label: "Inaccesible" },
  { value: "dañado", label: "Dañado" },
];

export default function ReadingConditionScreen() {
  const setCondition = useDraftStore((state) => state.setCondition);
  const setStep = useDraftStore((state) => state.setStep);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  function chooseCondition(condition: ReadingCondition) {
    setCondition(condition);
    router.push("/lectura/paso-2");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecciona el estado del medidor</Text>
      {conditions.map((condition) => (
        <Pressable
          accessibilityRole="button"
          key={condition.value}
          style={styles.button}
          onPress={() => chooseCondition(condition.value)}
        >
          <Text style={styles.buttonText}>{condition.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  button: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primaryContrast,
  },
});
