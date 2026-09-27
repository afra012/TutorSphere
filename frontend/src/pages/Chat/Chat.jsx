import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TeacherSidebar from "../TeacherDashboard/components/TeacherSidebar";
import "./Chat.css";

function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  const role = String(
    currentUser?.role ||
      localStorage.getItem("role") ||
      "student"
  ).toLowerCase();

  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    const loadAcceptedUsers = async (initialLoad = false) => {
      if (initialLoad) setLoadingUsers(true);
      try {
        const { data } = await api.get("/chat/users");
        if (isActive) {
          setAcceptedUsers(Array.isArray(data?.users) ? data.users : []);
          setUsersError("");
        }
      } catch (error) {
        if (!isActive) return;

        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setUsersError("Could not load accepted connections.");
      } finally {
        if (isActive && initialLoad) setLoadingUsers(false);
      }
    };

    loadAcceptedUsers(true);
    const refreshTimer = window.setInterval(() => loadAcceptedUsers(), 5000);
    window.addEventListener("focus", loadAcceptedUsers);

    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", loadAcceptedUsers);
    };
  }, [navigate]);

  useEffect(() => {
    const requestedUserId = Number(searchParams.get("userId"));
    if (!requestedUserId) return;

    const user = acceptedUsers.find((item) => Number(item.id) === requestedUserId);
    if (user) setSelectedUser(user);
  }, [acceptedUsers, searchParams]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return undefined;
    }

    let isActive = true;
    const loadMessages = async (showLoading = false) => {
      if (showLoading) setMessagesLoading(true);
      try {
        const { data } = await api.get(`/chat/messages/${selectedUser.id}`);
        if (isActive) {
          setMessages(Array.isArray(data?.messages) ? data.messages : []);
          setMessagesError("");
        }
      } catch (error) {
        if (!isActive) return;
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setMessagesError(error.response?.data?.message || "Could not load messages.");
      } finally {
        if (isActive && showLoading) setMessagesLoading(false);
      }
    };

    setMessages([]);
    setMessagesError("");
    loadMessages(true);
    const refreshTimer = window.setInterval(() => loadMessages(), 4000);

    return () => {
      isActive = false;
      window.clearInterval(refreshTimer);
    };
  }, [selectedUser, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredUsers = useMemo(() => {
    return acceptedUsers.filter((user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [acceptedUsers, search]);

  const handleBack = () => {
    if (role === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!body || !selectedUser || sendingMessage) return;

    setSendingMessage(true);
    setMessagesError("");
    try {
      const { data } = await api.post(`/chat/messages/${selectedUser.id}`, { body });
      if (data?.message) {
        setMessages((current) => [...current, data.message]);
      }
      setMessageDraft("");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login", { replace: true });
      } else {
        setMessagesError(error.response?.data?.message || "Message could not be sent.");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="chat-page">
      <Navbar
        dashboardMode={true}
        role={role}
      />

      {role === "teacher" ? (
        <TeacherSidebar />
      ) : (
        <DashboardSidebar />
      )}

      <main className="chat-main">
        <div className="chat-container">

          {/* LEFT SIDE */}
          <section className="chat-list-panel">

            <div className="chat-list-header">
              <button
                type="button"
                className="chat-back-button"
                onClick={handleBack}
              >
                ←
              </button>

              <h2>Chat</h2>
            </div>

            <div className="chat-search-wrapper">
              <span className="chat-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="chat-user-list">

              {loadingUsers ? (
                <div className="chat-empty-list">
                  Loading accepted connections...
                </div>
              ) : usersError ? (
                <div className="chat-empty-list">
                  {usersError}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="chat-empty-list">
                  No accepted users found.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`chat-user-item ${
                      selectedUser?.id === user.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedUser(user)
                    }
                  >
                    <div className="chat-user-avatar">
                      {user.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="chat-user-details">
                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.role
                          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                          : "Accepted connection"}
                      </span>
                    </div>
                  </button>
                ))
              )}

            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="chat-content-panel">

            {selectedUser ? (
              <>
                <div className="chat-content-header">
                  <div className="chat-user-avatar large">
                    {selectedUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3>
                      {selectedUser.name}
                    </h3>

                    <span>
                      Chat
                    </span>
                  </div>
                </div>

                <div className="chat-message-area" aria-live="polite">
                  {messagesLoading ? (
                    <div className="chat-message-state">Loading messages...</div>
                  ) : messages.length === 0 && !messagesError ? (
                    <div className="chat-message-state">Start the conversation by sending a message.</div>
                  ) : (
                    messages.map((message) => {
                      const isMine = Number(message.sender_id) === Number(currentUser?.id);
                      return (
                        <div
                          key={message.id}
                          className={`chat-message-row ${isMine ? "is-mine" : "is-theirs"}`}
                        >
                          <div className="chat-message-bubble">
                            <p>{message.body}</p>
                            <time dateTime={message.created_at}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </time>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messagesError && (
                  <div className="chat-message-error" role="alert">
                    {messagesError}
                  </div>
                )}

                <form className="chat-composer" onSubmit={sendMessage}>
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder={`Message ${selectedUser.name}...`}
                    aria-label={`Message ${selectedUser.name}`}
                    maxLength={5000}
                    rows={1}
                  />
                  <button type="submit" disabled={!messageDraft.trim() || sendingMessage}>
                    {sendingMessage ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="chat-placeholder-icon">
                  💬
                </div>

                <h3>
                  Select a user to open chat
                </h3>

                <p>
                  Accepted users will appear in your chat list.
                </p>
              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}

export default Chat;
