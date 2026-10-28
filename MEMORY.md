## Estado actual
- Skill 00-base ejecutada: SQLite (`readings`), tokens, `.env` con `EXPO_PUBLIC_API_URL`, tipos y layout raíz.
- Skill 01-sesion ejecutada: zustand instalado, técnicos quemados en `constants/tecnicos.ts`, sesión persistida con `expo-sqlite/kv-store` (solo `employeeCode`), login y rutas protegidas con `Stack.Protected`.
- `docs/CONTRATO.md` §5 actualizado: el store de sesión incluye `hasHydrated`.
- Skill 02-codigo ejecutada: Zod valida `MED-######` sin transformar; búsqueda local muestra error o confirmación sin consultar la API.
- `npx tsc --noEmit` sin errores tras las skills 00-02. Pendiente probar en la app: validación de códigos inválidos y `MED-000001`.
- No existen ADR-001, ADR-002 ni ADR-004 en docs/adr; se usó el contrato como fuente.

## Próximos pasos
- Probar en la app los códigos inválidos `""`, `MED-123`, `MED-0000011`, `MED000001`, `med-000001` y `MED-00000A`, y el válido `MED-000001`.
- Probar en la app el flujo de sesión: credenciales inválidas, login, persistencia tras cerrar la app, logout y ausencia de parpadeo de `/login`.
- Ejecutar la skill 03.
