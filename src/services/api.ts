import { API_BASE_URL } from "@/constants/config";
import type { MeterDTO } from "@/types";

export class MeterNotFoundError extends Error {
  constructor(code: string) {
    super(`No se encontró el medidor ${code}.`);
    this.name = "MeterNotFoundError";
  }
}

export class MeterNetworkError extends Error {
  constructor(cause: unknown) {
    super("No se pudo conectar con el servicio de medidores.", { cause });
    this.name = "MeterNetworkError";
  }
}

function hasMeterFields(value: unknown): value is Omit<MeterDTO, "id"> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const meter = value as Record<string, unknown>;

  return (
    typeof meter.code === "string" &&
    typeof meter.accountNumber === "string" &&
    typeof meter.address === "string" &&
    typeof meter.sector === "string" &&
    typeof meter.condition === "string" &&
    typeof meter.lastReading === "number" &&
    typeof meter.lastReadingDate === "string" &&
    typeof meter.averageMonthlyConsumption === "number"
  );
}

export async function fetchMeterByCode(code: string): Promise<MeterDTO> {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/meters?code=${encodeURIComponent(code)}`
    );
  } catch (cause) {
    throw new MeterNetworkError(cause);
  }

  if (response.status === 404) {
    throw new MeterNotFoundError(code);
  }

  if (!response.ok) {
    throw new Error(`Error del servicio de medidores: HTTP ${response.status}.`);
  }

  let results: unknown;

  try {
    results = await response.json();
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      throw new Error(
        "La respuesta del servicio de medidores no es JSON válido.",
        { cause }
      );
    }

    throw new MeterNetworkError(cause);
  }

  if (!Array.isArray(results)) {
    throw new Error("La respuesta del servicio de medidores no es una lista.");
  }

  const meter = results.find(
    (item: unknown) =>
      typeof item === "object" &&
      item !== null &&
      "code" in item &&
      item.code === code
  );

  if (meter === undefined) {
    throw new MeterNotFoundError(code);
  }

  if (!hasMeterFields(meter)) {
    throw new Error("Los datos del medidor tienen un formato inválido.");
  }

  return {
    ...meter,
    id:
      "id" in meter && typeof meter.id === "string" ? meter.id : meter.code,
  };
}
