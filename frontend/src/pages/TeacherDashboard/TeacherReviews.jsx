import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/Navbar/Navbar";
import TeacherSidebar from "../TeacherDashboard/components/TeacherSidebar";

import "./TeacherReviews.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function TeacherReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    // ---------------------------------------
    // CHECK LOGIN
    // ---------------------------------------
    if (!token || !savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid currentUser:", error);
      navigate("/login", { replace: true });
      return;
    }

    // ---------------------------------------
    // CHECK TEACHER ROLE
    // ---------------------------------------
    if (user?.role?.toLowerCase() !== "teacher") {
      navigate("/login", { replace: true });
      return;
    }

    // ---------------------------------------
    // FETCH REVIEWS
    // ---------------------------------------
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/reviews`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = response.data;

        const allReviews = Array.isArray(responseData)
          ? responseData
          : responseData?.data ||
            responseData?.reviews ||
            [];

        // ---------------------------------------
        // ONLY CURRENT TEACHER'S REVIEWS
        // ---------------------------------------
        const teacherReviews = allReviews.filter(
          (review) =>
            Number(review.teacher_id) === Number(user.id)
        );

        setReviews(teacherReviews);
      } catch (error) {
        console.error("Teacher reviews error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load your reviews."
        );

        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  // ---------------------------------------
  // CALCULATE AVERAGE RATING
  // ---------------------------------------
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="teacher-reviews-page">
      {/* =====================================
          TOP NAVBAR
      ===================================== */}
      <Navbar
        dashboardMode={true}
        role="teacher"
      />

      {/* =====================================
          DASHBOARD BODY
      ===================================== */}
      <div className="teacher-reviews-layout">
        {/* ===================================
            SIDEBAR
        =================================== */}
        <TeacherSidebar />

        {/* ===================================
            MAIN CONTENT
        =================================== */}
        <main className="teacher-reviews-main">
          <div className="teacher-reviews-container">

            {/* =================================
                PAGE HEADER
            ================================= */}
            <section className="teacher-reviews-header">
              <div>
                <span className="teacher-reviews-badge">
                  ★ Student Feedback
                </span>

                <h1>Reviews</h1>

                <p>
                  See what your students are saying
                  about their learning experience.
                </p>
              </div>
            </section>

            {/* =================================
                SUMMARY CARDS
            ================================= */}
            <section className="teacher-review-stats">

              <div className="teacher-review-stat-card">
                <div className="teacher-review-stat-icon">
                  ★
                </div>

                <div>
                  <span>Total Reviews</span>
                  <strong>{reviews.length}</strong>
                </div>
              </div>

              <div className="teacher-review-stat-card">
                <div className="teacher-review-stat-icon">
                  ★
                </div>

                <div>
                  <span>Average Rating</span>
                  <strong>{averageRating}</strong>
                </div>
              </div>

              <div className="teacher-review-stat-card">
                <div className="teacher-review-stat-icon">
                  ✓
                </div>

                <div>
                  <span>Student Feedback</span>
                  <strong>
                    {reviews.length > 0
                      ? "Available"
                      : "Waiting"}
                  </strong>
                </div>
              </div>

            </section>

            {/* =================================
                REVIEWS SECTION
            ================================= */}
            <section className="teacher-reviews-section">

              <div className="teacher-reviews-section-header">
                <div>
                  <h2>Student Reviews</h2>

                  <p>
                    Reviews received from your students.
                  </p>
                </div>

                <span className="teacher-review-count">
                  {reviews.length}{" "}
                  {reviews.length === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              </div>

              {/* ===============================
                  ERROR
              =============================== */}
              {error && (
                <div className="teacher-reviews-error">
                  <span>!</span>

                  <div>
                    <strong>Something went wrong</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* ===============================
                  LOADING
              =============================== */}
              {loading && (
                <div className="teacher-reviews-empty">
                  <div className="teacher-reviews-loading-icon">
                    ★
                  </div>

                  <h3>Loading Reviews...</h3>

                  <p>
                    Please wait while we load your
                    student reviews.
                  </p>
                </div>
              )}

              {/* ===============================
                  EMPTY
              =============================== */}
              {!loading &&
                !error &&
                reviews.length === 0 && (
                  <div className="teacher-reviews-empty">
                    <div className="teacher-reviews-empty-icon">
                      ★
                    </div>

                    <h3>No Reviews Yet</h3>

                    <p>
                      You currently have no reviews
                      from students.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/teacher-dashboard")
                      }
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}

              {/* ===============================
                  REVIEWS LIST
              =============================== */}
              {!loading &&
                reviews.length > 0 && (
                  <div className="teacher-review-list">
                    {reviews.map((review) => {
                      const studentName =
                        review.student?.name ||
                        "Student";

                      const rating =
                        Number(review.rating) || 0;

                      const reviewDate =
                        review.created_at
                          ? new Date(
                              review.created_at
                            ).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "";

                      return (
                        <article
                          className="teacher-review-card"
                          key={review.id}
                        >
                          {/* =====================
                              CARD HEADER
                          ===================== */}
                          <div className="teacher-review-top">

                            <div className="teacher-review-student">
                              <div className="teacher-review-avatar">
                                {studentName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <h3>
                                  {studentName}
                                </h3>

                                <span>
                                  Student
                                </span>
                              </div>
                            </div>

                            <div className="teacher-review-rating">
                              <div className="teacher-stars">
                                {"★".repeat(rating)}
                                {"☆".repeat(
                                  5 - rating
                                )}
                              </div>

                              <small>
                                {rating}/5
                              </small>
                            </div>
                          </div>

                          {/* =====================
                              DIVIDER
                          ===================== */}
                          <div className="teacher-review-divider" />

                          {/* =====================
                              REVIEW TEXT
                          ===================== */}
                          <p className="teacher-review-text">
                            “
                            {review.review_text ||
                              "No review text available."}
                            ”
                          </p>

                          {/* =====================
                              FOOTER
                          ===================== */}
                          <div className="teacher-review-footer">
                            <span>
                              Reviewed by{" "}
                              <strong>
                                {studentName}
                              </strong>
                            </span>

                            {reviewDate && (
                              <span>
                                {reviewDate}
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}