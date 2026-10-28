import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/tokens";

type ScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
};

export function Screen({ children, contentContainerStyle, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.md) },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(spacing.md, insets.bottom) },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.base,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
});
