import { useEffect, useState } from "react";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";

import "./StudentProfile.css";

export default function StudentProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    educationLevel: "",
    institution: "",
    classGrade: "",
    preferredTime: "",
    aboutMe: "",
  });

  // Saved image URL / temporary preview
  const [profileImage, setProfileImage] = useState(null);

  // Actual selected image file
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD STUDENT PROFILE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setErrorMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/student/profile",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(
            data.message || "Failed to load profile."
          );
          return;
        }

        const profile = data.profile;

        if (profile) {
          setFormData({
            fullName: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            educationLevel: profile.education_level || "",
            institution: profile.institution || "",
            classGrade: profile.class_grade || "",
            preferredTime: profile.preferred_time || "",
            aboutMe: profile.about_me || "",
          });

          /*
          |--------------------------------------------------------------------------
          | LOAD SAVED PROFILE IMAGE
          |--------------------------------------------------------------------------
          */

          if (profile.profile_image_url) {
            setProfileImage(profile.profile_image_url);
          } else {
            setProfileImage(null);
          }
        }
      } catch (error) {
        console.error("Profile load error:", error);

        setErrorMessage(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE PROFILE IMAGE
  |--------------------------------------------------------------------------
  */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      e.target.value = "";
      return;
    }

    /*
     * Keep actual File object.
     * This is what Laravel will receive.
     */
    setProfileImageFile(file);

    /*
     * Temporary preview before saving.
     */
    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);

    setSuccessMessage("");
    setErrorMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE + IMAGE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setSaving(true);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setErrorMessage("Please login first.");
      setSaving(false);
      return;
    }

    try {
      /*
      |--------------------------------------------------------------------------
      | FORMDATA
      |--------------------------------------------------------------------------
      */

      const dataToSend = new FormData();

      dataToSend.append(
        "name",
        formData.fullName
      );

      dataToSend.append(
        "email",
        formData.email
      );

      dataToSend.append(
        "phone",
        formData.phone
      );

      dataToSend.append(
        "address",
        formData.address
      );

      dataToSend.append(
        "education_level",
        formData.educationLevel
      );

      dataToSend.append(
        "institution",
        formData.institution
      );

      dataToSend.append(
        "class_grade",
        formData.classGrade
      );

      dataToSend.append(
        "preferred_time",
        formData.preferredTime
      );

      dataToSend.append(
        "about_me",
        formData.aboutMe
      );

      /*
      |--------------------------------------------------------------------------
      | PROFILE IMAGE
      |--------------------------------------------------------------------------
      */

      if (profileImageFile) {
        dataToSend.append(
          "profile_image",
          profileImageFile
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SEND TO LARAVEL
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        "http://127.0.0.1:8000/api/student/profile",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: dataToSend,
        }
      );

      const data = await response.json();

      console.log("Profile save response:", data);

      /*
      |--------------------------------------------------------------------------
      | HANDLE ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        if (data.errors) {
          const firstError =
            Object.values(data.errors)[0];

          setErrorMessage(
            Array.isArray(firstError)
              ? firstError[0]
              : firstError
          );
        } else {
          setErrorMessage(
            data.message ||
              "Profile update failed."
          );
        }

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | PERMANENT IMAGE URL FROM BACKEND
      |--------------------------------------------------------------------------
      */

      if (data.profile_image_url) {
        setProfileImage(
          data.profile_image_url
        );
      }

      // Image has already been uploaded
      setProfileImageFile(null);

      /*
      |--------------------------------------------------------------------------
      | UPDATE LOCAL STORAGE USER
      |--------------------------------------------------------------------------
      */

      const storedUser =
        localStorage.getItem("currentUser");

      if (storedUser) {
        try {
          const currentUser =
            JSON.parse(storedUser);

          const updatedUser = {
            ...currentUser,
            name: formData.fullName,
            email: formData.email,
          };

          localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
          );
        } catch (error) {
          console.error(
            "Local user update error:",
            error
          );
        }
      }

      setSuccessMessage(
        data.message ||
          "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setErrorMessage(
        "Unable to connect to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="student-profile-page">
      {/* ================= SIDEBAR ================= */}

      <DashboardSidebar />

      {/* ================= MAIN CONTENT ================= */}

      <section className="student-profile-content">

        {/* ================= PAGE HEADER ================= */}

        <div className="student-profile-header">
          <div className="student-profile-title">
            <h1>My Profile</h1>

            <p>
              Manage your personal information and learning preferences.
            </p>
          </div>

          <button
            type="submit"
            form="student-profile-form"
            className="student-save-button"
            disabled={saving || loading}
          >
            <span className="student-save-icon">
              ▣
            </span>

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        {/* ================= SUCCESS MESSAGE ================= */}

        {successMessage && (
          <div className="student-profile-success">
            ✓ {successMessage}
          </div>
        )}

        {/* ================= ERROR MESSAGE ================= */}

        {errorMessage && (
          <div
            className="student-profile-success"
            style={{
              color: "#b42318",
              backgroundColor: "#fef3f2",
              borderColor: "#fecdca",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* ================= FORM ================= */}

        <form
          id="student-profile-form"
          className="student-profile-card"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >

          {/* ================= PROFILE PICTURE ================= */}

          <div className="student-profile-section">
            <h3>Profile Picture</h3>

            <div className="student-picture-container">

              <div className="student-picture-wrapper">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Student profile preview"
                    className="student-profile-image"
                  />
                ) : (
                  <div className="student-default-profile">
                    <div className="student-default-head"></div>

                    <div className="student-default-body"></div>
                  </div>
                )}

                <div className="student-camera-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />

                    <circle
                      cx="12"
                      cy="13"
                      r="3"
                    />
                  </svg>
                </div>
              </div>

              <div className="student-upload-area">
                <p>
                  Upload your profile picture
                </p>

                <span>
                  JPG, PNG or GIF. Max size 2MB.
                </span>

                <label className="student-upload-button">
                  Upload Photo

                  <input
                    type="file"
                    name="profile_image"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="student-profile-divider"></div>

          {/* ================= BASIC INFORMATION ================= */}

          <div className="student-profile-section">
            <h3>Basic Information</h3>

            <div className="student-profile-grid">

              {/* ================= FULL NAME ================= */}

              <div className="student-profile-field">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                      />

                      <path d="M5 21c1-4 3-6 7-6s6 2 7 6" />
                    </svg>
                  </span>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* ================= EMAIL ================= */}

              <div className="student-profile-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />

                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* ================= PHONE ================= */}

              <div className="student-profile-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 3h3l2 5-2 2c1 3 3 5 6 6l2-2 4 2v3c0 1-1 2-2 2C10 21 3 14 3 5c0-1 1-2 3-2Z" />
                    </svg>
                  </span>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* ================= ADDRESS ================= */}

              <div className="student-profile-field">
                <label htmlFor="address">
                  Address
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21s6-5 6-11a6 6 0 1 0-12 0c0 6 6 11 6 11Z" />

                      <circle
                        cx="12"
                        cy="10"
                        r="2"
                      />
                    </svg>
                  </span>

                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* ================= EDUCATION LEVEL ================= */}

              <div className="student-profile-field">
                <label htmlFor="educationLevel">
                  Education Level
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m3 10 9-5 9 5-9 5-9-5Z" />

                      <path d="M7 12v5c3 2 7 2 10 0v-5" />
                    </svg>
                  </span>

                  <select
                    id="educationLevel"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select education level
                    </option>

                    <option value="Primary">
                      Primary
                    </option>

                    <option value="Secondary">
                      Secondary
                    </option>

                    <option value="Higher Secondary">
                      Higher Secondary
                    </option>

                    <option value="Undergraduate">
                      Undergraduate
                    </option>

                    <option value="Graduate">
                      Graduate
                    </option>
                  </select>
                </div>
              </div>

              {/* ================= INSTITUTION ================= */}

              <div className="student-profile-field">
                <label htmlFor="institution">
                  Institution
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 21h18" />

                      <path d="M5 21V9h14v12" />

                      <path d="M3 9 12 4l9 5" />

                      <path d="M9 13v4M15 13v4" />
                    </svg>
                  </span>

                  <input
                    id="institution"
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Enter your institution"
                  />
                </div>
              </div>

              {/* ================= CLASS / GRADE ================= */}

              <div className="student-profile-field">
                <label htmlFor="classGrade">
                  Class / Grade
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 5h16v14H4z" />

                      <path d="M8 9h8M8 13h5" />
                    </svg>
                  </span>

                  <input
                    id="classGrade"
                    type="text"
                    name="classGrade"
                    value={formData.classGrade}
                    onChange={handleChange}
                    placeholder="Enter your class / grade"
                  />
                </div>
              </div>

              {/* ================= PREFERRED TIME ================= */}

              <div className="student-profile-field">
                <label htmlFor="preferredTime">
                  Preferred Time for Tutoring
                </label>

                <div className="student-input-container">
                  <span className="student-field-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />

                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>

                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select preferred time
                    </option>

                    <option value="Morning">
                      Morning
                    </option>

                    <option value="Afternoon">
                      Afternoon
                    </option>

                    <option value="Evening">
                      Evening
                    </option>

                    <option value="Night">
                      Night
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="student-profile-divider"></div>

          {/* ================= ABOUT ME ================= */}

          <div className="student-profile-section">
            <h3>About Me</h3>

            <div className="student-about-container">
              <span className="student-about-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 20h4l11-11-4-4L4 16v4Z" />

                  <path d="m13 7 4 4" />
                </svg>
              </span>

              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                placeholder="Write a short bio about yourself..."
                maxLength={300}
                rows={4}
              />

              <span className="student-character-count">
                {formData.aboutMe.length} / 300
              </span>
            </div>
          </div>

          {/* ================= NOTE ================= */}

          <div className="student-profile-note">
            <span className="student-note-icon">
              i
            </span>

            <span>
              This information will help tutors find and connect with you easily.
            </span>
          </div>
        </form>
      </section>
    </main>
  );
}