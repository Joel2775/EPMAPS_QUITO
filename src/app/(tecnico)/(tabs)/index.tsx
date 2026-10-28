import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Field } from "@/components/ui/Field";
import { Key } from "@/components/ui/Key";
import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";
import { getReadingByClientId, getReadingByMeterMonth } from "@/db/readings";
import { currentMonthYear } from "@/domain/date";
import { useMeter } from "@/hooks/useMeter";
import { MeterNetworkError, MeterNotFoundError } from "@/services/api";
import { meterCodeSchema } from "@/schemas/meter";
import { useDraftStore } from "@/store/draft";
import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

export default function MeterSearchScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validCode, setValidCode] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [isStartingDraft, setIsStartingDraft] = useState(false);
  const [pendingCorrection, setPendingCorrection] = useState(false);
  const meterQuery = useMeter(validCode);
  const db = useSQLiteContext();
  const startDraft = useDraftStore((state) => state.startDraft);
  const startEditDraft = useDraftStore((state) => state.startEditDraft);

  useEffect(() => {
    if (!validCode) {
      setPendingCorrection(false);
      return;
    }

    const monthYear = currentMonthYear();
    void getReadingByMeterMonth(db, validCode, monthYear).then((existing) => {
      setPendingCorrection(Boolean(existing && existing.syncStatus === "pending"));
    });
  }, [db, validCode]);

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
        if (existing.syncStatus === "pending") {
          setRegistrationError(
            `Ya existe una lectura de ${validCode} en ${monthYear}; puede corregirse.`
          );
          return;
        }

        setRegistrationError(
          `Ya existe una lectura de ${validCode} en ${monthYear}: no se puede modificar`
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

  async function handleCorrectExisting(
    existing: NonNullable<Awaited<ReturnType<typeof getReadingByMeterMonth>>>
  ) {
    const row = await getReadingByClientId(db, existing.clientId);

    if (!row || row.syncStatus !== "pending") {
      setRegistrationError("Ya enviada: no se puede modificar");
      return;
    }

    const draftState = useDraftStore.getState();
    const hasUnfinishedDraft =
      draftState.step > 0 &&
      draftState.clientId !== null &&
      draftState.editingClientId !== existing.clientId;

    if (hasUnfinishedDraft) {
      Alert.alert(
        "Hay un registro sin terminar. ¿Reemplazarlo?",
        "Se perderá el borrador actual.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Reemplazar",
            onPress: () => {
              startEditDraft(row);
              router.push("/lectura/paso-1");
            },
          },
        ]
      );
      return;
    }

    startEditDraft(row);
    router.push("/lectura/paso-1");
  }

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>CONSULTA DE MEDIDOR</Text>
        <Text style={styles.title}>Busca tu medidor</Text>
        <Text style={styles.subtitle}>
          Ingresa el código para consultar sus datos y registrar la lectura.
        </Text>
      </View>
      <Plate style={styles.searchCard}>
        <Field
          label="Código de medidor"
          placeholder="MED-000001"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleConsult}
          value={code}
          onChangeText={(value) => {
            setCode(value);
            setError(null);
            setRegistrationError(null);
            setValidCode(null);
          }}
        />
        <Key label="Consultar medidor" onPress={handleConsult} />
      </Plate>

      {error ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.error}>{error}</Text>
        </Plate>
      ) : null}
      {registrationError ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.error}>{registrationError}</Text>
        </Plate>
      ) : null}

      {meterQuery.isLoading ? (
        <Plate>
          <Text style={styles.plateText}>Cargando...</Text>
        </Plate>
      ) : null}
      {!meterQuery.data && meterQuery.error instanceof MeterNotFoundError ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.error}>Medidor no encontrado</Text>
        </Plate>
      ) : null}
      {!meterQuery.data && meterQuery.error instanceof MeterNetworkError ? (
        <>
          <Plate style={styles.errorPlate}>
            <Text style={styles.error}>
              Sin conexión y este medidor no está en caché
            </Text>
            <Key
              label="Registrar sin datos del medidor"
              variant="secondary"
              disabled={isStartingDraft}
              onPress={() => void handleStartDraft(null)}
            />
          </Plate>
        </>
      ) : null}
      {!meterQuery.data &&
      meterQuery.error &&
      !(meterQuery.error instanceof MeterNotFoundError) &&
      !(meterQuery.error instanceof MeterNetworkError) ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.error}>
            No se pudo consultar el medidor: {meterQuery.error.message}
          </Text>
        </Plate>
      ) : null}
      {meterQuery.data ? (
        <>
          <Plate style={styles.meterCard}>
            <View style={styles.meterHeader}>
              <Text style={styles.meterTitle}>{meterQuery.data.code}</Text>
              <Text style={styles.statusChip}>MEDIDOR</Text>
            </View>
            <View style={styles.meterDetails}>
              {[
                ["Dirección", meterQuery.data.address],
                ["Sector", meterQuery.data.sector],
                ["Número de cuenta", meterQuery.data.accountNumber],
                ["Estado", meterQuery.data.condition],
                ["Última lectura", String(meterQuery.data.lastReading)],
                ["Fecha de última lectura", meterQuery.data.lastReadingDate],
                [
                  "Consumo promedio mensual",
                  String(meterQuery.data.averageMonthlyConsumption),
                ],
              ].map(([label, value], index) => (
                <View key={label} style={styles.meterRow}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowValue}>{value}</Text>
                </View>
              ))}
            </View>
          </Plate>
          <Key
            label="Registrar lectura"
            disabled={isStartingDraft}
            onPress={() => void handleStartDraft(meterQuery.data)}
          />
          {pendingCorrection && validCode ? (
            <Key
              label="Corregir lectura pendiente"
              variant="secondary"
              onPress={async () => {
                const existing = await getReadingByMeterMonth(
                  db,
                  validCode,
                  currentMonthYear()
                );
                if (existing) {
                  await handleCorrectExisting(existing);
                }
              }}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  meterCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.title,
  },
  eyebrow: {
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondaryBlue,
  },
  meterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  meterTitle: {
    fontSize: typography.subtitle,
    fontWeight: "800",
    color: colors.deepBlue,
  },
  statusChip: {
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    fontSize: typography.small,
    fontWeight: "700",
    color: colors.secondaryBlue,
  },
  meterDetails: {
    gap: spacing.xs,
  },
  meterRow: {
    minHeight: dimensions.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  separator: {
    height: borders.thin,
    backgroundColor: colors.border,
  },
  rowLabel: {
    fontSize: typography.label,
    fontWeight: "600",
    flex: 1,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: typography.body,
    flex: 1,
    fontWeight: "600",
    textAlign: "right",
    color: colors.textPrimary,
  },
  plateText: {
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  errorPlate: {
    borderLeftWidth: borders.errorStripe,
    borderLeftColor: colors.error,
    backgroundColor: colors.surfaceSecondary,
  },
  error: {
    fontSize: typography.body,
    color: colors.error,
  },
  heading: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: typography.body * 1.5,
    color: colors.textSecondary,
  },
});
