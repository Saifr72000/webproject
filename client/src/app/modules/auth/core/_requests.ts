// ✅ Updated _requests.tsx
import axios from "axios";
import { UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const LOGIN_URL = `${API_URL}/auth/login`;
export const REQUEST_PASSWORD_URL = `${API_URL}/auth/forgot_password`; //this is not developed yet
export const LOGOUT_URL = `${API_URL}/auth/logout`;
export const REFRESH_URL = `${API_URL}/auth/refresh-token`;
export const REGISTER_URL = `${API_URL}/users/register`;
export const GET_USER_URL = `${API_URL}/users/me`; // Replace /verify_token with your /me endpoint

export function login(email: string, password: string) {
  return axios.post(
    `${LOGIN_URL}`,
    { email, password },
    { withCredentials: true }
  );
}

export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    /* password_confirmation, */
  });
}

export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, { email });
}

export function getUserByToken() {
  return axios.get(GET_USER_URL, { withCredentials: true }).then((res) => {
    const user = res.data;

    // Map your backend response to UserModel structure
    const mappedUser: UserModel = {
      id: user.id,
      first_name: user.firstName, // 👈 convert from camelCase to snake_case
      last_name: user.lastName, // 👈 convert from camelCase to snake_case
      email: user.email,
      username: user.email,
      roles: [1],
      pic: undefined,
    };

    return { data: mappedUser };
  });
}

export function logoutRequest() {
  return axios.post(LOGOUT_URL, {}, { withCredentials: true });
}

export function refreshTokenRequest() {
  return axios.post(REFRESH_URL, {}, { withCredentials: true });
}
