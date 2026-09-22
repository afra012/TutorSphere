import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

import Login from "../../pages/Auth/Login/login";
import Register from "../../pages/Auth/Register/register";

const API_URL = "http://127.0.0.1:8000/api";

function Navbar({
  hideLinks = false,
  dashboardMode = false,
  role = null,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  let currentUser = null;

  const savedUser =
    localStorage.getItem("currentUser");

  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      currentUser = null;
    }
  }

  const storedRole =
    localStorage.getItem("role");

  let actualRole = "student";

  if (currentUser?.role) {
    actualRole = currentUser.role;
  } else if (storedRole) {
    actualRole = storedRole;
  } else if (role) {
    actualRole = role;
  }

  const normalizedRole =
    String(actualRole).toLowerCase();

  let currentRole = "Student";

  if (normalizedRole === "admin") {
    currentRole = "Admin";
  } else if (normalizedRole === "teacher") {
    currentRole = "Teacher";
  }

  /*
  |--------------------------------------------------------------------------
  | FETCH NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const fetchNotifications = async () => {
    if (normalizedRole !== "teacher") {
      return;
    }

    const token =
      localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      setNotificationLoading(true);

      const response = await fetch(
        `${API_URL}/teacher/tuition-request-notifications`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );

      setUnreadCount(
        Number(data.unread_count || 0)
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      dashboardMode &&
      normalizedRole === "teacher"
    ) {
      fetchNotifications();
    }
  }, [dashboardMode, normalizedRole]);

  /*
  |--------------------------------------------------------------------------
  | MARK NOTIFICATIONS READ
  |--------------------------------------------------------------------------
  */

  const markNotificationsRead = async () => {
    const token =
      localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teacher/tuition-request-notifications/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not mark notifications as read."
        );
      }

      setUnreadCount(0);

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: 1,
            })
          )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BELL CLICK
  |--------------------------------------------------------------------------
  */

  const handleNotificationClick = async () => {
    const willOpen =
      !notificationOpen;

    setNotificationOpen(willOpen);

    if (willOpen) {
      await fetchNotifications();

      await markNotificationsRead();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE NOTIFICATION
  |--------------------------------------------------------------------------
  */

  const handleDeleteNotification = async (
    event,
    notification
  ) => {
    // Card click বন্ধ করবে
    event.preventDefault();
    event.stopPropagation();

    const token =
      localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teacher/tuition-request-notifications/${notification.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not delete notification."
        );
      }

      // UI থেকে remove
      setNotifications(
        (currentNotifications) =>
          currentNotifications.filter(
            (item) =>
              item.id !== notification.id
          )
      );

      // যদি unread থাকে count কমাবে
      if (
        Number(notification.is_read) === 0
      ) {
        setUnreadCount(
          (currentCount) =>
            Math.max(
              0,
              currentCount - 1
            )
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

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

    const userRole =
      String(
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
    } else if (
      userRole === "teacher"
    ) {
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

    const userRole =
      String(
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
      localStorage.getItem(
        "currentUser"
      );

    if (savedCurrentUser) {
      try {
        user =
          JSON.parse(savedCurrentUser);
      } catch (error) {
        user = null;
      }
    }

    const savedRole =
      localStorage.getItem("role");

    let profileRole = "student";

    if (user?.role) {
      profileRole =
        String(
          user.role
        ).toLowerCase();
    } else if (savedRole) {
      profileRole =
        String(
          savedRole
        ).toLowerCase();
    }

    if (profileRole === "admin") {
      navigate("/admin-profile");
    } else if (
      profileRole === "teacher"
    ) {
      navigate("/teacher-profile");
    } else {
      navigate("/student-profile");
    }

    setMenuOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatNotificationDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
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
              setMenuOpen(
                !menuOpen
              )
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

                {/* =========================
                    NOTIFICATION
                ========================= */}

                <div className="notification-wrapper">

                  {/* BELL */}

                  <button
                    type="button"
                    className="notification-button"
                    onClick={
                      handleNotificationClick
                    }
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

                    {/* UNREAD COUNT */}

                    {normalizedRole ===
                      "teacher" &&
                      unreadCount > 0 && (
                        <span className="notification-count">
                          {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                        </span>
                      )}
                  </button>

                  {/* =========================
                      DROPDOWN
                  ========================= */}

                  {normalizedRole ===
                    "teacher" &&
                    notificationOpen && (

                    <div className="notification-dropdown">

                      {/* HEADER */}

                      <div className="notification-dropdown-header">

                        <strong>
                          Notifications
                        </strong>

                      </div>

                      {/* BODY */}

                      <div className="notification-dropdown-body">

                        {notificationLoading ? (

                          <div className="notification-empty">
                            Loading...
                          </div>

                        ) : notifications.length === 0 ? (

                          <div className="notification-empty">
                            No notifications yet.
                          </div>

                        ) : (

                          notifications.map(
                            (notification) => (

                              <div
                                key={
                                  notification.id
                                }

                                className={`notification-item ${
                                  Number(
                                    notification.is_read
                                  ) === 0
                                    ? "notification-unread"
                                    : ""
                                }`}

                                role="button"

                                tabIndex={0}

                                onClick={() => {
                                  setNotificationOpen(
                                    false
                                  );

                                  navigate(
                                    "/teacher-requests"
                                  );
                                }}

                                onKeyDown={(event) => {
                                  if (
                                    event.key ===
                                      "Enter" ||
                                    event.key ===
                                      " "
                                  ) {
                                    event.preventDefault();

                                    setNotificationOpen(
                                      false
                                    );

                                    navigate(
                                      "/teacher-requests"
                                    );
                                  }
                                }}
                              >

                                {/* MAIL ICON */}

                                <div className="notification-item-icon">
                                  ✉
                                </div>

                                {/* TEXT */}

                                <div className="notification-item-text">

                                  <strong>
                                    Tutor Request
                                  </strong>

                                  <p>
                                    {
                                      notification.message
                                    }
                                  </p>

                                  <div className="notification-item-bottom">

                                    <small>
                                      {formatNotificationDate(
                                        notification.created_at
                                      )}
                                    </small>

                                  </div>

                                </div>

                                {/* =========================
                                    DELETE X
                                ========================= */}

                                <button
                                  type="button"

                                  className="notification-delete-button"

                                  aria-label="Delete notification"

                                  title="Delete notification"

                                  onClick={(event) =>
                                    handleDeleteNotification(
                                      event,
                                      notification
                                    )
                                  }

                                  style={{
                                    marginLeft: "auto",
                                    flexShrink: 0,

                                    width: "28px",
                                    height: "28px",

                                    padding: 0,

                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",

                                    border: "none",
                                    borderRadius: "50%",

                                    background: "#f5f1ff",

                                    color: "#6b5d7d",

                                    fontSize: "20px",
                                    fontWeight: "500",
                                    lineHeight: "1",

                                    cursor: "pointer",

                                    zIndex: 5,
                                  }}
                                >
                                  ×
                                </button>

                              </div>

                            )
                          )

                        )}

                      </div>

                    </div>

                  )}

                </div>

                {/* =========================
                    PROFILE
                ========================= */}

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
                      : currentRole.charAt(
                          0
                        )}

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

                    setRegisterOpen(
                      false
                    );

                    setMenuOpen(false);
                  }}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="register-button"

                  onClick={() => {
                    setRegisterOpen(
                      true
                    );

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