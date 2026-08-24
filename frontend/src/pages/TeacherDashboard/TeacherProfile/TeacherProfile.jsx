import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeacherProfile.css";

const API_URL = "http://127.0.0.1:8000/api";
const BACKEND_URL = "http://127.0.0.1:8000";

/* =========================================================
   Get Token
========================================================= */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("auth_token") ||
    ""
  );
};

/* =========================================================
   Auth Config
========================================================= */

const getAuthConfig = () => {
  const token = getToken();

  return {
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

/* =========================================================
   Image URL
========================================================= */

function getImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  return `${BACKEND_URL}/${imagePath}`;
}

/* =========================================================
   Icon
========================================================= */

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

/* =========================================================
   Teacher Profile
========================================================= */

export default function TeacherProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =======================================================
     States
  ======================================================= */

  const [profileImage, setProfileImage] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
    gender: "",

    subjects: [],

    qualification: "",
    experience: "",
    hourlyRate: "",
    institution: "",
    certification: "",
    bio: "",

    languages: [],

    availability: "",
    tutoringMode: "",
    timeZone: "",

    online: false,
    inPerson: false,
    both: false,
  });

  /* =======================================================
     Sidebar Items
  ======================================================= */

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

  /* =========================================================
     Load Subjects + Languages
  ========================================================= */

  useEffect(() => {
    const loadOptions = async () => {
      const token = getToken();

      if (!token) {
        setErrorMessage(
          "You are not logged in. Please login again."
        );
        setShowError(true);
        setLoadingOptions(false);
        return;
      }

      try {
        setLoadingOptions(true);

        /*
         * IMPORTANT:
         * Subjects and languages routes are inside
         * auth:sanctum middleware.
         *
         * Therefore getAuthConfig() is required.
         */

        const [subjectResponse, languageResponse] =
          await Promise.all([
            axios.get(
              `${API_URL}/teacher-profile/subjects`,
              getAuthConfig()
            ),

            axios.get(
              `${API_URL}/teacher-profile/languages`,
              getAuthConfig()
            ),
          ]);

        console.log(
          "SUBJECT RESPONSE:",
          subjectResponse.data
        );

        console.log(
          "LANGUAGE RESPONSE:",
          languageResponse.data
        );

        const subjectData = Array.isArray(
          subjectResponse.data?.subjects
        )
          ? subjectResponse.data.subjects
          : [];

        const languageData = Array.isArray(
          languageResponse.data?.languages
        )
          ? languageResponse.data.languages
          : [];

        setSubjects(subjectData);
        setLanguages(languageData);
      } catch (error) {
        console.error(
          "Dropdown API error:",
          error
        );

        console.error(
          "Backend:",
          error.response?.data
        );

        if (error.response?.status === 401) {
          setErrorMessage(
            "Your login session has expired. Please login again."
          );
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to load subjects and languages."
          );
        }

        setShowError(true);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  /* =========================================================
     Load Existing Teacher Profile
  ========================================================= */

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        setErrorMessage(
          "You are not logged in. Please login again."
        );

        setShowError(true);
        setLoadingProfile(false);

        return;
      }

      try {
        setLoadingProfile(true);

        const response = await axios.get(
          `${API_URL}/teacher-profile`,
          getAuthConfig()
        );

        console.log(
          "PROFILE RESPONSE:",
          response.data
        );

        const profile = response.data?.profile;

        /*
         * Profile may not exist yet.
         * Controller returns 404 with profile null.
         */

        if (!profile) {
          setLoadingProfile(false);
          return;
        }

        /* ===================================================
           Subjects
        =================================================== */

        const profileSubjects = Array.isArray(
          profile.subjects
        )
          ? profile.subjects.map((subject) =>
              Number(subject.id)
            )
          : [];

        /* ===================================================
           Languages
        =================================================== */

        const profileLanguages = Array.isArray(
          profile.languages
        )
          ? profile.languages.map((language) =>
              Number(language.id)
            )
          : [];

        /* ===================================================
           Profile Image
        =================================================== */

        setProfileImage(
          getImageUrl(profile.profile_image)
        );

        /* ===================================================
           Tutoring Mode
        =================================================== */

        const tutoringMode =
          profile.tutoring_mode || "";

        /* ===================================================
           Form Data
        =================================================== */

        setFormData({
          fullName:
            profile.user?.name || "",

          email:
            profile.user?.email || "",

          phone:
            profile.phone || "",

          location:
            profile.location || "",

          birthDate:
            profile.date_of_birth || "",

          gender:
            profile.gender || "",

          subjects:
            profileSubjects,

          qualification:
            profile.qualification || "",

          experience:
            profile.teaching_experience || "",

          hourlyRate:
            profile.hourly_rate ?? "",

          institution:
            profile.institution || "",

          certification:
            profile.certification || "",

          bio:
            profile.bio || "",

          languages:
            profileLanguages,

          availability:
            profile.availability || "",

          tutoringMode,

          timeZone:
            profile.time_zone || "",

          online:
            tutoringMode === "Online",

          inPerson:
            tutoringMode === "In-Person",

          both:
            tutoringMode === "Both",
        });
      } catch (error) {
        console.error(
          "Profile load error:",
          error
        );

        console.error(
          "Backend:",
          error.response?.data
        );

        if (error.response?.status === 401) {
          setErrorMessage(
            "Your login session has expired. Please login again."
          );

          setShowError(true);
        } else if (
          error.response?.status !== 404
        ) {
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to load teacher profile."
          );

          setShowError(true);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================================================
     Normal Input Change
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================================================
     Subject Change
  ========================================================= */

  const handleSubjectChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,

      subjects: value
        ? [Number(value)]
        : [],
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================================================
     Language Change
  ========================================================= */

  const handleLanguageChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,

      languages: value
        ? [Number(value)]
        : [],
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================================================
     Upload Profile Image
  ========================================================= */

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /* =====================================================
       Validate Size
    ===================================================== */

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(
        "Please select an image smaller than 2MB."
      );

      setShowError(true);
      setShowSuccess(false);

      e.target.value = "";

      return;
    }

    /* =====================================================
       Validate Type
    ===================================================== */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Please select a JPG, PNG or GIF image."
      );

      setShowError(true);
      setShowSuccess(false);

      e.target.value = "";

      return;
    }

    const token = getToken();

    if (!token) {
      setErrorMessage(
        "You are not logged in. Please login again."
      );

      setShowError(true);

      e.target.value = "";

      return;
    }

    /* =====================================================
       Preview
    ===================================================== */

    const previewUrl =
      URL.createObjectURL(file);

    setProfileImage(previewUrl);

    /* =====================================================
       Upload
    ===================================================== */

    const uploadData = new FormData();

    uploadData.append("image", file);

    try {
      setUploadingImage(true);

      setShowError(false);
      setShowSuccess(false);

      const response = await axios.post(
        `${API_URL}/teacher-profile/image`,
        uploadData,
        {
          headers: {
            Accept: "application/json",

            Authorization:
              `Bearer ${token}`,

            /*
             * Do NOT manually set
             * Content-Type.
             *
             * Axios will set multipart/form-data
             * with the correct boundary.
             */
          },
        }
      );

      console.log(
        "IMAGE UPLOAD RESPONSE:",
        response.data
      );

      /* ===================================================
         Use Backend Image URL
      =================================================== */

      if (response.data?.image) {
        setProfileImage(
          getImageUrl(
            response.data.image
          )
        );
      }

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        setErrorMessage(
          "Your login session has expired. Please login again."
        );
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to upload profile picture."
        );
      }

      setShowError(true);

      /* ===================================================
         Restore Previous Image
      =================================================== */

      try {
        const response = await axios.get(
          `${API_URL}/teacher-profile`,
          getAuthConfig()
        );

        const savedImage =
          response.data?.profile?.profile_image;

        setProfileImage(
          getImageUrl(savedImage)
        );
      } catch {
        setProfileImage(null);
      }
    } finally {
      setUploadingImage(false);

      e.target.value = "";
    }
  };

  /* =========================================================
     Tutoring Mode
  ========================================================= */

  const setTutoringMode = (mode) => {
    setFormData((prev) => ({
      ...prev,

      online:
        mode === "Online",

      inPerson:
        mode === "In-Person",

      both:
        mode === "Both",

      tutoringMode:
        mode,
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================================================
     Save Profile
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setErrorMessage(
        "You are not logged in. Please login again."
      );

      setShowError(true);

      return;
    }

    /* =====================================================
       Subject Validation
    ===================================================== */

    if (
      !formData.subjects ||
      formData.subjects.length === 0
    ) {
      setErrorMessage(
        "Please select the subject you teach."
      );

      setShowError(true);

      return;
    }

    setSaving(true);

    setShowSuccess(false);
    setShowError(false);

    try {
      /* ===================================================
         Tutoring Mode
      =================================================== */

      let tutoringMode = "";

      if (formData.both) {
        tutoringMode = "Both";
      } else if (formData.online) {
        tutoringMode = "Online";
      } else if (formData.inPerson) {
        tutoringMode = "In-Person";
      } else {
        tutoringMode =
          formData.tutoringMode || "";
      }

      /* ===================================================
         Payload
      =================================================== */

      const payload = {
        fullName:
          formData.fullName,

        email:
          formData.email,

        phone:
          formData.phone || null,

        location:
          formData.location || null,

        birthDate:
          formData.birthDate || null,

        gender:
          formData.gender || null,

        subjects:
          formData.subjects,

        qualification:
          formData.qualification || null,

        experience:
          formData.experience || null,

        hourlyRate:
          formData.hourlyRate === ""
            ? null
            : Number(formData.hourlyRate),

        institution:
          formData.institution || null,

        certification:
          formData.certification || null,

        bio:
          formData.bio || null,

        languages:
          formData.languages,

        availability:
          formData.availability || null,

        tutoringMode:
          tutoringMode || null,

        timeZone:
          formData.timeZone || null,
      };

      console.log(
        "SENDING PROFILE:",
        payload
      );

      /* ===================================================
         Update Profile
      =================================================== */

      const response = await axios.put(
        `${API_URL}/teacher-profile`,
        payload,
        getAuthConfig()
      );

      console.log(
        "SAVE RESPONSE:",
        response.data
      );

      /* ===================================================
         Update Image From Backend
      =================================================== */

      if (
        response.data?.profile?.profile_image
      ) {
        setProfileImage(
          getImageUrl(
            response.data.profile.profile_image
          )
        );
      }

      /* ===================================================
         Success
      =================================================== */

      setShowSuccess(true);
      setShowError(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error(
        "PROFILE SAVE ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        setErrorMessage(
          "Unauthenticated. Please login again."
        );
      } else {
        const backendErrors =
          error.response?.data?.errors;

        let message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save teacher profile.";

        if (backendErrors) {
          message = Object.values(
            backendErrors
          )
            .flat()
            .join(" ");
        }

        setErrorMessage(message);
      }

      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Logout
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    sessionStorage.clear();

    navigate("/", {
      replace: true,
    });
  };

  /* =========================================================
     Loading Screen
  ========================================================= */

  if (
    loadingProfile ||
    loadingOptions
  ) {
    return (
      <main className="teacher-profile-page">

        {/* Sidebar */}

        <aside className="teacher-profile-sidebar">
          <nav className="teacher-sidebar-nav">

            {sidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`teacher-sidebar-link ${
                  location.pathname === item.path
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  navigate(item.path)
                }
              >
                <Icon name={item.icon} />

                <span>
                  {item.label}
                </span>
              </button>
            ))}

            <div className="teacher-sidebar-divider" />

            <button
              type="button"
              className="teacher-sidebar-link teacher-logout"
              onClick={handleLogout}
            >
              <Icon name="logout" />

              <span>
                Logout
              </span>
            </button>

          </nav>
        </aside>

        {/* Loading Content */}

        <section className="teacher-profile-content">

          <div className="teacher-profile-heading">

            <h1>
              Teacher Profile
            </h1>

            <p>
              Loading your profile...
            </p>

          </div>

        </section>

      </main>
    );
  }

  /* =========================================================
     Main UI
  ========================================================= */

  return (
    <main className="teacher-profile-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="teacher-profile-sidebar">

        <nav className="teacher-sidebar-nav">

          {sidebarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`teacher-sidebar-link ${
                location.pathname === item.path
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.path)
              }
            >

              <Icon name={item.icon} />

              <span>
                {item.label}
              </span>

            </button>
          ))}

          <div className="teacher-sidebar-divider" />

          <button
            type="button"
            className="teacher-sidebar-link teacher-logout"
            onClick={handleLogout}
          >

            <Icon name="logout" />

            <span>
              Logout
            </span>

          </button>

        </nav>

      </aside>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="teacher-profile-content">

        {/* Heading */}

        <div className="teacher-profile-heading">

          <h1>
            Teacher Profile
          </h1>

          <p>
            Update your profile information and preferences.
          </p>

        </div>

        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {showSuccess && (
          <div className="teacher-profile-success">

            <div className="teacher-success-icon">
              ✓
            </div>

            <div className="teacher-success-content">

              <strong>
                Profile Updated Successfully
              </strong>

              <span>
                Your teacher profile information has been saved.
              </span>

            </div>

            <button
              type="button"
              className="teacher-message-close"
              onClick={() =>
                setShowSuccess(false)
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {showError && (
          <div className="teacher-profile-error">

            <div className="teacher-error-icon">
              !
            </div>

            <div className="teacher-error-content">

              <strong>
                Unable to Save Profile
              </strong>

              <span>
                {errorMessage}
              </span>

            </div>

            <button
              type="button"
              className="teacher-message-close"
              onClick={() =>
                setShowError(false)
              }
            >
              ×
            </button>

          </div>
        )}

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="teacher-profile-card"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="teacher-top-section">

            {/* Profile Picture */}

            <div className="teacher-picture-column">

              <h3>
                Profile Picture
              </h3>

              <div className="teacher-picture-wrapper">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Teacher profile"
                  />
                ) : (
                  <div className="teacher-default-avatar">

                    <div className="teacher-avatar-head" />

                    <div className="teacher-avatar-body" />

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

                {uploadingImage
                  ? "Uploading..."
                  : "Upload Photo"}

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                />

              </label>

            </div>

            {/* Personal Information */}

            <div className="teacher-personal-section">

              <h3>
                ♙ Personal Information
              </h3>

              <div className="teacher-form-grid">

                {/* Full Name */}

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
                    required
                  />

                </div>

                {/* Email */}

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
                    required
                  />

                </div>

                {/* Phone */}

                <div className="teacher-field">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />

                </div>

                {/* Location */}

                <div className="teacher-field">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                  />

                </div>

                {/* Birth Date */}

                <div className="teacher-field">

                  <label>
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />

                </div>

                {/* Gender */}

                <div className="teacher-field">

                  <label>
                    Gender
                  </label>

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

          <div className="teacher-divider" />

          {/* =================================================
              PROFESSIONAL INFORMATION
          ================================================= */}

          <section className="teacher-form-section">

            <h3>
              ▣ Professional Information
            </h3>

            <div className="teacher-form-grid">

              {/* Subject */}

              <div className="teacher-field">

                <label>
                  Subject You Teach <span>*</span>
                </label>

                <select
                  name="subjects"
                  value={
                    formData.subjects[0] || ""
                  }
                  onChange={handleSubjectChange}
                  required
                >

                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.subject_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Qualification */}

              <div className="teacher-field">

                <label>
                  Qualification
                </label>

                <input
                  type="text"
                  name="qualification"
                  value={
                    formData.qualification
                  }
                  onChange={handleChange}
                  placeholder="Enter highest qualification"
                />

              </div>

              {/* Experience */}

              <div className="teacher-field">

                <label>
                  Teaching Experience
                </label>

                <select
                  name="experience"
                  value={
                    formData.experience
                  }
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

              {/* Hourly Rate */}

              <div className="teacher-field">

                <label>
                  Hourly Rate (USD)
                </label>

                <input
                  type="number"
                  name="hourlyRate"
                  value={
                    formData.hourlyRate
                  }
                  onChange={handleChange}
                  placeholder="Enter hourly rate"
                  min="0"
                />

              </div>

              {/* Institution */}

              <div className="teacher-field">

                <label>
                  Institution / University
                </label>

                <input
                  type="text"
                  name="institution"
                  value={
                    formData.institution
                  }
                  onChange={handleChange}
                  placeholder="Enter your institution"
                />

              </div>

              {/* Certification */}

              <div className="teacher-field">

                <label>
                  Certification
                </label>

                <input
                  type="text"
                  name="certification"
                  value={
                    formData.certification
                  }
                  onChange={handleChange}
                  placeholder="Enter certification"
                />

              </div>

            </div>

            {/* Bio */}

            <div className="teacher-field teacher-full-field">

              <label>
                Bio / About Me
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

          <div className="teacher-divider" />

          {/* =================================================
              ADDITIONAL INFORMATION
          ================================================= */}

          <section className="teacher-form-section">

            <h3>
              ▭ Additional Information
            </h3>

            <div className="teacher-form-grid">

              {/* Language */}

              <div className="teacher-field">

                <label>
                  Language
                </label>

                <select
                  name="languages"
                  value={
                    formData.languages[0] || ""
                  }
                  onChange={handleLanguageChange}
                >

                  <option value="">
                    Select language
                  </option>

                  {languages.map((language) => (
                    <option
                      key={language.id}
                      value={language.id}
                    >
                      {language.language_name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Available For */}

              <div className="teacher-field">

                <label>
                  Available For
                </label>

                <div className="teacher-checkbox-row">

                  {/* Online */}

                  <label>

                    <input
                      type="checkbox"
                      checked={formData.online}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTutoringMode(
                            "Online"
                          );
                        } else {
                          setTutoringMode("");
                        }
                      }}
                    />

                    Online Tutoring

                  </label>

                  {/* In Person */}

                  <label>

                    <input
                      type="checkbox"
                      checked={formData.inPerson}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTutoringMode(
                            "In-Person"
                          );
                        } else {
                          setTutoringMode("");
                        }
                      }}
                    />

                    In-Person Tutoring

                  </label>

                  {/* Both */}

                  <label>

                    <input
                      type="checkbox"
                      checked={formData.both}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTutoringMode(
                            "Both"
                          );
                        } else {
                          setTutoringMode("");
                        }
                      }}
                    />

                    Both

                  </label>

                </div>

              </div>

              {/* Availability */}

              <div className="teacher-field">

                <label>
                  Availability
                </label>

                <select
                  name="availability"
                  value={
                    formData.availability
                  }
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

              {/* Time Zone */}

              <div className="teacher-field">

                <label>
                  Time Zone
                </label>

                <select
                  name="timeZone"
                  value={
                    formData.timeZone
                  }
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

          {/* =================================================
              FORM BUTTONS
          ================================================= */}

          <div className="teacher-form-actions">

            <button
              type="button"
              className="teacher-cancel-button"
              onClick={() =>
                navigate("/teacher-dashboard")
              }
              disabled={
                saving ||
                uploadingImage
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="teacher-save-button"
              disabled={
                saving ||
                uploadingImage
              }
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}