import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Pages
import LoginPage from "./pages/Login/LoginPage";
import StudiesPage from "./pages/Studies/StudyOverview";
import CreateStudy from "./pages/CreateStudy/CreateStudy";
import RegisterPage from "./pages/Register/RegisterPage";
// Layout
import AppLayout from "./layout/AppLayout";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected layout and nested pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="studies" element={<StudiesPage />} />
            <Route path="create-study" element={<CreateStudy />} />
            {/* Optional: default to /dashboard if no sub-route is provided */}
            <Route index element={<Navigate to="/studies" />} />
          </Route>

          {/* Catch-all: redirect unknown paths to dashboard or login */}
          <Route path="*" element={<Navigate to="/studies" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
