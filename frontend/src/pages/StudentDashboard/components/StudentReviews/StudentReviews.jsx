import { useEffect, useState } from "react";
import axios from "axios";
import DashboardSidebar from "../../../../components/Dashboard/DashboardSidebar";
import "./StudentReviews.css";

const API_URL = "http://127.0.0.1:8000/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("auth_token") ||
    ""
  );
};

function StudentReviews() {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [teacherId, setTeacherId] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [loading, setLoading] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(localStorage.getItem("user"));

  // =========================================================
  // FETCH TEACHERS
  // =========================================================
  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true);

      const token = getToken();

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Users API response:", response.data);

      // Backend returns:
      // { users: [...] }
      const allUsers = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.users)
        ? response.data.users
        : [];

      const teachers = allUsers.filter(
        (user) => user.role?.toLowerCase() === "teacher"
      );

      console.log("Teachers:", teachers);

      setUsers(teachers);

      if (teachers.length === 0) {
        setError("No teachers found.");
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);

      setError(
        err.response?.data?.message || "Failed to load teachers."
      );
    } finally {
      setTeachersLoading(false);
    }
  };

  // =========================================================
  // FETCH REVIEWS
  // =========================================================
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/reviews`);

      console.log("Reviews API response:", response.data);

      const reviewData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.reviews)
        ? response.data.reviews
        : [];

      setReviews(reviewData);
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setError(
        err.response?.data?.message || "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================
  useEffect(() => {
    fetchTeachers();
    fetchReviews();
  }, []);

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================
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

      const token = getToken();

      await axios.post(
        `${API_URL}/reviews`,
        {
          teacher_id: Number(teacherId),
          rating: Number(rating),
          review_text: reviewText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
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

        const firstError = Object.values(errors)[0];

        setError(
          Array.isArray(firstError)
            ? firstError[0]
            : "Validation failed."
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

  // =========================================================
  // START EDITING
  // =========================================================
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

  // =========================================================
  // CANCEL EDIT
  // =========================================================
  const cancelEditing = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditText("");
    setError("");
  };

  // =========================================================
  // UPDATE REVIEW
  // =========================================================
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
      const token = getToken();

      await axios.put(
        `${API_URL}/reviews/${editingReview.id}`,
        {
          rating: Number(editRating),
          review_text: editText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  // =========================================================
  // DELETE REVIEW
  // =========================================================
  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = getToken();

      await axios.delete(
        `${API_URL}/reviews/${reviewId}`,
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

  // =========================================================
  // RATING LABEL
  // =========================================================
  const ratingLabel = (value) => {
    if (value === 1) return "Poor";
    if (value === 2) return "Fair";
    if (value === 3) return "Good";
    if (value === 4) return "Very Good";
    if (value === 5) return "Excellent";

    return "";
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="student-reviews-layout">

      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="student-reviews-main">
        <div className="student-reviews-content">

          {/* HEADER */}
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

          {/* =================================================
              EDIT REVIEW
          ================================================= */}
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

                {/* RATING */}
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
                      {ratingLabel(editRating)}
                    </span>
                  )}
                </div>

                {/* REVIEW TEXT */}
                <div className="review-form-group">
                  <label htmlFor="edit-review">
                    Your Review
                  </label>

                  <textarea
                    id="edit-review"
                    rows="5"
                    value={editText}
                    onChange={(e) => {
                      setEditText(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Update your experience..."
                  />
                </div>

                {/* ERROR */}
                {error && (
                  <div className="review-error">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="review-success">
                    {success}
                  </div>
                )}

                {/* BUTTONS */}
                <button
                  type="submit"
                  className="review-submit"
                >
                  Update Review
                </button>

                <button
                  type="button"
                  className="review-cancel"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>

              </form>
            </div>
          )}

          {/* =================================================
              CREATE REVIEW
          ================================================= */}
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

                  {/* TEACHER SELECT */}
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
                      disabled={teachersLoading}
                    >
                      <option value="">
                        {teachersLoading
                          ? "Loading teachers..."
                          : users.length === 0
                          ? "No teachers available"
                          : "Select a teacher"}
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
                  </div>

                  {/* RATING */}
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
                        {ratingLabel(rating)}
                      </span>
                    )}
                  </div>

                  {/* REVIEW */}
                  <div className="review-form-group">
                    <label htmlFor="review">
                      Your Review
                    </label>

                    <textarea
                      id="review"
                      rows="5"
                      value={reviewText}
                      onChange={(e) => {
                        setReviewText(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      placeholder="Write your experience with this teacher..."
                    />
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="review-error">
                      {error}
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div className="review-success">
                      {success}
                    </div>
                  )}

                  {/* SUBMIT */}
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

          {/* =================================================
              REVIEWS
          ================================================= */}
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

            {/* GLOBAL ERROR */}
            {error && !editingReview && (
              <div className="review-error">
                {error}
              </div>
            )}

            {/* GLOBAL SUCCESS */}
            {success && !editingReview && (
              <div className="review-success">
                {success}
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="review-message">
                Loading reviews...
              </div>
            )}

            {/* EMPTY */}
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

            {/* REVIEW LIST */}
            {!loading && reviews.length > 0 && (
              <div className="reviews-list">

                {reviews.map((review) => (
                  <div
                    className="review-card"
                    key={review.id}
                  >

                    {/* CARD TOP */}
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
                          Number(review.rating)
                        )}

                        {"☆".repeat(
                          5 - Number(review.rating)
                        )}
                      </div>

                    </div>

                    <div className="review-divider" />

                    {/* REVIEW TEXT */}
                    <p className="review-text">
                      "{review.review_text}"
                    </p>

                    {/* FOOTER */}
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

                    {/* ACTIONS */}
                    {currentUser?.id ===
                      review.student_id && (
                      <div className="review-actions">

                        <button
                          type="button"
                          onClick={() =>
                            startEditing(review)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(review.id)
                          }
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
      </main>
    </div>
  );
}

export default StudentReviews;