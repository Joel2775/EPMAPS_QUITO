import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Field } from "@/components/ui/Field";
import { Key } from "@/components/ui/Key";
import { Meter } from "@/components/ui/Meter";
import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";
import { StepHeader } from "@/components/ui/StepHeader";
import {
  calculateConsumption,
  isAnomalous,
  parseReading,
} from "@/domain/consumption";
import { buildReadingSchema } from "@/schemas/reading";
import { useDraftStore } from "@/store/draft";
import {
  borders,
  colors,
  dimensions,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
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
      <Screen>
        <Plate style={styles.errorPlate}>
          <Text style={styles.plateText}>
            Inicia el registro desde la búsqueda de un medidor.
          </Text>
        </Plate>
      </Screen>
    );
  }

  return (
    <Screen>
      <StepHeader currentStep={2} />
      <Text style={styles.title}>
        Medidor {meter?.code ?? meterCode ?? "Sin datos"}
      </Text>
      {!meter ? (
        <Plate style={styles.errorPlate}>
          <Text style={styles.plateText}>
            Sin conexión: se verificará la lectura al recuperar la conexión.
          </Text>
        </Plate>
      ) : null}
      {activeCondition === "inaccesible" ? (
        <Plate>
          <Text style={styles.plateText}>
            El medidor es inaccesible; no ingreses una lectura.
          </Text>
        </Plate>
      ) : (
        <Controller
          control={control}
          name="readingText"
          render={({ field }) => (
            <Plate>
              <Field
                accessibilityLabel="Lectura"
                label="Lectura"
                placeholder="Ej. 182 o 182,5"
                keyboardType="decimal-pad"
                value={field.value}
                onChangeText={field.onChange}
              />
              {errors.readingText?.message ? (
                <View style={styles.errorPlate}>
                  <Text style={styles.plateText}>
                    {errors.readingText.message}
                  </Text>
                </View>
              ) : null}
            </Plate>
          )}
        />
      )}

      {activeCondition !== "normal" ? (
        <Controller
          control={control}
          name="reasonOrDamage"
          render={({ field }) => (
            <Plate>
              <Field
                accessibilityLabel={reasonLabel}
                label={reasonLabel}
                placeholder={reasonLabel}
                multiline
                textAlignVertical="top"
                value={field.value}
                onChangeText={field.onChange}
                style={styles.multilineInput}
              />
              {errors.reasonOrDamage?.message ? (
                <View style={styles.errorPlate}>
                  <Text style={styles.plateText}>
                    {errors.reasonOrDamage.message}
                  </Text>
                </View>
              ) : null}
            </Plate>
          )}
        />
      ) : null}

      {consumption !== null ? (
        <Plate>
          <Meter label="Consumo" value={consumption} />
          {readingBelowPrevious ? (
            <Text style={styles.plateText}>
              La lectura es menor que la anterior ({meter?.lastReading});
              revisa el dato antes de continuar.
            </Text>
          ) : null}
          {anomalous ? (
            <View style={styles.warningPlate}>
              <Text style={styles.warning}>
                Consumo anómalo: supera tres veces el promedio mensual.
              </Text>
              <Controller
                control={control}
                name="anomalyConfirmed"
                render={({ field }) => (
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Revisé el medidor</Text>
                    <Switch
                      accessibilityLabel="Revisé el medidor"
                      value={field.value}
                      onValueChange={field.onChange}
                      thumbColor={colors.surface}
                      trackColor={{
                        false: colors.border,
                        true: colors.electricBlue,
                      }}
                      ios_backgroundColor={colors.border}
                    />
                  </View>
                )}
              />
            </View>
          ) : null}
          {errors.anomalyConfirmed?.message ? (
            <View style={styles.errorPlate}>
              <Text style={styles.plateText}>
                {errors.anomalyConfirmed.message}
              </Text>
            </View>
          ) : null}
        </Plate>
      ) : null}

      <Key
        label="Continuar"
        onPress={handleSubmit(handleContinue)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.title,
  },
  plateText: {
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  multilineInput: {
    minHeight: dimensions.multilineField,
  },
  warningPlate: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: borders.warning,
    borderColor: colors.error,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceSecondary,
  },
  warning: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.error,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  switchLabel: {
    fontSize: typography.label,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  errorPlate: {
    borderLeftWidth: borders.errorStripe,
    borderLeftColor: colors.error,
    backgroundColor: colors.surfaceSecondary,
  },
});
