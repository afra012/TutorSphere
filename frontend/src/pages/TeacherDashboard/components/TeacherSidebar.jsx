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

    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    profile: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
      </>
    ),

    post: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </>
    ),

    chat: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
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
  ["View Post", "post", "/teacher-posts"],
  ["Location", "location", "/location"],
  ["Chat", "chat", "/chat"],
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