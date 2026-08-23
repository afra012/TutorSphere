import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./TeacherReviews.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function TeacherReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
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

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/reviews`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load reviews");
        }

        const data = await response.json();

        const allReviews = Array.isArray(data)
          ? data
          : data.data || data.reviews || [];

        const teacherReviews = allReviews.filter(
          (review) =>
            Number(review.teacher_id) === Number(user.id)
        );

        setReviews(teacherReviews);
      } catch (error) {
        console.error("Reviews error:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
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
          <h1>Reviews</h1>

          <p>
            Reviews received from your students
          </p>
        </div>
      </header>

      <main className="teacher-review-content">
        {loading ? (
          <div className="teacher-empty-state">
            <h2>Loading reviews...</h2>
          </div>
        ) : reviews.length === 0 ? (
          <div className="teacher-empty-state">
            <div className="teacher-empty-icon">
              ★
            </div>

            <h2>No Reviews Yet</h2>

            <p>
              You currently have no reviews from students.
            </p>
          </div>
        ) : (
          <div className="teacher-review-list">
            {reviews.map((review) => (
              <article
                className="teacher-review-card"
                key={review.id}
              >
                <div className="teacher-review-top">
                  <div className="teacher-review-avatar">
                    {(
                      review.student?.name ||
                      "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h2>
                      {review.student?.name ||
                        "Student"}
                    </h2>

                    <div className="teacher-stars">
                      {"★".repeat(
                        Number(review.rating) || 0
                      )}
                    </div>
                  </div>
                </div>

                <p className="teacher-review-text">
                  {review.review_text ||
                    "No review text available."}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}