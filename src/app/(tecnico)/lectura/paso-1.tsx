import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";
import { StepHeader } from "@/components/ui/StepHeader";
import { borders, colors, spacing, typography } from "@/theme/tokens";
import { useDraftStore } from "@/store/draft";
import type { ReadingCondition } from "@/types";

const conditions: { value: ReadingCondition; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "inaccesible", label: "Inaccesible" },
  { value: "dañado", label: "Dañado" },
];

const stripeColors: Record<ReadingCondition, string> = {
  normal: colors.secondaryBlue,
  inaccesible: colors.gold,
  dañado: colors.primary,
};

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
    <Screen>
      <StepHeader currentStep={1} />
      <Text style={styles.title}>Selecciona el estado del medidor</Text>
      {conditions.map((conditionOption) => {
        const selected = conditionOption.value === condition;

        return (
          <Plate
            key={conditionOption.value}
            onPress={() => chooseCondition(conditionOption.value)}
            style={[styles.condition, selected && styles.selected]}
          >
            <View
              style={[
                styles.stripe,
                { backgroundColor: stripeColors[conditionOption.value] },
              ]}
            />
            <View style={styles.conditionText}>
              <Text style={styles.label}>{conditionOption.label}</Text>
              {selected ? (
                <Text style={styles.selectedLabel}>Seleccionado</Text>
              ) : null}
            </View>
          </Plate>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.title,
  },
  condition: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  selected: {
    borderWidth: borders.selected,
    borderColor: colors.electricBlue,
  },
  stripe: {
    width: borders.conditionStripe,
    borderRadius: spacing.xs,
  },
  conditionText: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: spacing.xl,
  },
  label: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  selectedLabel: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.electricBlue,
  },
});
