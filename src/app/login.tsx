import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useSessionStore } from "@/store/session";
import { colors, fontSizes, radii, spacing } from "@/theme/tokens";

export default function LoginScreen() {
  const login = useSessionStore((state) => state.login);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    if (login(code.trim(), password)) {
      setError(null);
      return;
    }

    setError("Código o clave incorrectos.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medidores EPMAPS</Text>
      <Text style={styles.subtitle}>Identifícate para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Código de técnico"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Clave"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Ingresar</Text>
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
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
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
