import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import TeacherSidebar from "./components/TeacherSidebar";
import "./TeacherRequests.css";

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export default function TeacherRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadRequests = useCallback(async () => {
    setError("");

    try {
      const response = await api.get("/tutoring-requests");
      setRequests(
        Array.isArray(response.data?.requests) ? response.data.requests : []
      );
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      console.error("Failed to load requests:", err);
      setError("Unable to load requests right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (!token || !savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "teacher") {
      navigate("/login", { replace: true });
      return;
    }

    loadRequests();
  }, [navigate, loadRequests]);

  const updateStatus = async (request, status) => {
    if (busyId) return;

    setBusyId(request.id);
    setError("");

    try {
      const response = await api.patch(
        `/tutoring-requests/${request.id}/status`,
        { status }
      );

      const updated = response.data?.request;

      setRequests((current) =>
        current.map((r) => (r.id === request.id ? { ...r, ...updated } : r))
      );
    } catch (err) {
      console.error("Failed to update request:", err);
      setError(
        err.response?.data?.message ||
          "Could not update this request. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="teacher-requests-layout">
      <TeacherSidebar />

      <main className="teacher-page">
        <header className="teacher-page-header">
          <div>
            <p className="teacher-page-label">Student requests</p>
            <h1>Requests</h1>
            <p>Students who have asked to learn with you</p>
          </div>
        </header>

        <section className="teacher-request-content">
          {error && <p className="teacher-request-error">{error}</p>}

          {loading ? (
            <div className="teacher-empty-state">
              <h2>Loading requests...</h2>
            </div>
          ) : requests.length === 0 ? (
            <div className="teacher-empty-state">
              <div className="teacher-empty-icon">✉</div>

              <h2>No Requests Yet</h2>

              <p>You currently have no student requests.</p>
            </div>
          ) : (
            <div className="teacher-request-list">
              {requests.map((request) => {
                const status = String(request.status || "pending").toLowerCase();
                const isPending = status === "pending";
                const isBusy = busyId === request.id;

                return (
                  <article className="teacher-request-card" key={request.id}>
                    <div>
                      <h2>{request.student_name || "Student"}</h2>

                      <strong className="teacher-request-student">
                        Sent a tutoring request
                        {request.created_at
                          ? ` on ${formatDate(request.created_at)}`
                          : ""}
                      </strong>

                      <p>{request.message || "No message included."}</p>

                      {status === "accepted" &&
                        (request.student_email || request.student_phone) && (
                          <p className="teacher-request-contact">
                            {request.student_email && (
                              <span>Email: {request.student_email}</span>
                            )}
                            {request.student_phone && (
                              <span>Phone: {request.student_phone}</span>
                            )}
                          </p>
                        )}
                    </div>

                    <div className="teacher-request-meta">
                      <span>
                        Status:{" "}
                        <strong
                          className={`teacher-request-status is-${status}`}
                        >
                          {STATUS_LABELS[status] || request.status}
                        </strong>
                      </span>

                      <span>
                        Location: {request.location || "Not specified"}
                      </span>

                      {(request.education_level || request.class_grade) && (
                        <span>
                          Level:{" "}
                          {[request.education_level, request.class_grade]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      )}

                      {isPending && (
                        <div className="teacher-request-actions">
                          <button
                            type="button"
                            className="teacher-request-accept"
                            disabled={isBusy}
                            onClick={() => updateStatus(request, "accepted")}
                          >
                            {isBusy ? "Saving..." : "Accept"}
                          </button>

                          <button
                            type="button"
                            className="teacher-request-reject"
                            disabled={isBusy}
                            onClick={() => updateStatus(request, "rejected")}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
