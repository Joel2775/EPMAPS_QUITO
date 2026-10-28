import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        headerShadowVisible: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: dimensions.tabBarHeight + insets.bottom,
            paddingBottom: Math.max(insets.bottom, spacing.sm),
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: colors.electricBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarActiveBackgroundColor: colors.surfaceSecondary,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Buscar medidor",
          tabBarLabel: "Buscar",
          tabBarAccessibilityLabel: "Buscar medidores",
          tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Lecturas",
          tabBarLabel: "Lecturas",
          tabBarAccessibilityLabel: "Ver lecturas guardadas",
          tabBarIcon: ({ color }) => <TabIcon name="readings" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
}: {
  name: "search" | "readings";
  color: ColorValue;
}) {
  if (name === "search") {
    return (
      <View style={styles.iconFrame}>
        <View style={[styles.searchLens, { borderColor: color }]} />
        <View style={[styles.searchHandle, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.listIcon, { borderColor: color }]}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.listRow}>
          <View style={[styles.listDot, { backgroundColor: color }]} />
          <View style={[styles.listLine, { backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: dimensions.tabBarHeight,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: borders.thin,
    borderTopColor: colors.border,
    elevation: 8,
  },
  tabBarItem: {
    marginHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  tabBarLabel: {
    fontSize: typography.label,
    fontWeight: "600",
  },
  iconFrame: {
    width: dimensions.tabIconFrame,
    height: dimensions.tabIconFrame,
  },
  searchLens: {
    width: dimensions.searchLens,
    height: dimensions.searchLens,
    borderWidth: borders.plateLight,
    borderRadius: radius.pill,
  },
  searchHandle: {
    position: "absolute",
    left: dimensions.searchHandleOffset,
    top: dimensions.searchHandleOffset,
    width: dimensions.searchHandleLength,
    height: dimensions.searchHandleThickness,
    borderRadius: radius.pill,
    transform: [{ rotate: "45deg" }],
  },
  listIcon: {
    width: dimensions.listIconWidth,
    height: dimensions.listIconHeight,
    justifyContent: "space-evenly",
    paddingHorizontal: spacing.xs,
    borderWidth: borders.plateLight,
    borderRadius: radius.field,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  listDot: {
    width: dimensions.listDotSize,
    height: dimensions.listDotSize,
    borderRadius: radius.pill,
  },
  listLine: {
    flex: 1,
    height: dimensions.listLineHeight,
    borderRadius: radius.pill,
  },
});
