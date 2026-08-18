import { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register({ onClose, onLogin, onRegisterSuccess }) {
  const [role, setRole] = useState("Tutor");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Required fields
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Terms validation
    if (!agree) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      // Send registration data to Laravel
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register",
        {
          name: name,
          email: email,
          password: password,

          // Convert frontend role to backend role
          role: role === "Tutor" ? "teacher" : "student",
        }
      );

      // Save Sanctum token
      localStorage.setItem(
        "authToken",
        response.data.token
      );

      // Save logged-in user information
      localStorage.setItem(
        "currentUser",
        JSON.stringify(response.data.user)
      );

      // Clear form after successful registration
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setAgree(false);

      // Registration successful
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

    } catch (error) {
      // Laravel validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        setError(
          Object.values(errors)[0][0]
        );
      } else {
        // Other Laravel/API errors
        setError(
          error.response?.data?.message ||
          "Registration failed. Please try again."
        );
      }
    }
  };

  return (
    <div
      className="register-overlay"
      onClick={onClose}
    >
      <div
        className="register-card"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close */}
        <button
          className="register-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        {/* Heading */}
        <h2>Register</h2>

        <p className="register-subtitle">
          Create your TutorSphere account in minutes.
        </p>

        {/* Full Name */}
        <div className="register-group">
          <label>Full Name</label>

          <div className="register-input">
            <span>♙</span>

            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Register As */}
        <div className="register-group">
          <label>Register As</label>

          <div className="register-roles">

            {/* Teacher */}
            <button
              type="button"
              className={
                role === "Tutor"
                  ? "register-role active"
                  : "register-role"
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
                  ? "register-role active"
                  : "register-role"
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
        <div className="register-group">
          <label>Email</label>

          <div className="register-input">
            <span>✉</span>

            <input
              type="email"
              name="email"
              placeholder="afraran11@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div className="register-group">
          <label>Password</label>

          <div className="register-input">
            <span>🔒</span>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Terms */}
        <label className="terms">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              setError("");
            }}
          />

          <span>
            I agree to{" "}
            <a href="/terms">
              Terms & Conditions
            </a>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        {/* Register */}
        <button
          type="button"
          className="register-submit"
          onClick={handleSubmit}
        >
          Register
        </button>

        {/* Login */}
        <p className="register-bottom">
          Already have an account?{" "}

          <button
            type="button"
            onClick={onLogin}
          >
            Log in
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;