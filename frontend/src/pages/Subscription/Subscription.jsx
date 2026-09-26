import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TeacherSidebar from "../TeacherDashboard/components/TeacherSidebar";
import "./Subscription.css";

// Same role-resolution order Navbar uses, so the sidebar and the
// "Hi <Name>" greeting never disagree about who's logged in.
function getCurrentRole() {
  const savedUser = localStorage.getItem("currentUser");

  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed?.role) return parsed.role;
    } catch (error) {
      // ignore malformed JSON, fall through to storedRole
    }
  }

  return localStorage.getItem("role") || "student";
}

function SvgIcon({ name }) {
  const paths = {
    check: <path d="M5 13l4 4L19 7" />,
    crown: (
      <>
        <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8Z" />
        <path d="M5 21h14" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
  };

  return (
    <svg
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

const STATUS_LABELS = {
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
  replaced: "Replaced by a new plan",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Subscription() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role] = useState(getCurrentRole);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.paymentSuccess || "");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [plansRes, currentRes] = await Promise.all([
          api.get("/subscription-plans"),
          api.get("/subscriptions/current"),
        ]);

        setPlans(plansRes.data?.plans || []);
        setSubscription(currentRes.data?.subscription || null);
      } catch (err) {
        console.error("Failed to load subscription data:", err);
        setError("Could not load subscription details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Clear the navigation state so a refresh doesn't re-show the message.
    if (location.state?.paymentSuccess) {
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribing now goes through a payment page first — the actual
  // subscribe API call happens there, once the payment is confirmed.
  const handleSubscribe = (plan) => {
    navigate("/subscription/payment", { state: { plan } });
  };


  const isCurrentPlan = (planId) =>
    subscription?.status === "active" && subscription?.plan?.id === planId;

  if (loading) {
    return (
      <main className="subscription-page">
        {role === "teacher" ? <TeacherSidebar /> : <DashboardSidebar />}

        <div
          className={`subscription-content ${
            role === "teacher" ? "offset-teacher" : "offset-student"
          }`}
        >
          <p className="subscription-loading">Loading subscription details…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="subscription-page">
      {role === "teacher" ? <TeacherSidebar /> : <DashboardSidebar />}

      <div
        className={`subscription-content ${
          role === "teacher" ? "offset-teacher" : "offset-student"
        }`}
      >
      <div className="subscription-container">
        <header className="subscription-header">
          <h1>Subscription</h1>
          <p>Manage your TutorSphere plan and see your current status.</p>
          <span className="subscription-role-badge">
            Viewing as {role === "teacher" ? "Teacher" : "Student"}
          </span>
        </header>

        {error && <div className="subscription-alert subscription-alert-error">{error}</div>}
        {success && <div className="subscription-alert subscription-alert-success">{success}</div>}

        <section className="subscription-current-card">
          {subscription ? (
            <>
              <div className="subscription-current-top">
                <div>
                  <span className="subscription-current-label">Your plan</span>
                  <h2>{subscription.plan?.name}</h2>
                </div>

                <span
                  className={`subscription-status-badge status-${subscription.status}`}
                >
                  {STATUS_LABELS[subscription.status] || subscription.status}
                </span>
              </div>

              <div className="subscription-current-dates">
                <div>
                  <SvgIcon name="calendar" />
                  <span>
                    Started <strong>{formatDate(subscription.start_date)}</strong>
                  </span>
                </div>
                <div>
                  <SvgIcon name="calendar" />
                  <span>
                    {subscription.status === "cancelled" ? "Access until" : "Renews / ends"}{" "}
                    <strong>{formatDate(subscription.end_date)}</strong>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="subscription-empty">
              You don't have an active subscription yet. Pick a plan below to get started.
            </p>
          )}
        </section>

        <section className="subscription-plans-section">
          <h2 className="subscription-plans-heading">Available plans</h2>

          <div className="subscription-plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`subscription-plan-card ${
                  isCurrentPlan(plan.id) ? "is-current-plan" : ""
                }`}
              >
                <div className="subscription-plan-icon">
                  <SvgIcon name="crown" />
                </div>

                <h3>{plan.name}</h3>

                <p className="subscription-plan-price">
                  ৳{plan.price}
                  <span>/{plan.billing_cycle}</span>
                </p>

                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="subscription-plan-features">
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <SvgIcon name="check" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="subscription-subscribe-btn"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan(plan.id)}
                >
                  {isCurrentPlan(plan.id) ? "Current plan" : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </main>
  );
}

