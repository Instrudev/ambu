import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error("Error en la solicitud");
  }

  return response.json() as Promise<T>;
};
