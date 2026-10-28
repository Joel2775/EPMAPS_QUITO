## Estado actual
- Skill 00-base ejecutada: SQLite (`readings`), tokens, `.env` con `EXPO_PUBLIC_API_URL`, tipos y layout raíz.
- Skill 01-sesion ejecutada: zustand instalado, técnicos quemados en `constants/tecnicos.ts`, sesión persistida con `expo-sqlite/kv-store` (solo `employeeCode`), login y rutas protegidas con `Stack.Protected`.
- `docs/CONTRATO.md` §5 actualizado: el store de sesión incluye `hasHydrated`.
- `npx tsc --noEmit` sin errores. Pendiente probar en la app: credenciales inválidas, login, persistencia tras cerrar la app, logout y ausencia de parpadeo de `/login`.
- No existen ADR-001, ADR-002 ni ADR-004 en docs/adr; se usó el contrato como fuente.

## Próximos pasos
- Probar el flujo de sesión en la app.
- Ejecutar la siguiente skill (02 no existe todavía).
