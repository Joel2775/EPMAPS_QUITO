import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

import { Led } from "@/components/ui/Led";
import { Plate } from "@/components/ui/Plate";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useSyncStore } from "@/store/sync";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export default function ConnectionBanner() {
  const { isOnline } = useNetworkStatus();
  const pendingCount = useSyncStore((state) => state.pendingCount);
  const isSyncing = useSyncStore((state) => state.isSyncing);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Plate style={styles.content}>
        <View style={styles.connection}>
          <Led connected={isOnline} />
          <Text style={styles.text}>
            {isOnline ? "Conectado" : "Sin conexión"}
          </Text>
        </View>
        <View style={styles.pending}>
          <Text style={styles.pendingText}>Pendientes: {pendingCount}</Text>
        </View>
        {isSyncing ? <Text style={styles.text}>Enviando…</Text> : null}
      </Plate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  connection: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  text: {
    flexShrink: 1,
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  pending: {
    flexShrink: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
  },
  pendingText: {
    fontSize: typography.small,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
