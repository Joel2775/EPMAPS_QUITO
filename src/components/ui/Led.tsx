import { StyleSheet, View } from "react-native";

import { borders, colors, dimensions, radius } from "@/theme/tokens";

type LedProps = {
  connected: boolean;
  small?: boolean;
};

export function Led({ connected, small = false }: LedProps) {
  const size = small ? dimensions.smallLed : dimensions.led;

  return (
    <View
      accessibilityLabel={connected ? "Conectado" : "Sin conexión"}
      style={[
        styles.led,
        { width: size, height: size },
        connected ? styles.connected : styles.disconnected,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  led: {
    borderWidth: borders.plateLight,
    borderColor: colors.surface,
    borderRadius: radius.pill,
  },
  connected: {
    backgroundColor: colors.success,
  },
  disconnected: {
    backgroundColor: colors.error,
  },
});
