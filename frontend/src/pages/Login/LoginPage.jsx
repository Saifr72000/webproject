import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";
import landingImg from "../../assets/studify-landing.png";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/studies"); // Go to requested page or /dashboard
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email:
            <input
              type="email"
              className="form-control"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password:
            <input
              className="form-control"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primary-btn" type="submit">
            Log In
          </button>
        </form>

        <div className="register">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
      <div className="logo-container">
        <img src={landingImg} alt="logo" />
      </div>
    </div>
  );
};

export default LoginPage;
