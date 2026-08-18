import { useState } from "react";
import "./Login.css";

function Login({ onClose, onRegister, onLoginSuccess }) {
  const [role, setRole] = useState("Student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    // Empty field validation
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Get registered users
    const users =
      JSON.parse(localStorage.getItem("tutorsphereUsers")) || [];

    // Normalize email
    const emailValue = email.trim().toLowerCase();

    // Find matching user
    const user = users.find(
      (item) =>
        item.email &&
        item.email.toLowerCase() === emailValue &&
        item.password === password &&
        item.role === role
    );

    // Invalid login
    if (!user) {
      setError("Invalid email, password, or role.");
      return;
    }

    // Save login information
    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    // Login successful
    if (onLoginSuccess) {
      onLoginSuccess();
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

        {/* Close */}
        <button
          className="close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        {/* Heading */}
        <h2>Login</h2>

        <p className="subtitle">
          Access your guardian or tutor dashboard.
        </p>

        {/* Login As */}
        <div className="form-group">
          <label>Login As</label>

          <div className="role-options">

            {/* Admin */}
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

            {/* Teacher */}
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

            {/* Student */}
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

        {/* Email */}
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

        {/* Password */}
        <div className="form-group password-group">
          <label>Password</label>

          <div className="input-wrapper">
            <span className="input-icon">🔒</span>

            <input
              type={showPassword ? "text" : "password"}
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

        {/* Forgot Password */}
        <div className="forgot-password">
          <button type="button">
            Forgot Password?
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          className="login-submit"
          onClick={handleSubmit}
        >
          Login
        </button>

        {/* Register */}
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