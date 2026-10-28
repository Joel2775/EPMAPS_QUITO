## Estado actual
- Skill 00-base ejecutada: SQLite (`readings`), tokens, `.env` con `EXPO_PUBLIC_API_URL`, tipos y layout raíz.
- Skill 01-sesion ejecutada: zustand instalado, técnicos quemados en `constants/tecnicos.ts`, sesión persistida con `expo-sqlite/kv-store` (solo `employeeCode`), login y rutas protegidas con `Stack.Protected`.
- `docs/CONTRATO.md` §5 actualizado: el store de sesión incluye `hasHydrated`.
- Skill 02-codigo ejecutada: Zod valida `MED-######` sin transformar; búsqueda local muestra error o confirmación sin consultar la API.
- Skill 03-consulta ejecutada: consulta de medidores por MockAPI, caché en memoria por 12 horas y presentación de los siete datos. Se agregaron estados diferenciados para no encontrado y falta de conexión. MockAPI omite `id`; el servicio normaliza el DTO usando el código exacto como identificador.
- Skill 04-formulario ejecutada: borrador persistido, pasos de estado/lectura/resumen, validación R5/R6, cálculo de consumo y confirmación de anomalías.
- Dependencias de formulario instaladas: `react-hook-form` y `@hookform/resolvers`; `zodResolver` tipado con Zod 4.
- `docs/CONTRATO.md` §3, §5 y §6 actualizado con `src/domain/`, los campos reales del borrador y la confirmación de R6 en paso 2.
- `npx tsc --noEmit` y pruebas enfocadas de reglas R5/R6 aprobadas; falta la prueba manual en el teléfono.
- `EXPO_PUBLIC_API_URL` está configurada. Pendiente verificar la consulta con conexión y modo avión en el teléfono.
- No existen ADR-001, ADR-002 ni ADR-004/005/006 en docs/adr; se usó el contrato como fuente.

## Próximos pasos
- Probar en la app: MED-000001, lectura 182 (consumo 54, sin anomalía) y 183 (consumo 55, aviso y confirmación); MED-000002, 428 (sin anomalía) y 429 (aviso).
- Probar validación: normal sin lectura; inaccesible sin motivo y con lectura; dañado sin descripción y con lectura vacía; volver de paso 2 a paso 1 y confirmar que se conservan los datos.
- Continuar con la skill 05 (foto) y la skill 06 (guardado local).
- Probar en el teléfono: `MED-000001` con señal, volver a consultarlo en modo avión sin recargar, consultar un código no almacenado en modo avión y comprobar `MED-999999` como no encontrado.
- Probar en la app los códigos inválidos `""`, `MED-123`, `MED-0000011`, `MED000001`, `med-000001` y `MED-00000A`; ninguno debe consultar la API.
- Probar en la app el flujo de sesión: credenciales inválidas, login, persistencia tras cerrar la app, logout y ausencia de parpadeo de `/login`.
