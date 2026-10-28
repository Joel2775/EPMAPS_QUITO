import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Field } from "@/components/ui/Field";
import { Key } from "@/components/ui/Key";
import { Plate } from "@/components/ui/Plate";
import { Screen } from "@/components/ui/Screen";
import { useSessionStore } from "@/store/session";
import { borders, colors, radius, spacing, typography } from "@/theme/tokens";

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
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>E</Text>
        </View>
        <Text style={styles.eyebrow}>EPMAPS · OPERACIÓN EN CAMPO</Text>
        <Text style={styles.title}>Lecturas EPMAPS</Text>
        <Text style={styles.subtitle}>Identifícate para continuar</Text>
      </View>
      <Plate>
        <Field
          label="Código de técnico"
          placeholder="Código de técnico"
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
        />
        <Field
          label="Clave"
          placeholder="Clave"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <View style={styles.errorPlate}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}
        <Key label="Ingresar" onPress={handleLogin} />
      </Plate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  brandMark: {
    width: spacing.huge,
    height: spacing.huge,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    borderRadius: radius.medium,
    backgroundColor: colors.electricBlue,
  },
  brandLetter: {
    fontSize: typography.subtitle,
    fontWeight: "800",
    color: colors.surface,
  },
  eyebrow: {
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.secondaryBlue,
  },
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.deepBlue,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  errorPlate: {
    borderLeftWidth: borders.errorStripe,
    borderLeftColor: colors.error,
    borderRadius: radius.small,
    backgroundColor: colors.surfaceSecondary,
  },
  error: {
    fontSize: typography.body,
    color: colors.error,
  },
});
