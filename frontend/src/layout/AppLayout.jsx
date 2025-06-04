import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./AppLayout.css";
import { useAuth } from "../context/AuthContext";
const AppLayout = () => {
  const { logout } = useAuth();
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <nav className="nav">
          <div className="nav-container">
            <NavLink to="/studies" className="nav-link">
              Studies
            </NavLink>
            <NavLink to="/create-study" className="nav-link">
              Create Study
            </NavLink>
          </div>
          <div className="nav-container">
            <button onClick={logout} className="primary-btn">
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
