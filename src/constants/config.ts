const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error(
    "Falta EXPO_PUBLIC_API_URL. Copia .env.example a .env y define la URL base de MockAPI."
  );
}

export const API_BASE_URL = apiBaseUrl;
