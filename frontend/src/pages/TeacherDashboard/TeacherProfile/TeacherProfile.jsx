import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TeacherProfile.css";

function Icon({ name }) {
  const icons = {
    dashboard: (
      <path d="M3 12 12 4l9 8v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8Z" />
    ),

    requests: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),

    reviews: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),

    profile: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
      </>
    ),
  };

  return (
    <svg
      className="teacher-sidebar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

export default function TeacherProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
    gender: "",
    subjects: "",
    qualification: "",
    experience: "",
    hourlyRate: "",
    institution: "",
    certification: "",
    bio: "",
    languages: "",
    availability: "",
    timeZone: "",
    online: false,
    inPerson: false,
    both: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.clear();

    navigate("/", { replace: true });
  };

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: "dashboard",
      path: "/teacher-dashboard",
    },
    {
      label: "My Requests",
      icon: "requests",
      path: "/teacher-requests",
    },
    {
      label: "My Reviews",
      icon: "reviews",
      path: "/teacher-reviews",
    },
    {
      label: "Profile",
      icon: "profile",
      path: "/teacher-profile",
    },
  ];

  return (
    <main className="teacher-profile-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="teacher-profile-sidebar">
        <nav className="teacher-sidebar-nav">

          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`teacher-sidebar-link ${
                location.pathname === item.path ? "is-active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="teacher-sidebar-divider"></div>

          <button
            type="button"
            className="teacher-sidebar-link teacher-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>

        </nav>
      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <section className="teacher-profile-content">

        {/* ================= PAGE TITLE ================= */}

        <div className="teacher-profile-heading">
          <h1>Teacher Profile</h1>

          <p>
            Update your profile information and preferences.
          </p>
        </div>


        {/* ================= PROFILE FORM ================= */}

        <form
          className="teacher-profile-card"
          onSubmit={handleSubmit}
        >

          {/* ================= TOP SECTION ================= */}

          <section className="teacher-top-section">

            {/* PROFILE PICTURE */}

            <div className="teacher-picture-column">

              <h3>Profile Picture</h3>

              <div className="teacher-picture-wrapper">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Teacher profile"
                  />
                ) : (
                  <div className="teacher-default-avatar">
                    <div className="teacher-avatar-head"></div>
                    <div className="teacher-avatar-body"></div>
                  </div>
                )}

                <span className="teacher-camera-icon">
                  📷
                </span>

              </div>

              <p>
                JPG, PNG or GIF. Max size 2MB.
              </p>

              <label className="teacher-upload-button">
                Upload Photo

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={handleImageChange}
                />
              </label>

            </div>


            {/* PERSONAL INFORMATION */}

            <div className="teacher-personal-section">

              <h3>
                ♙ Personal Information
              </h3>

              <div className="teacher-form-grid">

                <div className="teacher-field">
                  <label>
                    Full Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>


                <div className="teacher-field">
                  <label>
                    Email Address <span>*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>


                <div className="teacher-field">
                  <label>
                    Phone Number <span>*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>


                <div className="teacher-field">
                  <label>
                    Location <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                  />
                </div>


                <div className="teacher-field">
                  <label>Date of Birth</label>

                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>


                <div className="teacher-field">
                  <label>Gender</label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>
                </div>

              </div>

            </div>

          </section>


          <div className="teacher-divider"></div>


          {/* ================= PROFESSIONAL INFORMATION ================= */}

          <section className="teacher-form-section">

            <h3>
              ▣ Professional Information
            </h3>

            <div className="teacher-form-grid">

              <div className="teacher-field">
                <label>
                  Subject(s) You Teach <span>*</span>
                </label>

                <select
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                >
                  <option value="">
                    Select subjects
                  </option>

                  <option value="Mathematics">
                    Mathematics
                  </option>

                  <option value="Physics">
                    Physics
                  </option>

                  <option value="Chemistry">
                    Chemistry
                  </option>

                  <option value="English">
                    English
                  </option>

                  <option value="Biology">
                    Biology
                  </option>

                  <option value="ICT">
                    ICT
                  </option>

                </select>
              </div>


              <div className="teacher-field">
                <label>
                  Qualification <span>*</span>
                </label>

                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="Enter highest qualification"
                />
              </div>


              <div className="teacher-field">
                <label>
                  Teaching Experience <span>*</span>
                </label>

                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="">
                    Select experience
                  </option>

                  <option value="Less than 1 year">
                    Less than 1 year
                  </option>

                  <option value="1-2 years">
                    1-2 years
                  </option>

                  <option value="3-5 years">
                    3-5 years
                  </option>

                  <option value="5-10 years">
                    5-10 years
                  </option>

                  <option value="10+ years">
                    10+ years
                  </option>

                </select>
              </div>


              <div className="teacher-field">
                <label>
                  Hourly Rate (USD) <span>*</span>
                </label>

                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Enter hourly rate"
                />
              </div>


              <div className="teacher-field">
                <label>
                  Institution / University
                </label>

                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Enter your institution"
                />
              </div>


              <div className="teacher-field">
                <label>
                  Certification (if any)
                </label>

                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="Enter certification"
                />
              </div>

            </div>


            {/* BIO */}

            <div className="teacher-field teacher-full-field">

              <label>
                Bio / About Me <span>*</span>
              </label>

              <div className="teacher-textarea-wrapper">

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write a short bio about yourself..."
                  maxLength={300}
                />

                <small>
                  {formData.bio.length}/300
                </small>

              </div>

            </div>

          </section>


          <div className="teacher-divider"></div>


          {/* ================= ADDITIONAL INFORMATION ================= */}

          <section className="teacher-form-section">

            <h3>
              ▭ Additional Information
            </h3>

            <div className="teacher-form-grid">

              <div className="teacher-field">

                <label>Languages</label>

                <select
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                >
                  <option value="">
                    Select language
                  </option>

                  <option value="English">
                    English
                  </option>

                  <option value="Bangla">
                    Bangla
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                  <option value="Spanish">
                    Spanish
                  </option>

                </select>

              </div>


              <div className="teacher-field">

                <label>Available For</label>

                <div className="teacher-checkbox-row">

                  <label>
                    <input
                      type="checkbox"
                      name="online"
                      checked={formData.online}
                      onChange={handleChange}
                    />

                    Online Tutoring
                  </label>


                  <label>
                    <input
                      type="checkbox"
                      name="inPerson"
                      checked={formData.inPerson}
                      onChange={handleChange}
                    />

                    In-Person Tutoring
                  </label>


                  <label>
                    <input
                      type="checkbox"
                      name="both"
                      checked={formData.both}
                      onChange={handleChange}
                    />

                    Both
                  </label>

                </div>

              </div>


              <div className="teacher-field">

                <label>Availability</label>

                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="">
                    Select availability
                  </option>

                  <option value="Weekday Mornings">
                    Weekday Mornings
                  </option>

                  <option value="Weekday Evenings">
                    Weekday Evenings
                  </option>

                  <option value="Weekends">
                    Weekends
                  </option>

                  <option value="Flexible">
                    Flexible
                  </option>

                </select>

              </div>


              <div className="teacher-field">

                <label>Time Zone</label>

                <select
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleChange}
                >
                  <option value="">
                    Select time zone
                  </option>

                  <option value="CST">
                    Central Time (US & Canada)
                  </option>

                  <option value="EST">
                    Eastern Time (US & Canada)
                  </option>

                  <option value="PST">
                    Pacific Time (US & Canada)
                  </option>

                  <option value="BST">
                    Bangladesh Standard Time
                  </option>

                </select>

              </div>

            </div>

          </section>


          {/* ================= ACTION BUTTONS ================= */}

          <div className="teacher-form-actions">

            <button
              type="button"
              className="teacher-cancel-button"
              onClick={() => navigate("/teacher-dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="teacher-save-button"
            >
              Save Changes
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}