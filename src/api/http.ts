import { getToken } from "../auth/tokenStorage";

const DEFAULT_BASE_URL = "http://localhost:8080/api/v1";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiRequestOptions = {
  includeAuth?: boolean;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizeBearerToken(token: string): string {
  const trimmed = token.trim();
  return trimmed.toLowerCase().startsWith("bearer ")
    ? trimmed.slice("bearer ".length).trim()
    : trimmed;
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractErrorMessage(raw: string): string {
  const parsed = tryParseJson(raw);

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim().length > 0) {
      return obj.message;
    }
    if (typeof obj.error === "string" && obj.error.trim().length > 0) {
      return obj.error;
    }
  }

  return raw;
}

/** Performs an API request and parses JSON safely. */
export async function apiRequest<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const includeAuth = options?.includeAuth ?? true;

  const storedToken = getToken();
  const token = storedToken ? normalizeBearerToken(storedToken) : null;

  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
      ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    const msg = extractErrorMessage(raw) || `Request failed: ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  if (res.status === 204 || raw.trim().length === 0) {
    return undefined as T;
  }

  const parsed = tryParseJson(raw);
  if (parsed === null) {
    throw new ApiError("Resposta inválida do servidor.", res.status);
  }

  return parsed as T;
}
