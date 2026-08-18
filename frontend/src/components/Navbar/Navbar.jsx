import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import "./Navbar.css";
import Login from "../../pages/Auth/Login/login";
import Register from "../../pages/Auth/Register/register";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <header className="navbar-container">
        <nav className="navbar">
          {/* Logo */}
          <a href="/" className="navbar-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M32 16C25 9 16 8 8 10V45C17 43 25 45 32 51V16Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />

                <path
                  d="M32 16C39 9 48 8 56 10V45C47 43 39 45 32 51V16Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="logo-text">
              <h2>TutorSphere</h2>
              <p>Find Your Perfect Tutor</p>
            </div>
          </a>

          {/* Mobile Menu */}
          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Navbar Content */}
          <div className={`navbar-content ${menuOpen ? "show" : ""}`}>
            <div className="navbar-links">
              <a href="/" className="nav-link active">
                Home
              </a>

              <a href="/about" className="nav-link">
                About Us
              </a>

              <a href="/job-dashboard" className="nav-link">
                Job Dashboard
              </a>

              <Link to="/reviews" className="nav-link">
                Reviews
              </Link>

              <a href="/help" className="nav-link">
                Help
              </a>
            </div>

            {/* Buttons */}
            <div className="navbar-buttons">
              {/* Login */}
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  setLoginOpen(true);
                  setRegisterOpen(false);
                  setMenuOpen(false);
                }}
              >
                Login
              </button>

              {/* Register */}
              <button
                type="button"
                className="register-button"
                onClick={() => {
                  setRegisterOpen(true);
                  setLoginOpen(false);
                  setMenuOpen(false);
                }}
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Login Modal */}
      {loginOpen && (
        <Login
          onClose={() => setLoginOpen(false)}
          onRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
          onLoginSuccess={() => {
            setLoginOpen(false);
            navigate("/job-dashboard");
          }}
        />
      )}

      {/* Register Modal */}
      {registerOpen && (
        <Register
          onClose={() => setRegisterOpen(false)}
          onLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
          onRegisterSuccess={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
        />
      )}
    </>
  );
}

export default Navbar;
