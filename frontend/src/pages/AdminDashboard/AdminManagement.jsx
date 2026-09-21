import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminManagement.css";

function AdminManagement() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter both name and email.");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/add-admin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate("/");
        return;
      }

      if (response.status === 403) {
        navigate("/admin-dashboard");
        return;
      }

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];

          setError(
            Array.isArray(firstError)
              ? firstError[0]
              : "Unable to add admin."
          );
        } else {
          setError(
            data.message || "Unable to add admin."
          );
        }

        return;
      }

      setSuccess(
        "Admin added successfully. This email can now sign in with Google."
      );

      setName("");
      setEmail("");
    } catch (error) {
      console.error("Add admin error:", error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-management-page">
      <div className="admin-management-container">

        <button
          type="button"
          className="admin-management-back"
          onClick={() =>
            navigate("/admin-dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <div className="admin-management-header">
          <span className="admin-management-badge">
            👥 Admin Management
          </span>

          <h1>Add Admin</h1>

          <p>
            Add a new administrator to TutorSphere.
          </p>
        </div>

        <div className="admin-management-card">

          <div className="admin-management-card-top">
            <div className="admin-management-icon">
              👤
            </div>

            <div>
              <h2>Add New Administrator</h2>

              <p>
                The added Google email will be allowed
                to access the Admin Dashboard.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-management-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-management-message success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="admin-management-group">
              <label htmlFor="admin-name">
                Full Name
              </label>

              <input
                id="admin-name"
                type="text"
                placeholder="Enter admin name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="admin-management-group">
              <label htmlFor="admin-email">
                Google Email
              </label>

              <input
                id="admin-email"
                type="email"
                placeholder="Enter Google email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="admin-management-info">
              <span>ⓘ</span>

              <p>
                This email must be used when signing
                in with Google. Public admin registration
                is not available.
              </p>
            </div>

            <button
              type="submit"
              className="admin-management-submit"
              disabled={loading}
            >
              {loading
                ? "Adding Admin..."
                : "Add Admin"}
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}

export default AdminManagement;