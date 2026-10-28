import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type FieldProps = TextInputProps & {
  label?: string;
};

export function Field({ label, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...inputProps}
        style={[styles.input, style]}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  input: {
    minHeight: dimensions.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: borders.thin,
    borderColor: colors.border,
    borderRadius: radius.field,
    backgroundColor: colors.field,
    fontSize: typography.body,
    color: colors.fieldText,
  },
});
