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
  const condition = useDraftStore((state) => state.condition);
  const setCondition = useDraftStore((state) => state.setCondition);
  const setStep = useDraftStore((state) => state.setStep);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  function chooseCondition(nextCondition: ReadingCondition) {
    setCondition(nextCondition);
    router.push("/lectura/paso-2");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecciona el estado del medidor</Text>
      {conditions.map((conditionOption) => {
        const selected = conditionOption.value === condition;

        return (
          <Pressable
            accessibilityRole="button"
            key={conditionOption.value}
            style={[styles.button, selected && styles.selectedButton]}
            onPress={() => chooseCondition(conditionOption.value)}
          >
            <Text style={styles.buttonText}>{conditionOption.label}</Text>
          </Pressable>
        );
      })}
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
  selectedButton: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primaryContrast,
  },
});
