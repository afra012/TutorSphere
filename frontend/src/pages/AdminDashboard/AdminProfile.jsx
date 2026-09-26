import { useState } from "react";
import "./AdminProfile.css";
import AdminSidebar from "./AdminSidebar";

function AdminProfile() {

  let currentUser = null;

  const savedUser = localStorage.getItem(
    "currentUser"
  );

  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      currentUser = null;
    }
  }

  const [name, setName] = useState(
    currentUser?.name || ""
  );

  const email = currentUser?.email || "";

  return (
    <>

      <AdminSidebar />
      <main className="admin-profile-page">
        <div className="admin-profile-container">

          <div className="admin-profile-header">

            <span className="admin-profile-badge">
              🛡 Administrator
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your administrator account
              information.
            </p>
          </div>

          <div className="admin-profile-card">

            <div className="admin-profile-avatar">
              {name
                ? name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="admin-profile-form">

              <div className="admin-profile-group">
                <label>Full Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="admin-profile-group">
                <label>Google Email</label>

                <input
                  type="email"
                  value={email}
                  disabled
                />
              </div>

              <div className="admin-profile-role">
                <span>●</span>
                Administrator Account
              </div>

              <button
                type="button"
                className="admin-profile-save"
              >
                Save Changes
              </button>

            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default AdminProfile;