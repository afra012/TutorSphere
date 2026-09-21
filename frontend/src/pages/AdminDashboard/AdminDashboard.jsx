import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import Navbar from "../../components/Navbar/Navbar";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pending_reviews: 0,
    admins: 0,
  });

  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.clear();
          navigate("/");
          return;
        }

        if (response.status === 403) {
          navigate("/");
          return;
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    try {
      if (token) {
        await fetch(
          "http://127.0.0.1:8000/api/logout",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("pendingAdminEmail");

    navigate("/");
  };

  return (
    <>
      <Navbar dashboardMode={true} />

      <div className="admin-dashboard">
        <div className="admin-container">

          <div className="admin-header">
            <div className="admin-welcome">
              <div className="admin-badge">
                <span>🛡</span>
                Administrator
              </div>

              <h1>Admin Dashboard</h1>

              <p>
                Welcome back{" "}
                <strong>
                  {currentUser?.name || "Administrator"}
                </strong>
              </p>
            </div>

            <button
              type="button"
              className="admin-logout"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>
          </div>

          <div className="admin-stats">

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                👨‍🎓
              </div>

              <div>
                <span>Total Students</span>

                <strong>
                  {loading ? "..." : stats.students}
                </strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                👨‍🏫
              </div>

              <div>
                <span>Total Teachers</span>

                <strong>
                  {loading ? "..." : stats.teachers}
                </strong>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon">
                ⭐
              </div>

              <div>
                <span>Pending Reviews</span>

                <strong>
                  {loading
                    ? "..."
                    : stats.pending_reviews}
                </strong>
              </div>
            </div>

          </div>

          <div className="admin-cards">

            <div className="admin-card">
              <div className="admin-card-top">
                <div className="admin-card-icon review-icon">
                  ⭐
                </div>

                <span className="admin-card-label">
                  MANAGEMENT
                </span>
              </div>

              <div className="admin-card-content">
                <h2>Review Management</h2>

                <p>
                  Review student feedback and
                  manage submitted reviews by
                  approving or rejecting them.
                </p>
              </div>

              <button
                type="button"
                className="admin-card-button"
                onClick={() =>
                  navigate("/admin-reviews")
                }
              >
                Manage Reviews
                <span>→</span>
              </button>
            </div>

            <div className="admin-card">
              <div className="admin-card-top">
                <div className="admin-card-icon admin-icon">
                  👥
                </div>

                <span className="admin-card-label">
                  MANAGEMENT
                </span>
              </div>

              <div className="admin-card-content">
                <h2>Admin Management</h2>

                <p>
                  Add new administrators and
                  manage registered TutorSphere
                  admin accounts.
                </p>
              </div>

              <button
                type="button"
                className="admin-card-button"
                onClick={() =>
                  navigate("/admin-management")
                }
              >
                Add Admin
                <span>→</span>
              </button>
            </div>

            <div className="admin-card">
              <div className="admin-card-top">
                <div className="admin-card-icon profile-icon">
                  👤
                </div>

                <span className="admin-card-label">
                  ACCOUNT
                </span>
              </div>

              <div className="admin-card-content">
                <h2>My Profile</h2>

                <p>
                  View and update your
                  administrator profile and
                  account information.
                </p>
              </div>

              <button
                type="button"
                className="admin-card-button"
                onClick={() =>
                  navigate("/admin-profile")
                }
              >
                View Profile
                <span>→</span>
              </button>
            </div>

          </div>

          <div className="admin-account-bar">
            <div className="account-avatar">
              {currentUser?.name
                ? currentUser.name
                    .charAt(0)
                    .toUpperCase()
                : "A"}
            </div>

            <div className="account-info">
              <span className="account-name">
                {currentUser?.name ||
                  "Administrator"}
              </span>

              <span className="account-email">
                {currentUser?.email ||
                  "Admin Account"}
              </span>
            </div>

            <div className="account-role">
              <span>●</span>
              Admin Account
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminDashboard;