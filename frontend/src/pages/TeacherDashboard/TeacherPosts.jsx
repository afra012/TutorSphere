import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import TeacherSidebar from "./components/TeacherSidebar";
import "./TeacherPosts.css";

const API_URL = "http://127.0.0.1:8000/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("auth_token") ||
  "";

export default function TeacherPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  // Keeps request status for each student post
  // Example:
  // {
  //   1: "requested",
  //   2: "requesting"
  // }
  const [requestStatusByPostId, setRequestStatusByPostId] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const config = {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        /*
        |--------------------------------------------------------------------------
        | Load Student Posts
        |--------------------------------------------------------------------------
        */

        const postsResponse = await axios.get(
          `${API_URL}/tutor-posts`,
          config
        );

        const loadedPosts = Array.isArray(postsResponse.data?.posts)
          ? postsResponse.data.posts
          : [];

        setPosts(loadedPosts);

        /*
        |--------------------------------------------------------------------------
        | Load Teacher's Existing Requests
        |--------------------------------------------------------------------------
        */

        try {
          const requestsResponse = await axios.get(
            `${API_URL}/teacher/post-requests`,
            config
          );

          const existingRequests = Array.isArray(
            requestsResponse.data?.requests
          )
            ? requestsResponse.data.requests
            : [];

          const statusMap = {};

          existingRequests.forEach((request) => {
            /*
             * pending or accepted means there is already
             * an active request for this post.
             */
            if (
              request.status === "pending" ||
              request.status === "accepted"
            ) {
              statusMap[request.tutor_post_id] = "requested";
            }
          });

          setRequestStatusByPostId(statusMap);
        } catch (requestError) {
          console.error(
            "Failed to load teacher post requests:",
            requestError
          );
        }
      } catch (error) {
        console.error("Failed to load student posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Close Post Modal
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    setSelectedPost(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Teacher Sends Request to Student Post
  |--------------------------------------------------------------------------
  */

  const sendRequest = async () => {
    if (!selectedPost) {
      return;
    }

    const postId = selectedPost.id;
    const currentStatus = requestStatusByPostId[postId];

    // Prevent repeated clicking from frontend
    if (
      currentStatus === "requesting" ||
      currentStatus === "requested"
    ) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Show Requesting... while API call is running
      setRequestStatusByPostId((current) => ({
        ...current,
        [postId]: "requesting",
      }));

      const response = await axios.post(
        `${API_URL}/teacher/post-requests`,
        {
          tutor_post_id: postId,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Backend successfully created request.
       * Change button to Requested.
       */
      if (
        response.data?.request?.status === "pending" ||
        response.data?.request?.status === "accepted"
      ) {
        setRequestStatusByPostId((current) => ({
          ...current,
          [postId]: "requested",
        }));
      } else {
        setRequestStatusByPostId((current) => ({
          ...current,
          [postId]: "requested",
        }));
      }

      window.alert(
        response.data?.message || "Request sent successfully."
      );
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      /*
       * Backend also prevents duplicate active requests.
       *
       * If backend says request already exists,
       * frontend should still show Requested.
       */
      if (
        status === 422 &&
        message?.toLowerCase().includes("already")
      ) {
        setRequestStatusByPostId((current) => ({
          ...current,
          [postId]: "requested",
        }));

        window.alert(
          message || "You already requested this student post."
        );

        return;
      }

      console.error("Failed to send request:", error);

      // Allow teacher to try again after a real error
      setRequestStatusByPostId((current) => ({
        ...current,
        [postId]: "idle",
      }));

      window.alert(
        message || "Request could not be sent. Please try again."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Current Selected Post Request Status
  |--------------------------------------------------------------------------
  */

  const selectedPostRequestStatus = selectedPost
    ? requestStatusByPostId[selectedPost.id]
    : null;

  const isRequesting =
    selectedPostRequestStatus === "requesting";

  const isRequested =
    selectedPostRequestStatus === "requested";

  return (
    <main className="teacher-posts-layout">
      <TeacherSidebar />

      <section className="teacher-posts-content">
        <div className="teacher-posts-header">
          <div>
            <p className="teacher-posts-label">
              Tutor opportunities
            </p>

            <h1>Student Posts</h1>

            <p className="teacher-posts-subtitle">
              Browse active tutoring requests and find students
              who need your expertise.
            </p>
          </div>

          <div className="posts-count-box">
            <span>{posts.length}</span>
            <small>Active Posts</small>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="teacher-posts-empty">
            <div className="loading-spinner"></div>
            <p>Loading student posts...</p>
          </div>
        )}

        {/* No Posts */}
        {!loading && posts.length === 0 && (
          <div className="teacher-posts-empty">
            <div className="empty-post-icon">📚</div>

            <h3>No active student posts</h3>

            <p>
              There are currently no tutoring requests available.
            </p>
          </div>
        )}

        {/* Student Post Cards */}
        {!loading && posts.length > 0 && (
          <div className="teacher-posts-grid">
            {posts.map((post) => {
              const postRequestStatus =
                requestStatusByPostId[post.id];

              return (
                <article
                  className="teacher-post-card"
                  key={post.id}
                >
                  <div className="post-card-top">
                    <div className="post-subject-icon">
                      📖
                    </div>

                    <span className="post-mode">
                      {post.tutoring_mode || "Online"}
                    </span>
                  </div>

                  <div className="post-card-content">
                    <h2>
                      {post.subject_name ||
                        "Subject not specified"}
                    </h2>

                    <p className="post-description">
                      {post.description
                        ? post.description.length > 120
                          ? `${post.description.substring(
                              0,
                              120
                            )}...`
                          : post.description
                        : "No description provided."}
                    </p>
                  </div>

                  <div className="post-info-grid">
                    <div className="post-info-item">
                      <span className="info-icon">👤</span>

                      <div>
                        <small>Student</small>

                        <strong>
                          {post.student_name ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>

                    <div className="post-info-item">
                      <span className="info-icon">📍</span>

                      <div>
                        <small>Location</small>

                        <strong>
                          {post.location ||
                            "Not specified"}
                        </strong>
                      </div>
                    </div>

                    <div className="post-info-item">
                      <span className="info-icon">💰</span>

                      <div>
                        <small>Budget</small>

                        <strong>
                          BDT{" "}
                          {post.salary_min ??
                            post.salary_amount ??
                            "0"}{" "}
                          -{" "}
                          {post.salary_max ??
                            post.salary_amount ??
                            "0"}
                        </strong>
                      </div>
                    </div>

                    <div className="post-info-item">
                      <span className="info-icon">🗓️</span>

                      <div>
                        <small>Payment</small>

                        <strong>
                          {post.salary_period ||
                            "Flexible"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="post-card-footer">
                    <div className="contact-preview">
                      {postRequestStatus === "requested" ? (
                        <>
                          <span>✓</span>
                          <span>Requested</span>
                        </>
                      ) : (
                        <>
                          <span>📞</span>

                          <span>
                            {post.profile_phone ||
                              post.contact_number ||
                              "Contact unavailable"}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="view-post-btn"
                      onClick={() =>
                        setSelectedPost(post)
                      }
                    >
                      View Post
                      <span>→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Post Details Modal */}
      {selectedPost && (
        <div
          className="post-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="post-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="post-modal-header">
              <div className="modal-title-area">
                <div className="modal-subject-icon">
                  📖
                </div>

                <div>
                  <span>
                    Student Tutoring Request
                  </span>

                  <h2>
                    {selectedPost.subject_name ||
                      "Subject not specified"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="post-modal-body">
              <div className="modal-status-row">
                <span className="modal-active-badge">
                  ● Active Request
                </span>

                <span className="modal-mode-badge">
                  {selectedPost.tutoring_mode ||
                    "Online"}
                </span>
              </div>

              <div className="modal-section">
                <h3>About This Request</h3>

                <p className="modal-description">
                  {selectedPost.description ||
                    "No description provided by the student."}
                </p>
              </div>

              <div className="modal-section">
                <h3>Request Details</h3>

                <div className="modal-details-grid">
                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      👤
                    </span>

                    <div>
                      <small>Student</small>

                      <strong>
                        {selectedPost.student_name ||
                          "Not available"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      📚
                    </span>

                    <div>
                      <small>Subject</small>

                      <strong>
                        {selectedPost.subject_name ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      📍
                    </span>

                    <div>
                      <small>Location</small>

                      <strong>
                        {selectedPost.location ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      💰
                    </span>

                    <div>
                      <small>Budget</small>

                      <strong>
                        BDT{" "}
                        {selectedPost.salary_min ??
                          selectedPost.salary_amount ??
                          "Not specified"}{" "}
                        -{" "}
                        {selectedPost.salary_max ??
                          selectedPost.salary_amount ??
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      🗓️
                    </span>

                    <div>
                      <small>
                        Payment Period
                      </small>

                      <strong>
                        {selectedPost.salary_period ||
                          "Flexible"}
                      </strong>
                    </div>
                  </div>

                  <div className="modal-detail">
                    <span className="modal-detail-icon">
                      💻
                    </span>

                    <div>
                      <small>
                        Tutoring Mode
                      </small>

                      <strong>
                        {selectedPost.tutoring_mode ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-contact-box">
                <div className="modal-contact-icon">
                  📞
                </div>

                <div>
                  <small>Contact Number</small>

                  <strong>
                    {selectedPost.profile_phone ||
                      selectedPost.contact_number ||
                      "Contact unavailable"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="post-modal-footer">
              <button
                type="button"
                className="modal-close-secondary"
                onClick={closeModal}
              >
                Close
              </button>

              <button
                type="button"
                className="modal-contact-btn"
                onClick={sendRequest}
                disabled={
                  isRequesting ||
                  isRequested
                }
              >
                {isRequesting
                  ? "Requesting..."
                  : isRequested
                  ? "✓ Requested"
                  : "Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}