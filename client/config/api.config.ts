export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    // If accessing via LAN IP (e.g. 192.168.x.x) or domain instead of localhost,
    // match the hostname so external/mobile clients don't query their own device
    if (currentHost && currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      try {
        const parsed = new URL(envUrl);
        parsed.hostname = currentHost;
        return parsed.origin;
      } catch {
        return `http://${currentHost}:3001`;
      }
    }
  }
  return envUrl;
}

export const API_CONFIG = {
  get baseURL() {
    return getApiBaseUrl();
  },
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

