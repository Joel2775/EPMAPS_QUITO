## Estado actual
- Buscar y Lecturas están agrupadas en `src/app/(tecnico)/(tabs)/`; el flujo de registro queda en rutas internas del grupo técnico.
- Se renovó la interfaz con superficies claras, jerarquía tipográfica, tarjetas suaves, botones táctiles y pestañas redondeadas; tokens concentrados en `src/theme/tokens.ts`.
- La barra de pestañas reserva el inset inferior del sistema y las pantallas conservan scroll, áreas seguras y adaptación al teclado.
- Las pestañas tienen iconos propios dibujados con StyleSheet, estados activo/inactivo y se ocultan al abrir el teclado.
- En el historial, la vista de cada lectura muestra medición para estados normal/dañado, descripción para inaccesible/dañado y foto solo para daño o consumo anómalo normal.
- `npx tsc --noEmit` pasó tras el rediseño. `git diff --check` no detectó errores de formato; no se modificaron dependencias ni lógica de negocio.
- `npx expo lint` había detectado dos errores de estado desde efectos y advertencias en los pasos; no están relacionados con el rediseño visual.
- Se eliminó el `eslint.config.js` generado automáticamente por Expo al ejecutar lint; no se cambiaron dependencias.
- No se ha comprobado visualmente el emulador.

## Próximos pasos
- Probar en teléfono/emulador el aspecto de las tarjetas, el encabezado, las pestañas y el espaciado en diferentes tamaños.
- Comprobar en el historial las variantes normal, inaccesible y dañado, además de navegación Android, áreas seguras, teclado, scroll y sincronización.
