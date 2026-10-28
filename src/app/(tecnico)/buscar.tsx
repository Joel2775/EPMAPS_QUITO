import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { MeterNetworkError, MeterNotFoundError } from "@/services/api";
import { useMeter } from "@/hooks/useMeter";
import { meterCodeSchema } from "@/schemas/meter";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function MeterSearchScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validCode, setValidCode] = useState<string | null>(null);
  const meterQuery = useMeter(validCode);

  function handleConsult() {
    const result = meterCodeSchema.safeParse(code);

    if (!result.success) {
      setError(result.error.issues[0].message);
      setValidCode(null);
      return;
    }

    setError(null);
    setValidCode(result.data);
  }

  return (
    <View style={styles.container}>
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
          setValidCode(null);
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
        <Text style={styles.error}>
          Sin conexión y este medidor no está en caché
        </Text>
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
        <View style={styles.meterDetails}>
          <Text style={styles.detail}>Dirección: {meterQuery.data.address}</Text>
          <Text style={styles.detail}>Sector: {meterQuery.data.sector}</Text>
          <Text style={styles.detail}>
            Número de cuenta: {meterQuery.data.accountNumber}
          </Text>
          <Text style={styles.detail}>Estado: {meterQuery.data.condition}</Text>
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
