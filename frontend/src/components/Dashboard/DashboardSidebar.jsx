import { useNavigate } from "react-router-dom";
import "./DashboardSidebar.css";

function Icon({ name }) {
  const paths = {
    dashboard: (
      <path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" />
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    post: (
      <>
        <path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9" />
        <path d="m13 12 7-7 2 2-7 7-3 1 1-3Z" />
      </>
    ),

    star: (
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
      className="sidebar-icon"
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
  ["Dashboard", "dashboard"],
  ["Find Tutor", "search"],
  ["My Post", "post"],
  ["My Reviews", "star"],
  ["Profile", "profile"],
];

export default function DashboardSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove saved authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Clear any session data
    sessionStorage.clear();

    // Go back to Home page
    navigate("/", { replace: true });
  };

  return (
    <aside
      className="dashboard-sidebar"
      aria-label="Dashboard navigation"
    >
      <nav className="sidebar-nav">
        {items.map(([label, icon], index) => (
          <button
            className={`sidebar-link ${
              index === 0 ? "is-active" : ""
            }`}
            type="button"
            key={label}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}

        <button
          className="sidebar-link sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          Logout
        </button>
      </nav>
    </aside>
  );
}