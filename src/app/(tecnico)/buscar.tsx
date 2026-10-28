import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { meterCodeSchema } from "@/schemas/meter";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function MeterSearchScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validCode, setValidCode] = useState<string | null>(null);

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
        onChangeText={setCode}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {validCode ? (
        <Text style={styles.success}>Código válido: {validCode}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={handleConsult}
      >
        <Text style={styles.buttonText}>Consultar</Text>
      </Pressable>
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
  success: {
    fontSize: fontSizes.md,
    color: colors.success,
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
