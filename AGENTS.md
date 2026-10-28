# Medidores EPMAPS

App móvil para técnicos de EPMAPS (Quito): registrar lecturas de medidores de agua en campo, con foto, sin conexión y con envío automático. Prueba técnica ESFOT.

## Stack y estructura
- Expo SDK 57, TypeScript y Expo Router.
- Solo las dependencias de docs/CONTRATO.md sección 2.
- src/app: solo pantallas y layouts. src/db: único lugar con SQL. src/services: único acceso a MockAPI. src/store: único lugar con Zustand.

## Comandos
- Tipos: npx tsc --noEmit
- Instalar: npx expo install <paquete> (solo si el contrato lo permite)
- Ejecutar la app: npx expo start (solo cuando yo lo pida)

## Dónde está cada cosa
- docs/CONTRATO.md: nombres, API, esquema SQLite y reglas R1 a R10 (fuente única).
- docs/adr/: decisiones de tecnología.
- .opencode/skills/: una skill por tarea, numeradas.
- MEMORY.md: estado actual del trabajo.

## Cómo trabajar
1. Al empezar, lee MEMORY.md, docs/CONTRATO.md y el ADR de la skill que te pido.
2. Carga con la herramienta de skills solo la skill que te pido. No avances a la siguiente.
3. Código y nombres en inglés; textos de interfaz, comentarios y documentos en español.
4. Toca solo los archivos que la skill declara. Si necesitas un nombre o tipo nuevo, agrégalo primero a docs/CONTRATO.md y avísame.
5. Pregunta antes de instalar dependencias que el contrato no liste.
6. UI mínima con StyleSheet. Todo color y espaciado sale de src/theme/tokens.ts, hasta la skill 09.
7. Lo marcado "por verificar" en el contrato se comprueba en la documentación oficial del SDK 57. No lo asumas de memoria.
8. No reemplaces archivos existentes si la skill no lo pide. No guardes datos sensibles.
9. Al terminar: npx tsc --noEmit, actualiza MEMORY.md, escribe "Explicación para la defensa" (máximo 10 líneas: qué hiciste, por qué y en qué archivo) y sugiere el mensaje de commit. No hagas commit.

## MEMORY.md
Solo "Estado actual" y "Próximos pasos". Al terminar una skill actualiza únicamente esas dos secciones. Máximo 40 líneas.