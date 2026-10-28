import { z } from "zod";

export const meterCodeSchema = z.string().regex(/^MED-\d{6}$/, {
  error: "Código inválido. Use MED- seguido de 6 dígitos.",
});
