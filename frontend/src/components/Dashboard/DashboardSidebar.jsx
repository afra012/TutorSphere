import { useNavigate } from "react-router-dom";

import "./DashboardSidebar.css";
import becomeTutorImage from "../../assets/teacher/become-tutor-reference.png";

function Icon({ name }) {
  const paths = {
    dashboard: (
      <path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" />
    ),

    messages: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-4-.9L3 21l1.7-4.1A8 8 0 1 1 21 11.5Z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </>
    ),

    browse: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    requests: (
      <>
        <path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9" />
        <path d="m13 12 7-7 2 2-7 7-3 1 1-3Z" />
      </>
    ),

    bookings: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    reviews: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),

    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3.2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
      </>
    ),

    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-.9 1.1-2 1.3-2 3M12 17h.01" />
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const items = [
  ["Dashboard", "dashboard", "/job-dashboard"],
  ["Messages", "messages", "/job-dashboard"],
  ["Browse Tutors", "browse", "/teacher-profile"],
  ["My Requests", "requests", "/job-dashboard"],
  ["My Bookings", "bookings", "/job-dashboard"],
  ["My Reviews", "reviews", "/job-dashboard"],
  ["Profile", "profile", "/profile"],
  ["Settings", "settings", "/job-dashboard"],
  ["Help & Support", "help", "/help"],
];

export default function DashboardSidebar({ active = "Browse Tutors" }) {
  const navigate = useNavigate();

  return (
    <aside
      className="dashboard-sidebar"
      aria-label="Student dashboard navigation"
    >
      <nav className="sidebar-nav">
        {items.map(([label, icon, path]) => (
          <button
            className={`sidebar-link ${
              active === label ? "is-active" : ""
            }`}
            type="button"
            key={label}
            onClick={() => navigate(path)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}

        <button
          className="sidebar-link sidebar-logout"
          type="button"
          onClick={() => navigate("/")}
        >
          <Icon name="logout" />
          <span>Logout</span>
        </button>

        <div className="become-tutor-card">
          <img src={becomeTutorImage} alt="" />
          <h3>Become a Tutor</h3>
          <p>
            Share your knowledge and help students achieve their goals.
          </p>
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Join as Tutor
          </button>
        </div>
      </nav>
    </aside>
  );
}