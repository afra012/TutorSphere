import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import studentJobImage from "../../assets/student-job.png";
import "./StudentDashboard.css";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    api.get("/subscriptions/current")
      .then((response) => setSubscription(response.data?.subscription || null))
      .catch(() => setSubscription(null));
  }, []);

  const hasActiveSubscription = subscription?.status === "active";

  return (
    <main className="student-dashboard-page">
      <DashboardSidebar />
      <section className="student-dashboard-content">
        <div className="student-empty-state">
          <img src={studentJobImage} alt="Student dashboard" className="student-empty-image" />
          <div className="student-welcome-row">
            <h1>Welcome, {user?.name?.split(" ")[0] || "Student"}!</h1>
            <button type="button" className="dashboard-subscription-badge" onClick={() => navigate("/subscription")}>
              <span className={hasActiveSubscription ? "subscription-indicator is-active" : "subscription-indicator"} />
              {hasActiveSubscription ? `${subscription.plan?.name || "Active"} plan` : "No active subscription"}
            </button>
          </div>
          <p>Explore tutors and find the perfect match for your learning journey.</p>
        </div>
      </section>
    </main>
  );
}