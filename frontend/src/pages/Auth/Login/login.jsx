import { useState } from "react";
import api from "../../../api/axios";
import "./Login.css";

function Login({ onClose, onRegister, onLoginSuccess }) {
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const backendRole =
        role === "Tutor"
          ? "teacher"
          : role === "Student"
            ? "student"
            : "admin";

      const response = await api.post("/login", {
        email: email.trim().toLowerCase(),
        password,
        role: backendRole,
      });

      const user = response.data.user;
      const token = response.data.token;

      // Save Sanctum token
      localStorage.setItem("authToken", token);

      // Save user
      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      // Save login status
      localStorage.setItem("isLoggedIn", "true");

      // Save role
      if (user?.role) {
        localStorage.setItem("role", user.role);
      }

      // Notify App
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        setError(
          Object.values(errors)[0]?.[0] ||
            "Login validation failed."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Login failed. Please try again."
        );
      }
    }
  };

  return (
    <div
      className="auth-overlay"
      onClick={onClose}
    >
      <div
        className="login-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <h2>Login</h2>

        <p className="subtitle">
          Access your guardian or tutor dashboard.
        </p>

        <div className="form-group">
          <label>Login As</label>

          <div className="role-options">
            <button
              type="button"
              className={
                role === "Admin"
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => {
                setRole("Admin");
                setError("");
              }}
            >
              <span>🛡</span>
              Admin
            </button>

            <button
              type="button"
              className={
                role === "Tutor"
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => {
                setRole("Tutor");
                setError("");
              }}
            >
              <span>🎓</span>
              Teacher
            </button>

            <button
              type="button"
              className={
                role === "Student"
                  ? "role-button active"
                  : "role-button"
              }
              onClick={() => {
                setRole("Student");
                setError("");
              }}
            >
              <span>♟</span>
              Student
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>

          <div className="input-wrapper">
            <span className="input-icon">✉</span>

            <input
              type="email"
              placeholder="afraran11@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>
        </div>

        <div className="form-group password-group">
          <label>Password</label>

          <div className="input-wrapper">
            <span className="input-icon">🔒</span>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>
        </div>

        <div className="forgot-password">
          <button type="button">
            Forgot Password?
          </button>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="login-submit"
          onClick={handleSubmit}
        >
          Login
        </button>

        <p className="bottom-text">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={onRegister}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;