import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

const API_URL = "http://127.0.0.1:8000/api";

function NotificationBell({ role }) {
  const navigate = useNavigate();

  const normalizedRole = String(role || "").toLowerCase();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const fetchNotifications = async () => {
    if (
      normalizedRole !== "teacher" &&
      normalizedRole !== "student"
    ) {
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      setNotificationLoading(true);

      const endpoint =
        normalizedRole === "teacher"
          ? `${API_URL}/teacher/tuition-request-notifications`
          : `${API_URL}/student/teacher-post-request-notifications`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      const list = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      setNotifications(list);

      if (normalizedRole === "teacher") {
        setUnreadCount(Number(data.unread_count || 0));
      } else {
        const unread = list.filter(
          (item) => Number(item.is_read) === 0
        ).length;

        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Notification fetch error:", error);

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchNotifications();
  }, [normalizedRole]);

  /*
  |--------------------------------------------------------------------------
  | TEACHER - MARK ALL READ
  |--------------------------------------------------------------------------
  */

  const markTeacherNotificationsRead = async () => {
    if (normalizedRole !== "teacher") {
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teacher/tuition-request-notifications/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not mark notifications as read."
        );
      }

      setUnreadCount(0);

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: 1,
        }))
      );
    } catch (error) {
      console.error(
        "Mark teacher notifications read error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STUDENT - MARK ONE READ
  |--------------------------------------------------------------------------
  */

  const markStudentNotificationRead = async (notification) => {
    if (
      normalizedRole !== "student" ||
      Number(notification.is_read) === 1
    ) {
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    const notificationId =
      notification.notification_id || notification.id;

    try {
      const response = await fetch(
        `${API_URL}/student/teacher-post-request-notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not mark notification as read."
        );
      }

      setNotifications((current) =>
        current.map((item) => {
          const itemId =
            item.notification_id || item.id;

          if (itemId === notificationId) {
            return {
              ...item,
              is_read: 1,
            };
          }

          return item;
        })
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (error) {
      console.error(
        "Student notification read error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STUDENT - ACCEPT / REJECT
  |--------------------------------------------------------------------------
  */

  const respondToTeacherRequest = async (
    event,
    notification,
    status
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    const notificationId =
      notification.notification_id || notification.id;

    try {
      const response = await fetch(
        `${API_URL}/student/teacher-post-request-notifications/${notificationId}/respond`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update request."
        );
      }

      const wasUnread =
        Number(notification.is_read) === 0;

      setNotifications((current) =>
        current.map((item) => {
          const itemId =
            item.notification_id || item.id;

          if (itemId === notificationId) {
            return {
              ...item,
              request_status: status,
              is_read: 1,
            };
          }

          return item;
        })
      );

      if (wasUnread) {
        setUnreadCount((count) =>
          Math.max(0, count - 1)
        );
      }

      setResponseMessage(null);
    } catch (error) {
      console.error(
        "Request response error:",
        error
      );

      setResponseMessage({ notificationId, message: error.message || "Could not update request." });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TEACHER - DELETE OLD NOTIFICATION
  |--------------------------------------------------------------------------
  */

  const deleteTeacherNotification = async (
    event,
    notification
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("authToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/teacher/tuition-request-notifications/${notification.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete notification."
        );
      }

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notification.id
        )
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BELL
  |--------------------------------------------------------------------------
  */

  const handleBellClick = async () => {
    const willOpen = !notificationOpen;

    setNotificationOpen(willOpen);

    if (willOpen) {
      await fetchNotifications();

      if (normalizedRole === "teacher") {
        await markTeacherNotificationsRead();
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="notification-wrapper">

      <button
        type="button"
        className="notification-button"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="notification-dropdown">

          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
          </div>

          <div className="notification-dropdown-body">

            {notificationLoading ? (
              <div className="notification-empty">
                Loading...
              </div>

            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                No notifications yet.
              </div>

            ) : (
              notifications.map((notification) => {
                const notificationId =
                  notification.notification_id ||
                  notification.id;

                return (
                  <div
                    key={notificationId}
                    className={`notification-item ${
                      Number(notification.is_read) === 0
                        ? "notification-unread"
                        : ""
                    }`}
                    onClick={() => {
                      if (normalizedRole === "teacher") {
                        setNotificationOpen(false);

                        navigate("/teacher-requests");
                      } else {
                        markStudentNotificationRead(
                          notification
                        );
                      }
                    }}
                  >
                    <div className="notification-item-icon">
                      ✉
                    </div>

                    <div className="notification-item-text">

                      <strong>
                        {normalizedRole === "student"
                          ? "Teacher Request"
                          : "Tutor Request"}
                      </strong>

                      <p>{notification.message}</p>

                      {normalizedRole === "student" && (
                        <div className="teacher-request-info">

                          {notification.qualification && (
                            <span>
                              <b>Qualification:</b>{" "}
                              {notification.qualification}
                            </span>
                          )}

                          {notification.institution && (
                            <span>
                              <b>Institution:</b>{" "}
                              {notification.institution}
                            </span>
                          )}

                          {notification.teaching_experience && (
                            <span>
                              <b>Experience:</b>{" "}
                              {notification.teaching_experience}
                            </span>
                          )}

                          {notification.hourly_rate && (
                            <span>
                              <b>Hourly Rate:</b>{" "}
                              {notification.hourly_rate}
                            </span>
                          )}

                          {notification.location && (
                            <span>
                              <b>Location:</b>{" "}
                              {notification.location}
                            </span>
                          )}

                          {notification.tutoring_mode && (
                            <span>
                              <b>Mode:</b>{" "}
                              {notification.tutoring_mode}
                            </span>
                          )}

                          {notification.request_status ===
                            "pending" && (
                            <div className="request-response-buttons">

                              <button
                                type="button"
                                className="request-accept-button"
                                onClick={(event) =>
                                  respondToTeacherRequest(
                                    event,
                                    notification,
                                    "accepted"
                                  )
                                }
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                className="request-reject-button"
                                onClick={(event) =>
                                  respondToTeacherRequest(
                                    event,
                                    notification,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>

                            </div>
                          )}

                          {notification.request_status !==
                            "pending" && (
                            <div className="request-response-message request-response-success" role="status">
                              Request {notification.request_status} successfully.
                            </div>
                          )}

                          {responseMessage?.notificationId === notificationId && (
                            <div className={`request-response-message ${responseMessage.message?.toLowerCase().includes("successfully") ? "request-response-success" : "request-response-error"}`} role="status">
                              {responseMessage.message}
                            </div>
                          )}

                        </div>
                      )}

                      <div className="notification-item-bottom">
                        <small>
                          {formatDate(
                            notification.created_at
                          )}
                        </small>
                      </div>

                    </div>

                    {normalizedRole === "teacher" && (
                      <button
                        type="button"
                        className="notification-delete-button"
                        onClick={(event) =>
                          deleteTeacherNotification(
                            event,
                            notification
                          )
                        }
                        aria-label="Delete notification"
                      >
                        ×
                      </button>
                    )}

                  </div>
                );
              })
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default NotificationBell;
