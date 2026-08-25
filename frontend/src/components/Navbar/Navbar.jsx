import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Navbar.css";

import Login from "../../pages/Auth/Login/login";
import Register from "../../pages/Auth/Register/register";

function Navbar({
  hideLinks = false,
  dashboardMode = false,
  role = "student",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const navigate = useNavigate();

  const currentRole =
    role?.toLowerCase() === "teacher"
      ? "Teacher"
      : "Student";

  /* =========================================================
     LOGIN SUCCESS
  ========================================================= */

  const handleLoginSuccess = (user) => {
    setLoginOpen(false);

    const userRole = user?.role?.toLowerCase();

    if (userRole === "student") {
      navigate("/student-dashboard");
    } else if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  /* =========================================================
     REGISTER SUCCESS
  ========================================================= */

  const handleRegisterSuccess = (registeredRole) => {
    setRegisterOpen(false);

    const userRole = registeredRole?.toLowerCase();

    if (userRole === "student") {
      navigate("/student-dashboard");
    } else if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/");
    }
  };

  /* =========================================================
     PROFILE CLICK
  ========================================================= */

  const handleProfileClick = () => {
    const userRole = role?.toLowerCase();

    if (userRole === "teacher") {
      navigate("/teacher-profile");
    } else {
      navigate("/student-profile");
    }

    setMenuOpen(false);
  };

  return (
    <>
      <header
        className={`navbar-container ${
          dashboardMode
            ? "dashboard-navbar-container"
            : ""
        }`}
      >
        <nav className="navbar">

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={() => setMenuOpen(false)}
          >
            <div className="logo-icon">
              <svg
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
              >
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
          </Link>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* =================================================
              NAVBAR CONTENT
          ================================================= */}

          <div
            className={`navbar-content ${
              menuOpen ? "show" : ""
            }`}
          >

            {/* =================================================
                PUBLIC NAVIGATION
            ================================================= */}

            {!hideLinks && !dashboardMode && (
              <div className="navbar-links">

                <Link
                  to="/"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  About Us
                </Link>

                <Link
                  to="/help"
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Help
                </Link>

              </div>
            )}

            {/* =================================================
                DASHBOARD NAVBAR
            ================================================= */}

            {dashboardMode ? (
              <div className="dashboard-account-actions">

                {/* Notification */}

                <button
                  type="button"
                  className="notification-button"
                  aria-label="Notifications"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />
                  </svg>

                  <i></i>
                </button>

                {/* Profile */}

                <button
                  type="button"
                  className="profile-button"
                  onClick={handleProfileClick}
                >
                  <span className="profile-avatar">
                    {currentRole.charAt(0)}
                  </span>

                  <span className="profile-name">
                    <strong>Hi</strong>
                    <small>{currentRole}</small>
                  </span>

                  <span className="profile-chevron">
                    ›
                  </span>
                </button>

              </div>
            ) : (

              /* =================================================
                 LOGIN / REGISTER
              ================================================= */

              <div className="navbar-buttons">

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
            )}

          </div>
        </nav>
      </header>

      {/* =================================================
          LOGIN MODAL
      ================================================= */}

      {loginOpen && (
        <Login
          onClose={() => setLoginOpen(false)}
          onRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* =================================================
          REGISTER MODAL
      ================================================= */}

      {registerOpen && (
        <Register
          onClose={() => setRegisterOpen(false)}
          onLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
}

export default Navbar;