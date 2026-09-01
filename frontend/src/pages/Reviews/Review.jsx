import { useEffect, useState } from "react";
import axios from "axios";
import "./Review.css";

function Review() {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [teacherId, setTeacherId] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // UPDATE STATES
  // =========================
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  // =========================
  // CURRENT USER
  // =========================
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  // =========================
  // FETCH TEACHERS
  // =========================
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // Backend returns:
      // { users: [...] }
      const allUsers = response.data.users || [];

      const teachers = allUsers.filter(
        (user) => user.role?.toLowerCase() === "teacher"
      );

      setUsers(teachers);
      setError("");
    } catch (err) {
      console.error("Teacher fetch error:", err);

      setUsers([]);

      setError(
        err.response?.data?.message ||
          "Failed to load teachers."
      );
    }
  };

  // =========================
  // FETCH REVIEWS
  // =========================
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/reviews"
      );

      setReviews(response.data || []);
    } catch (err) {
      console.error("Review fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    fetchTeachers();
    fetchReviews();
  }, []);

  // =========================
  // SUBMIT NEW REVIEW
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("Please login before submitting a review.");
      return;
    }

    if (currentUser.role?.toLowerCase() !== "student") {
      setError("Only students can submit reviews.");
      return;
    }

    if (!teacherId) {
      setError("Please select a teacher.");
      return;
    }

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("authToken");

      await axios.post(
        "http://127.0.0.1:8000/api/reviews",
        {
          teacher_id: teacherId,
          rating: rating,
          review_text: reviewText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setSuccess("Review submitted successfully!");

      setTeacherId("");
      setRating(0);
      setReviewText("");

      await fetchReviews();
    } catch (err) {
      console.error("Submit review error:", err);

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];

        setError(
          firstError || "Failed to submit review."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to submit review."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // UPDATE REVIEW
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!editRating) {
      setError("Please select a rating.");
      return;
    }

    if (!editText.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        `http://127.0.0.1:8000/api/reviews/${editingReview.id}`,
        {
          rating: editRating,
          review_text: editText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setSuccess("Review updated successfully!");

      setEditingReview(null);
      setEditRating(0);
      setEditText("");

      await fetchReviews();
    } catch (err) {
      console.error("Update review error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update review."
      );
    }
  };

  // =========================
  // DELETE REVIEW
  // =========================
  const handleDelete = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(
        `http://127.0.0.1:8000/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setSuccess("Review deleted successfully!");

      await fetchReviews();
    } catch (err) {
      console.error("Delete review error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete review."
      );
    }
  };

  // =========================
  // START EDITING
  // =========================
  const startEditing = (review) => {
    setEditingReview(review);
    setEditRating(Number(review.rating));
    setEditText(review.review_text || "");

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const cancelEditing = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditText("");

    setError("");
    setSuccess("");
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="review-page">
      <div className="review-container">

        {/* =========================
            HEADER
        ========================= */}
        <div className="review-header">
          <span className="review-badge">
            ⭐ Student Feedback
          </span>

          <h1>Reviews & Ratings</h1>

          <p>
            See what students are saying about their
            learning experience.
          </p>
        </div>

        {/* =========================
            EDIT REVIEW
        ========================= */}
        {editingReview && (
          <div className="create-review-card">

            <div className="create-review-heading">
              <div>
                <h2>Edit Your Review</h2>
                <p>
                  Update your experience with this teacher.
                </p>
              </div>

              <div className="review-icon">
                ✏️
              </div>
            </div>

            <form onSubmit={handleUpdate}>

              {/* Rating */}
              <div className="review-form-group">
                <label>Rating</label>

                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= editRating
                          ? "star active"
                          : "star"
                      }
                      onClick={() => {
                        setEditRating(star);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {editRating > 0 && (
                  <span className="rating-label">
                    {editRating === 1 && "Poor"}
                    {editRating === 2 && "Fair"}
                    {editRating === 3 && "Good"}
                    {editRating === 4 && "Very Good"}
                    {editRating === 5 && "Excellent"}
                  </span>
                )}
              </div>

              {/* Review Text */}
              <div className="review-form-group">
                <label htmlFor="edit-review">
                  Your Review
                </label>

                <textarea
                  id="edit-review"
                  rows="5"
                  placeholder="Update your experience..."
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                />
              </div>

              {error && (
                <div className="review-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="review-success">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="review-submit"
              >
                Update Review
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                style={{
                  marginTop: "10px",
                  width: "100%",
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* =========================
            CREATE REVIEW
        ========================= */}
        {!editingReview &&
          currentUser?.role?.toLowerCase() === "student" && (
            <div className="create-review-card">

              <div className="create-review-heading">
                <div>
                  <h2>Leave a Review</h2>

                  <p>
                    Share your experience with a teacher.
                  </p>
                </div>

                <div className="review-icon">
                  ⭐
                </div>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Teacher */}
                <div className="review-form-group">
                  <label htmlFor="teacher">
                    Select Teacher
                  </label>

                  <select
                    id="teacher"
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <option value="">
                      {users.length > 0
                        ? "Select a teacher"
                        : "No teachers available"}
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name} — Teacher
                      </option>
                    ))}
                  </select>

                  {/* Helpful loading message */}
                  {loading && (
                    <small>
                      Loading teachers...
                    </small>
                  )}

                  {/* No teachers message */}
                  {!loading && users.length === 0 && (
                    <small>
                      No teacher accounts found.
                    </small>
                  )}
                </div>

                {/* Rating */}
                <div className="review-form-group">
                  <label>Rating</label>

                  <div className="rating-buttons">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          star <= rating
                            ? "star active"
                            : "star"
                        }
                        onClick={() => {
                          setRating(star);
                          setError("");
                          setSuccess("");
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {rating > 0 && (
                    <span className="rating-label">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </span>
                  )}
                </div>

                {/* Review */}
                <div className="review-form-group">
                  <label htmlFor="review">
                    Your Review
                  </label>

                  <textarea
                    id="review"
                    rows="5"
                    placeholder="Write your experience with this teacher..."
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="review-error">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="review-success">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="review-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </form>
            </div>
          )}

        {/* =========================
            LOGIN MESSAGE
        ========================= */}
        {!currentUser && (
          <div className="login-review-message">
            <span>🔐</span>

            <div>
              <h3>Login to leave a review</h3>

              <p>
                Please login as a student to share your
                experience with a teacher.
              </p>
            </div>
          </div>
        )}

        {/* =========================
            EXISTING REVIEWS
        ========================= */}
        <div className="existing-reviews">

          <div className="section-heading">
            <div>
              <h2>Student Reviews</h2>

              <p>
                Real experiences from our students.
              </p>
            </div>

            <span className="review-count">
              {reviews.length}{" "}
              {reviews.length === 1
                ? "Review"
                : "Reviews"}
            </span>
          </div>

          {/* Global Error */}
          {error && !editingReview && (
            <div className="review-error">
              {error}
            </div>
          )}

          {/* Global Success */}
          {success && !editingReview && (
            <div className="review-success">
              {success}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="review-message">
              Loading reviews...
            </div>
          )}

          {/* No Reviews */}
          {!loading && reviews.length === 0 && (
            <div className="no-reviews">
              <div className="empty-icon">
                ⭐
              </div>

              <h3>No reviews yet</h3>

              <p>
                Be the first student to leave a review.
              </p>
            </div>
          )}

          {/* Reviews */}
          {!loading && reviews.length > 0 && (
            <div className="reviews-list">

              {reviews.map((review) => (
                <div
                  className="review-card"
                  key={review.id}
                >

                  {/* Card Top */}
                  <div className="review-card-top">

                    <div className="teacher-info">

                      <div className="teacher-avatar">
                        {review.teacher?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "T"}
                      </div>

                      <div>
                        <h3>
                          {review.teacher?.name ||
                            "Teacher"}
                        </h3>

                        <span className="role-badge">
                          Teacher
                        </span>
                      </div>

                    </div>

                    <div className="rating-display">
                      {"★".repeat(
                        Number(review.rating) || 0
                      )}

                      {"☆".repeat(
                        5 -
                          (Number(review.rating) || 0)
                      )}
                    </div>

                  </div>

                  <div className="review-divider"></div>

                  {/* Review Text */}
                  <p className="review-text">
                    "{review.review_text}"
                  </p>

                  {/* Footer */}
                  <div className="review-footer">

                    <span>
                      Reviewed by{" "}
                      <strong>
                        {review.student?.name ||
                          "Student"}
                      </strong>
                    </span>

                    <span>
                      {review.created_at
                        ? new Date(
                            review.created_at
                          ).toLocaleDateString()
                        : ""}
                    </span>

                  </div>

                  {/* Edit / Delete */}
                  {currentUser?.id === review.student_id && (
                    <div
                      className="review-actions"
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(review)
                        }
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(review.id)
                        }
                        style={{
                          padding: "8px 18px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete
                      </button>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Review;