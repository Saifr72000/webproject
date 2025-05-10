import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Always send cookies (access_token & refresh_token)
  axios.defaults.withCredentials = true;

  // Check if there's an active session on first load
  useEffect(() => {
    const refreshSession = async () => {
      try {
        await axios.post(`${BASE_URL}/api/auth/refresh-token`);
        const response = await axios.get(`${BASE_URL}/api/users/me`);
        setUser(response.data);
        console.log("User from /me:", response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    refreshSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    setUser(response.data.user);
  };

  // Logout function
  const logout = async () => {
    await axios.post(`${BASE_URL}/api/auth/logout`);
    setUser(null);
  };

  const register = async (firstName, lastName, email, password) => {
    await axios.post(`${BASE_URL}/api/users/register`, {
      firstName,
      lastName,
      email,
      password,
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
