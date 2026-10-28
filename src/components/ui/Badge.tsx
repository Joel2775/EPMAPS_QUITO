import {
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { borders, colors, radius, spacing, typography } from "@/theme/tokens";
import { Led } from "./Led";

export type BadgeStatus = "pending" | "verification" | "sent";

type BadgeProps = {
  label: string;
  status: BadgeStatus;
};

const statusStyles: Record<BadgeStatus, ViewStyle> = {
  pending: {
    borderColor: colors.secondaryBlue,
    backgroundColor: colors.surfaceSecondary,
  },
  verification: {
    borderColor: colors.error,
    backgroundColor: colors.surfaceSecondary,
  },
  sent: {
    borderColor: colors.success,
    backgroundColor: colors.surfaceSecondary,
  },
};

const labelStyles: Record<BadgeStatus, TextStyle> = {
  pending: { color: colors.deepBlue },
  verification: { color: colors.error },
  sent: { color: colors.success },
};

export function Badge({ label, status }: BadgeProps) {
  return (
    <View style={[styles.badge, statusStyles[status]]}>
      <Text style={[styles.label, labelStyles[status]]}>{label}</Text>
      <Led connected={status === "sent"} small />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: spacing.xxl,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: borders.thin,
    borderRadius: radius.pill,
  },
  label: {
    flexShrink: 1,
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
