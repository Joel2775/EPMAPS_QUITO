## Estado actual
- Skill 00-base ejecutada: SQLite (`readings`), tokens, `.env` con `EXPO_PUBLIC_API_URL`, tipos y layout raíz.
- Skill 01-sesion ejecutada: zustand instalado, técnicos quemados en `constants/tecnicos.ts`, sesión persistida con `expo-sqlite/kv-store` (solo `employeeCode`), login y rutas protegidas con `Stack.Protected`.
- `docs/CONTRATO.md` §5 actualizado: el store de sesión incluye `hasHydrated`.
- Skill 02-codigo ejecutada: Zod valida `MED-######` sin transformar; búsqueda local muestra error o confirmación sin consultar la API.
- Skill 03-consulta ejecutada: consulta de medidores por MockAPI, caché en memoria por 12 horas y presentación de los siete datos. Se agregaron estados diferenciados para no encontrado y falta de conexión. MockAPI omite `id`; el servicio normaliza el DTO usando el código exacto como identificador.
- `EXPO_PUBLIC_API_URL` está configurada. Pendiente verificar la consulta con conexión y modo avión en el teléfono.
- No existen ADR-001, ADR-002 ni ADR-004 en docs/adr; se usó el contrato como fuente.

## Próximos pasos
- Probar en el teléfono: `MED-000001` con señal, volver a consultarlo en modo avión sin recargar, consultar un código no almacenado en modo avión y comprobar `MED-999999` como no encontrado.
- Probar en la app los códigos inválidos `""`, `MED-123`, `MED-0000011`, `MED000001`, `med-000001` y `MED-00000A`; ninguno debe consultar la API.
- Probar en la app el flujo de sesión: credenciales inválidas, login, persistencia tras cerrar la app, logout y ausencia de parpadeo de `/login`.
