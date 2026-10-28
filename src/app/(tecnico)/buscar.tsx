import { useState } from "react";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getReadingByMeterMonth } from "@/db/readings";
import { currentMonthYear } from "@/domain/date";
import { MeterNetworkError, MeterNotFoundError } from "@/services/api";
import { useMeter } from "@/hooks/useMeter";
import { meterCodeSchema } from "@/schemas/meter";
import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function MeterSearchScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validCode, setValidCode] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [isStartingDraft, setIsStartingDraft] = useState(false);
  const meterQuery = useMeter(validCode);
  const db = useSQLiteContext();
  const startDraft = useDraftStore((state) => state.startDraft);

  function handleConsult() {
    const result = meterCodeSchema.safeParse(code);

    if (!result.success) {
      setError(result.error.issues[0].message);
      setValidCode(null);
      return;
    }

    setError(null);
    setRegistrationError(null);
    setValidCode(result.data);
  }

  async function handleStartDraft(
    meter: NonNullable<typeof meterQuery.data> | null
  ) {
    if (!validCode || isStartingDraft) {
      return;
    }

    setIsStartingDraft(true);
    setRegistrationError(null);

    try {
      const monthYear = currentMonthYear();
      const existing = await getReadingByMeterMonth(db, validCode, monthYear);

      if (existing) {
        setRegistrationError(
          `Ya existe una lectura de ${validCode} en ${monthYear}`
        );
        return;
      }

      startDraft(validCode, meter);
      router.push("/lectura/paso-1");
    } catch (caught) {
      setRegistrationError(
        `No se pudo comprobar si ya existe una lectura: ${
          caught instanceof Error ? caught.message : "error desconocido"
        }`
      );
    } finally {
      setIsStartingDraft(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Buscar medidor</Text>

      <TextInput
        style={styles.input}
        placeholder="MED-000001"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        value={code}
        onChangeText={(value) => {
          setCode(value);
          setError(null);
          setRegistrationError(null);
          setValidCode(null);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {registrationError ? (
        <Text style={styles.error}>{registrationError}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={handleConsult}
      >
        <Text style={styles.buttonText}>Consultar</Text>
      </Pressable>

      {meterQuery.isLoading ? (
        <Text style={styles.message}>Cargando...</Text>
      ) : null}
      {!meterQuery.data && meterQuery.error instanceof MeterNotFoundError ? (
        <Text style={styles.error}>Medidor no encontrado</Text>
      ) : null}
      {!meterQuery.data && meterQuery.error instanceof MeterNetworkError ? (
        <>
          <Text style={styles.error}>
            Sin conexión y este medidor no está en caché
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            disabled={isStartingDraft}
            onPress={() => void handleStartDraft(null)}
          >
            <Text style={styles.buttonText}>
              Registrar sin datos del medidor
            </Text>
          </Pressable>
        </>
      ) : null}
      {!meterQuery.data &&
      meterQuery.error &&
      !(meterQuery.error instanceof MeterNotFoundError) &&
      !(meterQuery.error instanceof MeterNetworkError) ? (
        <Text style={styles.error}>
          No se pudo consultar el medidor: {meterQuery.error.message}
        </Text>
      ) : null}
      {meterQuery.data ? (
        <>
          <View style={styles.meterDetails}>
            <Text style={styles.detail}>
              Dirección: {meterQuery.data.address}
            </Text>
            <Text style={styles.detail}>Sector: {meterQuery.data.sector}</Text>
            <Text style={styles.detail}>
              Número de cuenta: {meterQuery.data.accountNumber}
            </Text>
            <Text style={styles.detail}>
              Estado: {meterQuery.data.condition}
            </Text>
            <Text style={styles.detail}>
              Última lectura: {meterQuery.data.lastReading}
            </Text>
            <Text style={styles.detail}>
              Fecha de última lectura: {meterQuery.data.lastReadingDate}
            </Text>
            <Text style={styles.detail}>
              Consumo promedio mensual:{" "}
              {meterQuery.data.averageMonthlyConsumption}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            disabled={isStartingDraft}
            onPress={() => void handleStartDraft(meterQuery.data)}
          >
            <Text style={styles.buttonText}>Registrar lectura</Text>
          </Pressable>
        </>
      ) : null}
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
  input: {
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  meterDetails: {
    gap: spacing.sm,
  },
  detail: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  button: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primaryContrast,
  },
});
