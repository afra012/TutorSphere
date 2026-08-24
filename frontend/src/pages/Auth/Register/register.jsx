import { useState } from "react";
import api from "../../../api/axios";
import "./Register.css";

function Register({
  onClose,
  onLogin,
  onRegisterSuccess,
}) {
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

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!agree) {
      setError(
        "Please agree to the Terms & Conditions."
      );
      return;
    }

    try {
      const backendRole =
        role === "Tutor"
          ? "teacher"
          : "student";

      const response = await api.post(
        "/register",
        {
          name,
          email,
          password,
          role: backendRole,
        }
      );

      const user = response.data.user;
      const token = response.data.token;

      // Save Sanctum token
      localStorage.setItem(
        "authToken",
        token
      );

      // Save user
      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      // Save login state
      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // Save role
      localStorage.setItem(
        "role",
        backendRole
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setAgree(false);

      if (onRegisterSuccess) {
        onRegisterSuccess(backendRole);
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (error.response?.data?.errors) {
        const errors =
          error.response.data.errors;

        setError(
          Object.values(errors)[0]?.[0] ||
            "Registration validation failed."
        );
      } else {
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
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          className="register-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Register</h2>

        <p className="register-subtitle">
          Create your TutorSphere account in
          minutes.
        </p>

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

        <div className="register-group">
          <label>Register As</label>

          <div className="register-roles">
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

        <div className="register-group">
          <label>Email</label>

          <div className="register-input">
            <span>✉</span>

            <input
              type="email"
              placeholder="afraran11@gmail.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

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

        <label className="terms">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(
                e.target.checked
              );
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

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="register-submit"
          onClick={handleSubmit}
        >
          Register
        </button>

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