import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TeacherSidebar from "./components/TeacherSidebar";
import "./TeacherRequests.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function TeacherRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH TEACHER REQUESTS
  |--------------------------------------------------------------------------
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
      console.error(
        "Teacher request fetch error:",
        error
      );

      setError(error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PAGE LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token =
      localStorage.getItem("authToken");

    const savedUser =
      localStorage.getItem("currentUser");

    if (!token || !savedUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (user?.role !== "teacher") {
      navigate("/login", {
        replace: true,
      });

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
  |--------------------------------------------------------------------------
  | ACCEPT / REJECT
  |--------------------------------------------------------------------------
  */

  const handleStatus = async (
    requestId,
    newStatus
  ) => {
    const token =
      localStorage.getItem("authToken");

    try {
      setUpdatingId(requestId);

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
          data.message ||
            "Failed to update request."
        );
      }

      /*
      Update screen immediately
      */

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
              }
            : request
        )
      );
    } catch (error) {
      console.error(
        "Request status error:",
        error
      );

      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DATE FORMAT
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="teacher-requests-layout">
      <TeacherSidebar />

      <main className="teacher-page">
        <div className="teacher-request-container">

          {/* HEADER */}

          <header className="teacher-page-header">
            <p className="teacher-page-label">
              STUDENT REQUESTS
            </p>

            <h1>Requests</h1>

            <p className="teacher-page-subtitle">
              Manage tutoring requests sent
              directly by students.
            </p>
          </header>

          {/* CONTENT */}

          <section className="teacher-request-content">

            {/* LOADING */}

            {loading ? (
              <div className="teacher-empty-state">

                <div className="teacher-empty-icon">
                  ✉
                </div>

                <h2>
                  Loading requests...
                </h2>

              </div>

            ) : error ? (

              /* ERROR */

              <div className="teacher-empty-state">

                <h2>
                  Unable to load requests
                </h2>

                <p>{error}</p>

              </div>

            ) : requests.length === 0 ? (

              /* EMPTY STATE */

              <div className="teacher-empty-state">

                <div className="empty-circle top-circle"></div>
                <div className="empty-circle bottom-circle"></div>

                <div className="request-illustration">

                  <div className="teacher-empty-icon">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="m3 7 9 6 9-6" />
                    </svg>

                  </div>

                  <div className="paper-plane">
                    ➤
                  </div>

                </div>

                <h2>
                  No Requests Yet
                </h2>

                <p>
                  When a student sends you
                  a tutor request,
                  <br />
                  it will appear here.
                </p>

                <div className="request-helper">
                  <span></span>
                  New requests will be shown
                  automatically
                </div>

              </div>

            ) : (

              /* REQUEST LIST */

              <div className="teacher-request-list">

                {requests.map((request) => (

                  <article
                    className="teacher-request-card"
                    key={request.id}
                  >

                    <div className="request-card-top">

                      <div>

                        <h2>
                          Tutor Request
                        </h2>

                        <strong className="teacher-request-student">
                          Requested by{" "}
                          {request.student_name ||
                            "Student"}
                        </strong>

                        <p>
                          {request.student_email ||
                            "No email available"}
                        </p>

                      </div>

                      <span className="request-status">
                        {request.status ||
                          "pending"}
                      </span>

                    </div>

                    <div className="teacher-request-meta">

                      <span>
                        Student:{" "}
                        <strong>
                          {request.student_name ||
                            "Student"}
                        </strong>
                      </span>

                      <span>
                        Request Date:{" "}
                        {formatDate(
                          request.created_at
                        )}
                      </span>

                      <span>
                        Status:{" "}
                        <strong>
                          {request.status ||
                            "pending"}
                        </strong>
                      </span>

                    </div>

                    {/* ACCEPT / REJECT */}

                    {request.status ===
                      "pending" && (

                      <div className="request-actions">

                        <button
                          type="button"
                          className="reject-btn"
                          disabled={
                            updatingId ===
                            request.id
                          }
                          onClick={() =>
                            handleStatus(
                              request.id,
                              "rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          className="accept-btn"
                          disabled={
                            updatingId ===
                            request.id
                          }
                          onClick={() =>
                            handleStatus(
                              request.id,
                              "accepted"
                            )
                          }
                        >
                          {updatingId ===
                          request.id
                            ? "Updating..."
                            : "Accept"}
                        </button>

                      </div>
                    )}

                  </article>

                ))}

              </div>
            )}

          </section>

          <p className="request-footer-text">
            “Better Students. A Brighter Tomorrow.”
          </p>

        </div>
      </main>
    </div>
  );
}
