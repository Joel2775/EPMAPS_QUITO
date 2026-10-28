import { z } from "zod";

import {
  calculateConsumption,
  isAnomalous,
  parseReading,
} from "@/domain/consumption";
import type { ReadingCondition } from "@/types";

type ReadingSchemaOptions = {
  condition: ReadingCondition;
  lastReading: number;
  average: number;
};

export function buildReadingSchema({
  condition,
  lastReading,
  average,
}: ReadingSchemaOptions) {
  return z
    .object({
      readingText: z.string(),
      reasonOrDamage: z.string(),
      anomalyConfirmed: z.boolean(),
    })
    .superRefine((values, context) => {
      const readingText = values.readingText.trim();
      const reasonOrDamage = values.reasonOrDamage.trim();

      if (condition === "normal" && readingText.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["readingText"],
          message: "Ingresa la lectura del medidor",
        });
      }

      if (condition === "inaccesible" && readingText.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["readingText"],
          message: "La lectura debe quedar vacía si el medidor es inaccesible",
        });
      }

      if (condition === "inaccesible" && reasonOrDamage.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["reasonOrDamage"],
          message: "Ingresa el motivo de inaccesibilidad",
        });
      }

      if (condition === "dañado" && reasonOrDamage.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["reasonOrDamage"],
          message: "Describe el daño del medidor",
        });
      }

      if (readingText.length === 0) {
        return;
      }

      const reading = parseReading(readingText);

      if (reading === null) {
        context.addIssue({
          code: "custom",
          path: ["readingText"],
          message: "Ingresa un número no negativo con coma o punto decimal",
        });
        return;
      }

      const consumption = calculateConsumption(reading, lastReading);
      if (isAnomalous(consumption, average) && !values.anomalyConfirmed) {
        context.addIssue({
          code: "custom",
          path: ["anomalyConfirmed"],
          message: "Confirma que revisaste el medidor",
        });
      }
    });
}
