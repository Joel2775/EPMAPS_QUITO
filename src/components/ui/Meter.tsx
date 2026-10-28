import { StyleSheet, Text, View } from "react-native";

import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type MeterProps = {
  label: string;
  value: string | number | null;
};

export function Meter({ label, value }: MeterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.display}>
        <Text
          accessibilityLabel={`${label}: ${value ?? "Sin dato"}`}
          style={styles.value}
        >
          {value ?? "—"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  display: {
    minHeight: dimensions.buttonMinHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
  },
  value: {
    fontSize: typography.visor,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: colors.deepBlue,
  },
});
