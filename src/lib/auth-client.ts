import { createAuthClient } from "better-auth/react";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  redirectTo: window.location.origin,
});
