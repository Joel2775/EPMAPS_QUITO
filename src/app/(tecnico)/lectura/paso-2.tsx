import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  calculateConsumption,
  isAnomalous,
  parseReading,
} from "@/domain/consumption";
import { buildReadingSchema } from "@/schemas/reading";
import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";
import type { ReadingCondition } from "@/types";

type ReadingFormValues = {
  readingText: string;
  reasonOrDamage: string;
  anomalyConfirmed: boolean;
};

export default function ReadingDetailsScreen() {
  const meter = useDraftStore((state) => state.meter);
  const meterCode = useDraftStore((state) => state.meterCode);
  const condition = useDraftStore((state) => state.condition);
  const readingText = useDraftStore((state) => state.readingText);
  const reasonOrDamage = useDraftStore((state) => state.reasonOrDamage);
  const anomalyConfirmed = useDraftStore((state) => state.anomalyConfirmed);
  const setReadingData = useDraftStore((state) => state.setReadingData);
  const setStep = useDraftStore((state) => state.setStep);
  const activeCondition: ReadingCondition = condition ?? "normal";

  const schema = useMemo(
    () =>
      buildReadingSchema({
        condition: activeCondition,
        lastReading: meter?.lastReading ?? null,
        average: meter?.averageMonthlyConsumption ?? null,
      }),
    [activeCondition, meter]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReadingFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      readingText,
      reasonOrDamage,
      anomalyConfirmed,
    },
  });

  const watchedReadingText = watch("readingText");
  const watchedAnomalyConfirmed = watch("anomalyConfirmed");
  const parsedReading = parseReading(watchedReadingText);
  const consumption =
    parsedReading !== null && meter
      ? calculateConsumption(parsedReading, meter.lastReading)
      : null;
  const anomalous =
    consumption !== null && meter
      ? isAnomalous(consumption, meter.averageMonthlyConsumption)
      : false;
  const readingBelowPrevious =
    parsedReading !== null && meter
      ? parsedReading < meter.lastReading
      : false;

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    const subscription = watch((values) => {
      setReadingData({
        readingText: values.readingText ?? "",
        reasonOrDamage: values.reasonOrDamage ?? "",
        anomalyConfirmed: values.anomalyConfirmed ?? false,
      });
    });

    return () => subscription.unsubscribe();
  }, [setReadingData, watch]);

  useEffect(() => {
    if (!anomalous && watchedAnomalyConfirmed) {
      setValue("anomalyConfirmed", false, { shouldValidate: true });
    }
  }, [anomalous, setValue, watchedAnomalyConfirmed]);

  function handleContinue(values: ReadingFormValues) {
    setReadingData(values);
    router.push("/lectura/paso-3");
  }

  const reasonLabel =
    activeCondition === "inaccesible"
      ? "Motivo de inaccesibilidad"
      : "Descripción del daño";

  if (!condition) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Inicia el registro desde la búsqueda de un medidor.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Medidor {meter?.code ?? meterCode ?? "Sin datos"}
      </Text>
      {!meter ? (
        <Text style={styles.information}>
          Sin la lectura anterior: se verificará al recuperar la conexión
        </Text>
      ) : null}
      {activeCondition === "inaccesible" ? (
        <Text style={styles.message}>
          El medidor es inaccesible; no ingreses una lectura.
        </Text>
      ) : (
        <Controller
          control={control}
          name="readingText"
          render={({ field }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Lectura</Text>
              <TextInput
                accessibilityLabel="Lectura"
                style={styles.input}
                placeholder="Ej. 182 o 182,5"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={field.value}
                onChangeText={field.onChange}
              />
              {errors.readingText?.message ? (
                <Text style={styles.error}>{errors.readingText.message}</Text>
              ) : null}
            </View>
          )}
        />
      )}

      {activeCondition !== "normal" ? (
        <Controller
          control={control}
          name="reasonOrDamage"
          render={({ field }) => (
            <View style={styles.field}>
              <Text style={styles.label}>{reasonLabel}</Text>
              <TextInput
                accessibilityLabel={reasonLabel}
                style={[styles.input, styles.multilineInput]}
                placeholder={reasonLabel}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                value={field.value}
                onChangeText={field.onChange}
              />
              {errors.reasonOrDamage?.message ? (
                <Text style={styles.error}>
                  {errors.reasonOrDamage.message}
                </Text>
              ) : null}
            </View>
          )}
        />
      ) : null}

      {consumption !== null ? (
        <View style={styles.feedback}>
          <Text style={styles.message}>Consumo: {consumption}</Text>
          {readingBelowPrevious ? (
            <Text style={styles.information}>
              La lectura es menor que la anterior ({meter?.lastReading});
              revisa el dato antes de continuar.
            </Text>
          ) : null}
          {anomalous ? (
            <>
              <Text style={styles.warning}>
                Consumo anómalo: supera tres veces el promedio mensual.
              </Text>
              <Controller
                control={control}
                name="anomalyConfirmed"
                render={({ field }) => (
                  <View style={styles.switchRow}>
                    <Text style={styles.label}>Revisé el medidor</Text>
                    <Switch
                      accessibilityLabel="Revisé el medidor"
                      value={field.value}
                      onValueChange={field.onChange}
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                    />
                  </View>
                )}
              />
              {errors.anomalyConfirmed?.message ? (
                <Text style={styles.error}>
                  {errors.anomalyConfirmed.message}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={handleSubmit(handleContinue)}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </Pressable>
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
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: "600",
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
  multilineInput: {
    minHeight: 96,
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  information: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  warning: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.warning,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
  },
  feedback: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
