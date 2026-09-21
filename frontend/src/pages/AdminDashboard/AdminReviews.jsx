import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminReviews.css";
import Navbar from "../../components/Navbar/Navbar";

function AdminReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReviews = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/reviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (response.status === 403) {
        navigate("/admin-dashboard");
        return;
      }

      const data = await response.json();

      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (reviewId, action) => {
    const token = localStorage.getItem("authToken");

    setProcessingId(reviewId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/reviews/${reviewId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update review."
        );
        return;
      }

      setSuccess(data.message);

      await fetchReviews();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending"
  );

  return (
    <>
      <Navbar dashboardMode={true} />

      <main className="admin-reviews-page">
        <div className="admin-reviews-container">

          <button
            type="button"
            className="admin-reviews-back"
            onClick={() =>
              navigate("/admin-dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="admin-reviews-header">
            <span className="admin-reviews-badge">
              ⭐ Review Management
            </span>

            <h1>Review Management</h1>

            <p>
              Review student feedback and approve
              or reject submitted reviews.
            </p>
          </div>

          {error && (
            <div className="admin-review-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-review-message success">
              {success}
            </div>
          )}

          <div className="admin-review-summary">
            <span>Pending Reviews</span>
            <strong>{pendingReviews.length}</strong>
          </div>

          {loading ? (
            <div className="admin-review-empty">
              Loading reviews...
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="admin-review-empty">
              <div>✓</div>
              <h3>No pending reviews</h3>
              <p>
                There are currently no reviews
                waiting for approval.
              </p>
            </div>
          ) : (
            <div className="admin-review-list">
              {pendingReviews.map((review) => (
                <div
                  className="admin-review-card"
                  key={review.id}
                >
                  <div className="admin-review-card-header">

                    <div className="admin-review-user">
                      <div className="admin-review-avatar">
                        {review.student?.name
                          ?.charAt(0)
                          .toUpperCase() || "S"}
                      </div>

                      <div>
                        <h3>
                          {review.student?.name ||
                            "Student"}
                        </h3>

                        <p>
                          {review.student?.email ||
                            ""}
                        </p>
                      </div>
                    </div>

                    <span className="pending-badge">
                      Pending
                    </span>
                  </div>

                  <div className="admin-review-teacher">
                    Reviewing:
                    <strong>
                      {review.teacher?.name ||
                        "Teacher"}
                    </strong>
                  </div>

                  <div className="admin-review-rating">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  <p className="admin-review-text">
                    {review.review_text}
                  </p>

                  <div className="admin-review-date">
                    Submitted{" "}
                    {new Date(
                      review.created_at
                    ).toLocaleDateString()}
                  </div>

                  <div className="admin-review-actions">
                    <button
                      type="button"
                      className="approve-review-btn"
                      disabled={
                        processingId === review.id
                      }
                      onClick={() =>
                        handleAction(
                          review.id,
                          "approve"
                        )
                      }
                    >
                      {processingId === review.id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="reject-review-btn"
                      disabled={
                        processingId === review.id
                      }
                      onClick={() =>
                        handleAction(
                          review.id,
                          "reject"
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export default AdminReviews;