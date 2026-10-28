import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  calculateConsumption,
  isAnomalous,
  isPhotoRequired,
  parseReading,
} from "@/domain/consumption";
import { ensureCameraPermission, takePhoto } from "@/services/photos";
import { useDraftStore } from "@/store/draft";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function ReadingSummaryScreen() {
  const meter = useDraftStore((state) => state.meter);
  const condition = useDraftStore((state) => state.condition);
  const readingText = useDraftStore((state) => state.readingText);
  const reasonOrDamage = useDraftStore((state) => state.reasonOrDamage);
  const anomalyConfirmed = useDraftStore((state) => state.anomalyConfirmed);
  const clientId = useDraftStore((state) => state.clientId);
  const photoUri = useDraftStore((state) => state.photoUri);
  const setPhotoUri = useDraftStore((state) => state.setPhotoUri);
  const setStep = useDraftStore((state) => state.setStep);
  const [permissionStatus, setPermissionStatus] = useState<
    "unknown" | "granted" | "denied" | "blocked"
  >("unknown");

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  useEffect(() => {
    void (async () => {
      setPermissionStatus(await ensureCameraPermission());
    })();
  }, []);

  const reading = parseReading(readingText);
  const consumption =
    reading !== null && meter
      ? calculateConsumption(reading, meter.lastReading)
      : null;
  const anomalous =
    consumption !== null && meter
      ? isAnomalous(consumption, meter.averageMonthlyConsumption)
      : false;
  const photoRequired = condition ? isPhotoRequired(condition, anomalous) : false;
  const missingPhoto = photoRequired && !photoUri;
  const readyToSave = !missingPhoto;

  async function refreshPermission() {
    const nextStatus = await ensureCameraPermission();
    setPermissionStatus(nextStatus);
  }

  async function handleTakePhoto() {
    if (!clientId) {
      return;
    }

    const nextUri = await takePhoto(clientId);

    if (nextUri) {
      setPhotoUri(nextUri);
    }

    await refreshPermission();
  }

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
          {condition === "inaccesible" ? "Motivo" : "Descripción"}: {" "}
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

      <View style={styles.photoSection}>
        <Text style={styles.sectionLabel}>
          {photoRequired ? "Foto obligatoria" : "Foto opcional"}
        </Text>

        {permissionStatus === "denied" || permissionStatus === "blocked" ? (
          <>
            <Text style={styles.infoText}>
              La foto sirve como respaldo de la lectura ante reclamos.
            </Text>
            {permissionStatus === "denied" ? (
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void refreshPermission()}
              >
                <Text style={styles.secondaryButtonText}>Reintentar</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void Linking.openSettings()}
              >
                <Text style={styles.secondaryButtonText}>Abrir ajustes</Text>
              </Pressable>
            )}
          </>
        ) : null}

        {permissionStatus === "granted" ? (
          <>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={() => void handleTakePhoto()}
            >
              <Text style={styles.primaryButtonText}>
                {photoUri ? "Cambiar foto" : "Tomar foto"}
              </Text>
            </Pressable>

            {photoUri ? (
              <>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                  accessibilityLabel="Vista previa de la foto del medidor"
                />
                <Text style={styles.pathText}>{photoUri}</Text>
              </>
            ) : null}
          </>
        ) : null}

        {missingPhoto ? (
          <Text style={styles.errorText}>Falta la foto obligatoria</Text>
        ) : null}

        {readyToSave ? (
          <Text style={styles.successText}>Listo para guardar</Text>
        ) : null}
      </View>
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
  photoSection: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    color: colors.text,
  },
  primaryButton: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.primaryContrast,
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
    color: colors.text,
  },
  previewImage: {
    width: "100%",
    minHeight: 220,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  pathText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  infoText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.danger,
  },
  successText: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.success,
  },
});
