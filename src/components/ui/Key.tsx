import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  borders,
  colors,
  dimensions,
  radius,
  shadows,
  spacing,
  typography,
} from "@/theme/tokens";

export type KeyVariant = "primary" | "secondary" | "danger";

type KeyProps = {
  label: string;
  onPress: () => void;
  variant?: KeyVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Key({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: KeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`${variant}Text`],
          disabled && styles.disabledText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    minHeight: dimensions.buttonMinHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.key,
  },
  primary: {
    backgroundColor: colors.electricBlue,
    ...shadows.primary,
  },
  secondary: {
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  danger: {
    borderWidth: borders.thin,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: typography.body,
    fontWeight: "600",
    textAlign: "center",
    color: colors.textPrimary,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.error,
  },
  disabled: {
    borderWidth: 0,
    backgroundColor: colors.surfaceSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: colors.textMuted,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
