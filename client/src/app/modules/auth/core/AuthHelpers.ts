/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";
import { logoutRequest, refreshTokenRequest } from "./_requests";

// No need for localStorage-based AuthModel anymore

export function setupAxios(axios: AxiosInstance, logoutCallback: () => void) {
  axios.defaults.withCredentials = true; // Send cookies with every request
  axios.defaults.headers.Accept = "application/json";

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Retry logic or logout (optional)
      // You can insert refresh handling here if needed later
      return Promise.reject(error);
    }
  );
}
