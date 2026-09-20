import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TeacherSidebar from "./components/TeacherSidebar";
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
          `${API_URL}/tutor-posts`,
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
          : data.posts || data.data || data.requests || [];

        setRequests(allRequests);
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
    <div className="teacher-requests-layout">
      <TeacherSidebar />
      <main className="teacher-page">
        <header className="teacher-page-header">
          <div>
            <p className="teacher-page-label">Student requests</p>
            <h1>Requests</h1>
            <p>Students looking for a teacher like you</p>
          </div>
        </header>

        <section className="teacher-request-content">
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
                    {request.subject_name || "Student Request"}
                  </h2>

                  <strong className="teacher-request-student">
                    Requested by {request.student_name || "Student"}
                  </strong>

                  <p>
                    {request.description || "No description available."}
                  </p>
                </div>

                <div className="teacher-request-meta">
                  <span>
                    Status:{" "}
                    <strong>
                      {request.status || "Pending"}
                    </strong>
                  </span>

                  <span>Location: {request.location || "Not specified"}</span>
                  <span>Budget: BDT {request.salary_min ?? request.salary_amount ?? "0"} - {request.salary_max ?? request.salary_amount ?? "0"}</span>
                  <span>Schedule: {request.salary_period || "Flexible"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>
      </main>
    </div>
  );
}