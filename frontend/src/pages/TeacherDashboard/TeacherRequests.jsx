import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./TeacherRequests.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function TeacherRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

    const fetchRequests = async () => {
      try {
        const response = await fetch(
          `${API_URL}/requests`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load requests");
        }

        const data = await response.json();

        const allRequests = Array.isArray(data)
          ? data
          : data.data || data.requests || [];

        const teacherRequests = allRequests.filter(
          (request) =>
            Number(request.teacher_id) === Number(user.id)
        );

        setRequests(teacherRequests);
      } catch (error) {
        console.error("Requests error:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  return (
    <div className="teacher-page">
      <header className="teacher-page-header">
        <button
          type="button"
          className="teacher-back-button"
          onClick={() => navigate("/teacher-dashboard")}
        >
          ←
        </button>

        <div>
          <h1>Requests</h1>
          <p>
            Student requests received by you
          </p>
        </div>
      </header>

      <main className="teacher-request-content">
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
            {requests.map((request) => (
              <article
                className="teacher-request-card"
                key={request.id}
              >
                <div>
                  <h2>
                    {request.title ||
                      request.subject ||
                      "Student Request"}
                  </h2>

                  <p>
                    {request.description ||
                      request.request_text ||
                      "No description available."}
                  </p>
                </div>

                <div className="teacher-request-meta">
                  <span>
                    Status:{" "}
                    <strong>
                      {request.status || "Pending"}
                    </strong>
                  </span>

                  {request.budget && (
                    <span>
                      Budget: {request.budget}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}