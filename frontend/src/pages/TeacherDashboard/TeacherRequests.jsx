import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "./components/TeacherSidebar";
import "./TeacherRequests.css";

const API_URL = "http://127.0.0.1:8000/api";

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export default function TeacherRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  /*
   * --------------------------------------------------------------------------
   * FETCH TEACHER REQUESTS
   * --------------------------------------------------------------------------
   */
  const fetchRequests = useCallback(async () => {
    const token = localStorage.getItem("authToken");

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/teacher/tuition-requests`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load requests."
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (error) {
      console.error("Teacher request fetch error:", error);
      setError(error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * --------------------------------------------------------------------------
   * PAGE LOAD
   * --------------------------------------------------------------------------
   */
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

    const initialLoadTimer = setTimeout(fetchRequests, 0);
    const refreshTimer = setInterval(fetchRequests, 15000);

    window.addEventListener("focus", fetchRequests);

    return () => {
      clearTimeout(initialLoadTimer);
      clearInterval(refreshTimer);
      window.removeEventListener("focus", fetchRequests);
    };
  }, [navigate, fetchRequests]);

  /*
   * --------------------------------------------------------------------------
   * ACCEPT / REJECT
   * --------------------------------------------------------------------------
   */
  const handleStatus = async (requestId, newStatus) => {
    const token = localStorage.getItem("authToken");

    try {
      setUpdatingId(requestId);
      setError("");

      const response = await fetch(
        `${API_URL}/teacher/tuition-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update request."
        );
      }

      // Update screen immediately
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                ...(data.request || {}),
                status: newStatus,
              }
            : request
        )
      );
    } catch (error) {
      console.error("Request status error:", error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="teacher-requests-layout">
      <TeacherSidebar />

      <main className="teacher-page">
        <div className="teacher-request-container">
          <header className="teacher-page-header">
            <p className="teacher-page-label">
              STUDENT REQUESTS
            </p>

            <h1>Requests</h1>

            <p className="teacher-page-subtitle">
              Students who have asked to learn with you
            </p>
          </header>

          <section className="teacher-request-content">
            {error && (
              <p className="teacher-request-error">
                {error}
              </p>
            )}

            {loading ? (
              <div className="teacher-empty-state">
                <h2>Loading requests...</h2>
              </div>
            ) : requests.length === 0 ? (
              <div className="teacher-empty-state">
                <div className="teacher-empty-icon">
                  ✉
                </div>

                <h2>No Requests Yet</h2>

                <p>
                  You currently have no student requests.
                </p>
              </div>
            ) : (
              <div className="teacher-request-list">
                {requests.map((request) => {
                  const status = String(
                    request.status || "pending"
                  ).toLowerCase();

                  const isPending = status === "pending";
                  const isBusy =
                    updatingId === request.id;

                  return (
                    <article
                      className="teacher-request-card"
                      key={request.id}
                    >
                      <div>
                        <h2>
                          {request.student_name || "Student"}
                        </h2>

                        <strong className="teacher-request-student">
                          Sent a tutoring request
                          {request.created_at
                            ? ` on ${formatDate(
                                request.created_at
                              )}`
                            : ""}
                        </strong>

                        <p>
                          {request.message ||
                            "No message included."}
                        </p>

                        {status === "accepted" &&
                          (request.student_email ||
                            request.student_phone) && (
                            <p className="teacher-request-contact">
                              {request.student_email && (
                                <span>
                                  Email:{" "}
                                  {request.student_email}
                                </span>
                              )}

                              {request.student_phone && (
                                <span>
                                  Phone:{" "}
                                  {request.student_phone}
                                </span>
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
                            {STATUS_LABELS[status] ||
                              request.status ||
                              "Pending"}
                          </strong>
                        </span>

                        <span>
                          Request Date:{" "}
                          {formatDate(request.created_at)}
                        </span>

                        <span>
                          Location:{" "}
                          {request.location ||
                            "Not specified"}
                        </span>

                        {(request.education_level ||
                          request.class_grade) && (
                          <span>
                            Level:{" "}
                            {[
                              request.education_level,
                              request.class_grade,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        )}
                      </div>

                      {isPending && (
                        <div className="teacher-request-actions">
                          <button
                            type="button"
                            className="teacher-request-accept"
                            disabled={isBusy}
                            onClick={() =>
                              handleStatus(
                                request.id,
                                "accepted"
                              )
                            }
                          >
                            {isBusy
                              ? "Saving..."
                              : "Accept"}
                          </button>

                          <button
                            type="button"
                            className="teacher-request-reject"
                            disabled={isBusy}
                            onClick={() =>
                              handleStatus(
                                request.id,
                                "rejected"
                              )
                            }
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <p className="request-footer-text">
            "Better Students. A Brighter Tomorrow."
          </p>
        </div>
      </main>
    </div>
  );
}