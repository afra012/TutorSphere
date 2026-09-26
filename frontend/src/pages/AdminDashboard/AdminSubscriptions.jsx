import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminSubscriptions.css";

const API_URL = "http://127.0.0.1:8000/api";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-BD", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function AdminSubscriptions() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0, revenue: 0, simulated: 0, simulated_value: 0 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPurchases = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(API_URL + "/admin/subscription-purchases", {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + token,
          },
        });
        const data = await response.json();

        if (response.status === 401) {
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || "Could not load subscription history.");
        }

        setPurchases(Array.isArray(data.purchases) ? data.purchases : []);
        setSummary(data.summary || { total: 0, paid: 0, revenue: 0, simulated: 0, simulated_value: 0 });
      } catch (loadError) {
        setError(loadError.message || "Could not load subscription history.");
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [navigate]);

  const filteredPurchases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return purchases;

    return purchases.filter((purchase) => {
      const user = purchase.user || {};
      const subscriberName = purchase.purchaser_name || user.name || "";
      return String(subscriberName).toLowerCase().includes(normalizedQuery);
    });
  }, [purchases, query]);

  return (
    <>
      <AdminSidebar />
      <main className="admin-subscriptions-page">
        <div className="admin-subscriptions-container">
          <header className="admin-subscriptions-header">
            <div>
              <span className="admin-subscriptions-eyebrow">Billing</span>
              <h1>Subscription History</h1>
              <p>Review who purchased each plan, payment details, and subscription period.</p>
            </div>
          </header>

          <section className="subscription-summary" aria-label="Subscription totals">
            <article><span>Total purchases</span><strong>{summary.total}</strong></article>
            <article><span>Paid subscriptions</span><strong>{summary.paid}</strong></article>
            <article>
              <span>Paid revenue</span>
              <strong>BDT {Number(summary.revenue || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</strong>
            </article>
            <article>
              <span>Simulated purchase value ({summary.simulated})</span>
              <strong>BDT {Number(summary.simulated_value || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</strong>
            </article>
          </section>

          <section className="subscription-history-card">
            <div className="subscription-history-toolbar">
              <div>
                <h2>Purchases</h2>
                <p>{filteredPurchases.length} records</p>
              </div>
              <label className="subscription-name-search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search subscriber by name"
                  aria-label="Search subscriber by name"
                />
              </label>
            </div>

            {error ? (
              <div className="subscription-history-state is-error">{error}</div>
            ) : loading ? (
              <div className="subscription-history-state">Loading subscription history...</div>
            ) : filteredPurchases.length === 0 ? (
              <div className="subscription-history-state">
                {purchases.length === 0
                  ? "No subscription purchases have been recorded yet."
                  : "No subscribers match that name."}
              </div>
            ) : (
              <div className="subscription-table-scroll">
                <table className="subscription-table">
                  <thead>
                    <tr>
                      <th>Subscriber</th>
                      <th>Account type</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Transaction ID</th>
                      <th>Subscription period</th>
                      <th>Purchased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => {
                      const user = purchase.user || {};
                      const name = purchase.purchaser_name || user.name || "Unknown user";
                      const email = purchase.purchaser_email || user.email || "—";
                      const role = String(purchase.purchaser_role || user.role || "unknown").toLowerCase();
                      const status = String(purchase.status || "pending").toLowerCase();

                      return (
                        <tr key={purchase.id}>
                          <td>
                            <strong>{name}</strong>
                            <small>{email}</small>
                          </td>
                          <td><span className={"subscriber-role role-" + role}>{role === "teacher" ? "Teacher" : role === "student" ? "Student" : role}</span></td>
                          <td><strong>{purchase.plan_name || "Plan unavailable"}</strong></td>
                          <td>{purchase.currency || "BDT"} {Number(purchase.amount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}</td>
                          <td><span className={"subscription-status status-" + status}>{status}</span></td>
                          <td>{purchase.payment_method || "—"}</td>
                          <td>{purchase.transaction_id || "—"}</td>
                          <td>{formatDate(purchase.starts_at)}<small>to {formatDate(purchase.ends_at)}</small></td>
                          <td>{formatDate(purchase.paid_at || purchase.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminSubscriptions;
