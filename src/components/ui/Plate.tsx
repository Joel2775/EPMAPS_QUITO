import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { borders, colors, radius, shadows, spacing } from "@/theme/tokens";

type PlateProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Plate({ children, onPress, style }: PlateProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.plate,
          style,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.plate, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  plate: {
    padding: spacing.base,
    gap: spacing.sm,
    borderWidth: borders.thin,
    borderColor: colors.border,
    borderRadius: radius.large,
    backgroundColor: colors.plate,
    ...shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});
