import { useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const items = [
  ["Dashboard", "/admin-dashboard"],
  ["Review Management", "/admin-reviews"],
  ["Admin Management", "/admin-management"],
  ["My Profile", "/admin-profile"],
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    ["authToken", "currentUser", "isLoggedIn", "role", "pendingAdminEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );
    navigate("/");
  };

  return (
    <aside className="admin-sidebar" aria-label="Admin dashboard navigation">
      <nav className="admin-sidebar-nav">
        {items.map(([label, path]) => (
          <button
            key={path}
            type="button"
            className={`admin-sidebar-link ${location.pathname === path ? "is-active" : ""}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
        <div className="admin-sidebar-spacer" />
        <button
          type="button"
          className="admin-sidebar-link admin-sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
