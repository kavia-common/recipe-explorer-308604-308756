import { apiRequest } from "./client";

/**
 * PUBLIC_INTERFACE
 */
export async function checkHealth() {
  /** Calls backend health endpoint; returns response object. */
  return apiRequest("/health", { method: "GET" });
}
