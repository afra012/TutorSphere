import { useLocation, useNavigate } from "react-router-dom";

import "./TeacherSidebar.css";

function Icon({ name }) {
  const paths = {
    dashboard: (
      <path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" />
    ),

    requests: (
      <>
        <path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9" />
        <path d="m13 12 7-7 2 2-7 7-3 1 1-3Z" />
      </>
    ),

    reviews: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),

    profile: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </>
    ),
  };

  return (
    <svg
      className="teacher-sidebar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const items = [
  ["Dashboard", "dashboard", "/teacher-dashboard"],
  ["Requests", "requests", "/teacher-requests"],
  ["Reviews", "reviews", "/teacher-reviews"],
  ["Profile", "profile", "/teacher-profile"],
];

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.clear();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <aside
      className="teacher-sidebar"
      aria-label="Teacher dashboard navigation"
    >

      <nav className="teacher-sidebar-nav">

        {items.map(([label, icon, path]) => (
          <button
            key={label}
            type="button"
            className={`teacher-sidebar-link ${
              location.pathname === path ? "is-active" : ""
            }`}
            onClick={() => navigate(path)}
          >
            <Icon name={icon} />

            <span>{label}</span>
          </button>
        ))}

        <button
          type="button"
          className="teacher-sidebar-link teacher-sidebar-logout"
          onClick={handleLogout}
        >
          <Icon name="logout" />

          <span>Logout</span>
        </button>

      </nav>



    </aside>
  );
}