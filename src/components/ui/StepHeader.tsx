import { StyleSheet, Text, View } from "react-native";

import {
  borders,
  colors,
  dimensions,
  spacing,
  typography,
} from "@/theme/tokens";
import { Plate } from "./Plate";

const labels = ["Estado", "Lectura", "Foto"] as const;

type StepHeaderProps = {
  currentStep: 1 | 2 | 3;
};

export function StepHeader({ currentStep }: StepHeaderProps) {
  return (
    <Plate>
      <Text style={styles.heading}>Paso {currentStep} de 3</Text>
      <View style={styles.segments}>
        {labels.map((label, index) => {
          const step = index + 1;
          const state =
            step === currentStep
              ? styles.current
              : step < currentStep
                ? styles.completed
                : styles.pending;

          return (
            <View
              key={label}
              accessibilityLabel={label}
              style={[styles.segment, state]}
            />
          );
        })}
      </View>
      <View style={styles.labels}>
        {labels.map((label) => (
          <Text key={label} style={styles.label}>
            {label}
          </Text>
        ))}
      </View>
    </Plate>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  segments: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: dimensions.stepSegmentHeight,
    borderRadius: spacing.xs,
  },
  current: {
    backgroundColor: colors.electricBlue,
  },
  completed: {
    backgroundColor: colors.success,
  },
  pending: {
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: typography.small,
    color: colors.textSecondary,
  },
});
