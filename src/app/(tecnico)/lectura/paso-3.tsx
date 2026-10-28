import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import {
  calculateConsumption,
  isAnomalous,
  parseReading,
} from "@/domain/consumption";
import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, spacing } from "@/theme/tokens";

export default function ReadingSummaryScreen() {
  const meter = useDraftStore((state) => state.meter);
  const condition = useDraftStore((state) => state.condition);
  const readingText = useDraftStore((state) => state.readingText);
  const reasonOrDamage = useDraftStore((state) => state.reasonOrDamage);
  const anomalyConfirmed = useDraftStore((state) => state.anomalyConfirmed);
  const setStep = useDraftStore((state) => state.setStep);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const reading = parseReading(readingText);
  const consumption =
    reading !== null && meter
      ? calculateConsumption(reading, meter.lastReading)
      : null;
  const anomalous =
    consumption !== null && meter
      ? isAnomalous(consumption, meter.averageMonthlyConsumption)
      : false;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen de lectura</Text>
      <Text style={styles.detail}>Medidor: {meter?.code ?? "Sin medidor"}</Text>
      <Text style={styles.detail}>Estado: {condition ?? "Sin seleccionar"}</Text>
      <Text style={styles.detail}>
        Lectura: {readingText || "Sin lectura"}
      </Text>
      {condition !== "normal" ? (
        <Text style={styles.detail}>
          {condition === "inaccesible" ? "Motivo" : "Descripción"}:{" "}
          {reasonOrDamage || "Sin detalle"}
        </Text>
      ) : null}
      {consumption !== null ? (
        <Text style={styles.detail}>Consumo calculado: {consumption}</Text>
      ) : null}
      {anomalous ? (
        <Text style={styles.detail}>
          Consumo anómalo; revisado: {anomalyConfirmed ? "Sí" : "No"}
        </Text>
      ) : null}
      <Text style={styles.notice}>
        La foto y el guardado se implementan en las skills 05 y 06
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  detail: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  notice: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
});
