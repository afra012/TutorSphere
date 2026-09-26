import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

import Login from "../../pages/Auth/Login/login";
import Register from "../../pages/Auth/Register/register";
import NotificationBell from "./NotificationBell";

function Navbar({
  hideLinks = false,
  dashboardMode = false,
  role = null,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  let currentUser = null;

  const savedUser = localStorage.getItem("currentUser");

  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      currentUser = null;
    }
  }

  const storedRole = localStorage.getItem("role");

  let actualRole = "student";

  if (currentUser?.role) {
    actualRole = currentUser.role;
  } else if (storedRole) {
    actualRole = storedRole;
  } else if (role) {
    actualRole = role;
  }

  const normalizedRole = String(actualRole).toLowerCase();

  let currentRole = "Student";

  if (normalizedRole === "admin") {
    currentRole = "Admin";
  } else if (normalizedRole === "teacher") {
    currentRole = "Teacher";
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN SUCCESS
  |--------------------------------------------------------------------------
  */

  const handleLoginSuccess = (user) => {
    setLoginOpen(false);

    if (!user) {
      return;
    }

    const userRole = String(
      user.role || "student"
    ).toLowerCase();

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...user,
        role: userRole,
      })
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    localStorage.setItem(
      "role",
      userRole
    );

    if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER SUCCESS
  |--------------------------------------------------------------------------
  */

  const handleRegisterSuccess = (user) => {
    setRegisterOpen(false);

    if (!user) {
      return;
    }

    const userRole = String(
      user.role || "student"
    ).toLowerCase();

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...user,
        role: userRole,
      })
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    localStorage.setItem(
      "role",
      userRole
    );

    if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PROFILE CLICK
  |--------------------------------------------------------------------------
  */

  const handleProfileClick = () => {
    let user = null;

    const savedCurrentUser =
      localStorage.getItem("currentUser");

    if (savedCurrentUser) {
      try {
        user = JSON.parse(savedCurrentUser);
      } catch (error) {
        user = null;
      }
    }

    const savedRole =
      localStorage.getItem("role");

    let profileRole = "student";

    if (user?.role) {
      profileRole = String(
        user.role
      ).toLowerCase();
    } else if (savedRole) {
      profileRole = String(
        savedRole
      ).toLowerCase();
    }

    if (profileRole === "admin") {
      navigate("/admin-profile");
    } else if (profileRole === "teacher") {
      navigate("/teacher-profile");
    } else {
      navigate("/student-profile");
    }

    setMenuOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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

          {/* LOGO */}

          <Link
            to="/"
            className="navbar-logo"
            onClick={() =>
              setMenuOpen(false)
            }
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

              <p>
                Find Your Perfect Tutor
              </p>
            </div>
          </Link>

          {/* MOBILE MENU */}

          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Open menu"
          >
            ☰
          </button>

          <div
            className={`navbar-content ${
              menuOpen ? "show" : ""
            }`}
          >

            {/* NORMAL LINKS */}

            {!hideLinks &&
              !dashboardMode && (
                <div className="navbar-links">

                  <Link
                    to="/"
                    className="nav-link"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Home
                  </Link>

                  <Link
                    to="/about"
                    className="nav-link"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    About Us
                  </Link>

                  <Link
                    to="/help"
                    className="nav-link"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Help
                  </Link>

                </div>
              )}

            {/* DASHBOARD */}

            {dashboardMode ? (

              <div className="dashboard-account-actions">

                {/* NOTIFICATION */}

                {normalizedRole !== "admin" && (
                  <NotificationBell
                    role={normalizedRole}
                  />
                )}

                {/* PROFILE */}

                <button
                  type="button"
                  className="profile-button"
                  onClick={
                    handleProfileClick
                  }
                >
                  <span className="profile-avatar">

                    {currentUser?.name
                      ? currentUser.name
                          .charAt(0)
                          .toUpperCase()
                      : currentRole
                          .charAt(0)}

                  </span>

                  <span className="profile-name">

                    <strong>
                      Hi
                    </strong>

                    <small>
                      {currentRole}
                    </small>

                  </span>

                  <span className="profile-chevron">
                    ›
                  </span>

                </button>

              </div>

            ) : (

              /* LOGIN / REGISTER */

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

      {/* LOGIN */}

      {loginOpen && (
        <Login
          onClose={() =>
            setLoginOpen(false)
          }

          onRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}

          onLoginSuccess={
            handleLoginSuccess
          }
        />
      )}

      {/* REGISTER */}

      {registerOpen && (
        <Register
          onClose={() =>
            setRegisterOpen(false)
          }

          onLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}

          onRegisterSuccess={
            handleRegisterSuccess
          }
        />
      )}

    </>
  );
}

export default Navbar;