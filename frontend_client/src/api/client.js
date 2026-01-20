/**
 * Lightweight API client for the Recipe Explorer backend.
 * Uses REACT_APP_API_BASE (preferred) to configure the base URL, e.g.:
 *   REACT_APP_API_BASE=http://localhost:3011/api
 */

/**
 * PUBLIC_INTERFACE
 */
export function getApiBaseUrl() {
  /** Resolve API base from env; default to FastAPI local dev URL. */
  const fromEnv =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_API_BASE) ||
    "";

  const trimmed = (fromEnv || "").trim();
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, "") : "http://localhost:3011/api";
}

function buildUrl(path) {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * PUBLIC_INTERFACE
 */
export async function apiRequest(path, options = {}) {
  /**
   * Generic request helper.
   * - Adds JSON headers by default
   * - Parses JSON responses
   * - Throws with status + body on non-2xx
   */
  const url = buildUrl(path);

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const err = new Error(`API request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
