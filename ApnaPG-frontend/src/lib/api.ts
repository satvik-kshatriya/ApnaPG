import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

// Configure an Axios interceptor that automatically attaches the Clerk JWT Bearer token
api.interceptors.request.use(async (config) => {
  // Wait for the window.Clerk object to be available to grab the active session
  // @ts-expect-error Clerk is injected globally by ClerkProvider
  if (window.Clerk && window.Clerk.session) {
    // @ts-expect-error
    const token = await window.Clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
