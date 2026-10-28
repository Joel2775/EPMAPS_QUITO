import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSyncStore } from "@/store/sync";
import { colors, fontSizes, spacing } from "@/theme/tokens";

export default function ConnectionBanner() {
  const { isOnline } = useNetworkStatus();
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const backgroundColor = isOnline ? colors.success : colors.warning;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {isOnline ? "Conectado" : "Sin conexión"}
        </Text>
        <Text style={styles.text}>Pendientes: {pendingCount}</Text>
        {isSyncing ? <Text style={styles.text}>Enviando…</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 0,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: colors.primaryContrast,
  },
});
