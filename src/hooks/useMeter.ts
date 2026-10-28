import { useQuery } from "@tanstack/react-query";

import { fetchMeterByCode } from "@/services/api";
import { meterCodeSchema } from "@/schemas/meter";
import type { MeterDTO } from "@/types";

export function useMeter(code: string | null) {
  const isValidCode = code !== null && meterCodeSchema.safeParse(code).success;

  return useQuery<MeterDTO, Error>({
    queryKey: ["meter", code],
    queryFn: () => {
      if (code === null || !isValidCode) {
        throw new Error("El código del medidor no es válido.");
      }

      return fetchMeterByCode(code);
    },
    enabled: isValidCode,
    retry: false,
  });
}
