export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  googleClientId:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "218043177533-94dfqkfma0j928fjmksu8sakssrc82sv.apps.googleusercontent.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
