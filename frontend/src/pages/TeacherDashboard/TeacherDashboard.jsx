import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./TeacherDashboard.css";
import TeacherSidebar from "./components/TeacherSidebar";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [requestCount, setRequestCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token || !currentUser) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      try {
        /* =========================================
           REVIEWS
        ========================================= */

        try {
          const reviewResponse = await axios.get(
            "http://127.0.0.1:8000/api/reviews",
            config
          );

          const reviews = Array.isArray(reviewResponse.data)
            ? reviewResponse.data
            : reviewResponse.data?.data || [];

          const teacherReviews = reviews.filter(
            (review) =>
              Number(review.teacher_id) === Number(currentUser.id)
          );

          setReviewCount(teacherReviews.length);
        } catch (error) {
          console.error("Review fetch error:", error);
          setReviewCount(0);
        }

        /* =========================================
           REQUESTS
        ========================================= */

        try {
          const requestResponse = await axios.get(
            "http://127.0.0.1:8000/api/requests",
            config
          );

          const requests = Array.isArray(requestResponse.data)
            ? requestResponse.data
            : requestResponse.data?.data || [];

          const teacherRequests = requests.filter(
            (request) =>
              Number(request.teacher_id) === Number(currentUser.id)
          );

          setRequestCount(teacherRequests.length);
        } catch (error) {
          console.error("Request fetch error:", error);
          setRequestCount(0);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, token, currentUser?.id]);

  return (
    <div className="teacher-dashboard-layout">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <TeacherSidebar />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="teacher-dashboard-main">

        <div className="teacher-dashboard-container">

          {/* =========================================
              HEADER
          ========================================= */}

          <section className="teacher-dashboard-header">

            <p className="teacher-dashboard-label">
              Teacher Dashboard
            </p>

            <h1>
              Welcome back
              {currentUser?.name
                ? `, ${currentUser.name.split(" ")[0]}`
                : ""}
              !
            </h1>

            <p className="teacher-dashboard-subtitle">
              Manage your requests and reviews from here.
            </p>

          </section>


          {/* =========================================
              DASHBOARD CARDS
          ========================================= */}

          <section className="teacher-dashboard-cards">

            {/* REQUEST CARD */}

            <div className="teacher-dashboard-card">

              <div className="teacher-card-icon request-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-9" />
                  <path d="m13 12 7-7 2 2-7 7-3 1 1-3Z" />
                </svg>
              </div>

              <div className="teacher-card-content">

                <span>Requests</span>

                <strong>
                  {loading ? "..." : requestCount}
                </strong>

                <p>
                  Requests received from students
                </p>

              </div>

              <button
                type="button"
                onClick={() => navigate("/teacher-requests")}
              >
                View All →
              </button>

            </div>


            {/* REVIEW CARD */}

            <div className="teacher-dashboard-card">

              <div className="teacher-card-icon review-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                </svg>
              </div>

              <div className="teacher-card-content">

                <span>Reviews</span>

                <strong>
                  {loading ? "..." : reviewCount}
                </strong>

                <p>
                  Reviews received from students
                </p>

              </div>

              <button
                type="button"
                onClick={() => navigate("/teacher-reviews")}
              >
                View All →
              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default TeacherDashboard;