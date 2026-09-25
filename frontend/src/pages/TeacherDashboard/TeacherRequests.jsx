import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
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

  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

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


  /*
  |--------------------------------------------------------------------------
  | FETCH TEACHER REQUESTS
  |--------------------------------------------------------------------------
  */

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");

    try {
      setLoading(true);
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
  };

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


    fetchRequests();
  }, [navigate]);

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
