import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TeacherSidebar from "../TeacherDashboard/components/TeacherSidebar";
import "./Payment.css";

// Same role-resolution order used across the dashboard pages.
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

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Payment() {
  const [role] = useState(getCurrentRole);
  const navigate = useNavigate();
  const location = useLocation();

  const plan = location.state?.plan || null;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Someone landed here without picking a plan first (direct link,
  // refresh, back/forward navigation) — send them back to choose one.
  if (!plan) {
    return (
      <main className="payment-page">
        {role === "teacher" ? <TeacherSidebar /> : <DashboardSidebar />}

        <div
          className={`payment-content ${
            role === "teacher" ? "offset-teacher" : "offset-student"
          }`}
        >
          <div className="payment-container">
            <div className="payment-missing-plan">
              <p>No plan selected.</p>
              <button
                type="button"
                className="payment-back-btn"
                onClick={() => navigate("/subscription")}
              >
                Back to plans
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    if (cardName.trim().length < 2) {
      setError("Enter the name on the card.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Enter a valid 16-digit card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Enter the expiry date as MM/YY.");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Enter a valid CVV.");
      return;
    }

    setPaying(true);

    try {
      const res = await api.post("/subscriptions/subscribe", {
        plan_id: plan.id,
      });

      navigate("/subscription", {
        replace: true,
        state: {
          paymentSuccess:
            res.data?.message || "Payment successful. Subscribed!",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment could not be completed. Please try again."
      );
      setPaying(false);
    }
  };

  return (
    <main className="payment-page">
      {role === "teacher" ? <TeacherSidebar /> : <DashboardSidebar />}

      <div
        className={`payment-content ${
          role === "teacher" ? "offset-teacher" : "offset-student"
        }`}
      >
        <div className="payment-container">
          <button
            type="button"
            className="payment-back-link"
            onClick={() => navigate("/subscription")}
          >
            ← Back to plans
          </button>

          <div className="payment-grid">
            {/* ================= ORDER SUMMARY ================= */}
            <section className="payment-summary-card">
              <h2>Order summary</h2>

              <div className="payment-summary-row">
                <span>Plan</span>
                <strong>{plan.name}</strong>
              </div>

              <div className="payment-summary-row">
                <span>Billing cycle</span>
                <strong>{plan.billing_cycle}</strong>
              </div>

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className="payment-summary-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}

              <div className="payment-summary-total">
                <span>Amount due</span>
                <strong>৳{plan.price}</strong>
              </div>
            </section>

            {/* ================= PAYMENT FORM ================= */}
            <section className="payment-form-card">
              <h2>Payment details</h2>

              {error && <div className="payment-alert">{error}</div>}

              <form onSubmit={handlePay}>
                <label className="payment-field">
                  <span>Name on card</span>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full name"
                    disabled={paying}
                  />
                </label>

                <label className="payment-field">
                  <span>Card number</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="1234 5678 9012 3456"
                    disabled={paying}
                  />
                </label>

                <div className="payment-field-row">
                  <label className="payment-field">
                    <span>Expiry</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      disabled={paying}
                    />
                  </label>

                  <label className="payment-field">
                    <span>CVV</span>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="123"
                      disabled={paying}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="payment-pay-btn"
                  disabled={paying}
                >
                  {paying ? "Processing…" : `Pay ৳${plan.price}`}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
