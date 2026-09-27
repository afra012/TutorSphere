import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TeacherSidebar from "../TeacherDashboard/components/TeacherSidebar";
import "./Chat.css";

function Chat() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  const role = String(
    currentUser?.role ||
      localStorage.getItem("role") ||
      "student"
  ).toLowerCase();

  // Temporary frontend data.
  // Backend/API will replace this later.
  const [acceptedUsers] = useState([
    {
      id: 1,
      name: "Accepted User",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

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

              {filteredUsers.length === 0 ? (
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
                        Accepted connection
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

                <div className="chat-blank-area">
                  {/* Messaging UI will be added later */}
                </div>
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