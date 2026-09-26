import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { syncProfileAddress } from "../../../api/locationSync";
import "./TeacherProfile.css";
import TeacherSidebar from "../components/TeacherSidebar";

const API_URL = "http://127.0.0.1:8000/api";
const BACKEND_URL = "http://127.0.0.1:8000";

const availabilityTimeOptions = {
  Morning: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"],
  Afternoon: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
  Evening: ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
  Night: ["10:00 PM", "11:00 PM", "12:00 AM"],
  Flexible: ["Any Bangladesh Time"],
};
const getTimeOptions = (availability) =>
  availabilityTimeOptions[availability] || [];

const normalizeAvailability = (availability) => {
  const value = availability?.toLowerCase() || "";

  if (value.includes("morning")) return "Morning";
  if (value.includes("afternoon")) return "Afternoon";
  if (value.includes("evening")) return "Evening";
  if (value.includes("night")) return "Night";
  if (value.includes("flexible")) return "Flexible";

  return "";
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("auth_token") ||
  "";

const getAuthConfig = () => {
  const token = getToken();

  return {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}/${path}`;
};

export default function TeacherProfile() {
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationNotice, setLocationNotice] = useState("");

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


  /* =========================
     Load Subjects & Languages
  ========================= */

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [subjectRes, languageRes] = await Promise.all([
          axios.get(
            `${API_URL}/teacher-profile/subjects`,
            getAuthConfig()
          ),
          axios.get(
            `${API_URL}/teacher-profile/languages`,
            getAuthConfig()
          ),
        ]);

        setSubjects(
          Array.isArray(subjectRes.data?.subjects)
            ? subjectRes.data.subjects
            : []
        );

        setLanguages(
          Array.isArray(languageRes.data?.languages)
            ? languageRes.data.languages
            : []
        );
      } catch (error) {
        console.error("Options load error:", error);

        if (error.response?.status === 401) {
          setErrorMessage("Your login session has expired.");
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to load subjects and languages."
          );
        }

        setShowError(true);
      }
    };

    loadOptions();
  }, []);

  /* =========================
     Load Existing Profile
  ========================= */

  useEffect(() => {
    const loadProfile = async () => {
      const token = getToken();

      if (!token) {
        setErrorMessage("You are not logged in. Please login again.");
        setShowError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/teacher-profile`,
          getAuthConfig()
        );

        const profile = response.data?.profile;

        if (!profile) {
          setLoading(false);
          return;
        }

        /*
         * Backend may return:
         * profile.name / profile.email
         * OR
         * profile.user.name / profile.user.email
         */

        const fullName =
          profile.name ||
          profile.user?.name ||
          "";

        const email =
          profile.email ||
          profile.user?.email ||
          "";

        const profileSubjects = Array.isArray(
          response.data?.subjects
        )
          ? response.data.subjects.map((item) => Number(item.id))
          : Array.isArray(profile.subjects)
          ? profile.subjects.map((item) => Number(item.id))
          : [];

        const profileLanguages = Array.isArray(
          response.data?.languages
        )
          ? response.data.languages.map((item) => Number(item.id))
          : Array.isArray(profile.languages)
          ? profile.languages.map((item) => Number(item.id))
          : [];

        const tutoringMode =
          profile.tutoring_mode || "";

        setProfileImage(
          getImageUrl(
            profile.profile_image_url ||
              profile.profile_image
          )
        );

        setFormData({
          fullName,
          email,
          phone: profile.phone || "",
          location: profile.location || "",
          birthDate: profile.date_of_birth || "",
          gender: profile.gender || "",

          subjects: profileSubjects,

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

          bio: profile.bio || "",

          languages: profileLanguages,

          availability: normalizeAvailability(
            profile.availability
          ),

          tutoringMode,

          timeZone: getTimeOptions(
            normalizeAvailability(profile.availability)
          ).includes(profile.time_zone)
            ? profile.time_zone
            : getTimeOptions(
                normalizeAvailability(profile.availability)
              )[0] || "",

          online:
            tutoringMode === "Online",

          inPerson:
            tutoringMode === "In-Person",

          both:
            tutoringMode === "Both",
        });
      } catch (error) {
        console.error("Profile load error:", error);
        console.error("Backend:", error.response?.data);

        if (error.response?.status === 401) {
          setErrorMessage(
            "Your login session has expired. Please login again."
          );
          setShowError(true);
        } else if (error.response?.status !== 404) {
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to load teacher profile."
          );
          setShowError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* =========================
     Input Change
  ========================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => {
      if (name === "availability") {
        return {
          ...prev,
          availability: value,
          timeZone: getTimeOptions(value)[0] || "",
        };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================
     Subject
  ========================= */

  const handleSubjectChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      subjects: value ? [Number(value)] : [],
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================
     Language
  ========================= */

  const handleLanguageChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      languages: value ? [Number(value)] : [],
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================
     Tutoring Mode
  ========================= */

  const setTutoringMode = (mode) => {
    setFormData((prev) => ({
      ...prev,

      tutoringMode: mode,

      online: mode === "Online",
      inPerson: mode === "In-Person",
      both: mode === "Both",
    }));

    setShowSuccess(false);
    setShowError(false);
  };

  /* =========================
     Upload Image
  ========================= */

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(
        "Please select an image smaller than 2MB."
      );
      setShowError(true);
      e.target.value = "";
      return;
    }

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

    const previewUrl = URL.createObjectURL(file);

    setProfileImage(previewUrl);

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.image) {
        setProfileImage(
          getImageUrl(response.data.image)
        );
      }

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error("Image upload error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to upload profile picture."
      );

      setShowError(true);

      try {
        const response = await axios.get(
          `${API_URL}/teacher-profile`,
          getAuthConfig()
        );

        setProfileImage(
          getImageUrl(
            response.data?.profile?.profile_image
          )
        );
      } catch {
        setProfileImage(null);
      }
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  /* =========================
     Save Profile
  ========================= */

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

    if (!formData.subjects.length) {
      setErrorMessage(
        "Please select the subject you teach."
      );
      setShowError(true);
      return;
    }

    setSaving(true);
    setShowSuccess(false);
    setShowError(false);
    setLocationNotice("");

    try {
      let tutoringMode = formData.tutoringMode;

      if (formData.both) {
        tutoringMode = "Both";
      } else if (formData.online) {
        tutoringMode = "Online";
      } else if (formData.inPerson) {
        tutoringMode = "In-Person";
      }

      const payload = {
        fullName: formData.fullName.trim(),

        email: formData.email.trim(),

        phone: formData.phone || null,

        location: formData.location || null,

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

      console.log("SENDING PROFILE:", payload);

      const response = await axios.put(
        `${API_URL}/teacher-profile`,
        payload,
        getAuthConfig()
      );

      console.log("SAVE RESPONSE:", response.data);

      const savedProfile = response.data?.profile;
      const locationSync = await syncProfileAddress(formData.location, token);

      if (savedProfile?.profile_image) {
        setProfileImage(
          getImageUrl(
            savedProfile.profile_image
          )
        );
      }

      /*
       * Immediately update form using saved response.
       * This prevents fields from becoming blank.
       */

      if (savedProfile) {
        setFormData((prev) => ({
          ...prev,

          fullName:
            savedProfile.name ||
            savedProfile.user?.name ||
            prev.fullName,

          email:
            savedProfile.email ||
            savedProfile.user?.email ||
            prev.email,

          gender:
            savedProfile.gender ??
            prev.gender,
        }));
      }

      setShowSuccess(true);
      setShowError(false);
      setLocationNotice(locationSync.ok
        ? (locationSync.approximate
          ? "Map pin set to the matching area; exact house point was unavailable."
          : "Map pin updated.")
        : `Map pin was not updated. ${locationSync.message}`);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      console.error("Profile save error:", error);
      console.error(
        "Backend response:",
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
          message = Object.values(backendErrors)
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


  /* =========================
     Loading
  ========================= */

  if (loading) {
    return (
      <main className="teacher-profile-page">
        <TeacherSidebar />

        <section className="teacher-profile-content">
          <div className="teacher-profile-heading">
            <h1>Teacher Profile</h1>
            <p>Loading your profile...</p>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     Main UI
  ========================= */

  return (
    <main className="teacher-profile-page">

      {/* Sidebar */}

      <TeacherSidebar />

      {/* Content */}

      <section className="teacher-profile-content">

        <div className="teacher-profile-heading">
          <h1>Teacher Profile</h1>
          <p>
            Update your profile information and preferences.
          </p>
        </div>

        {/* Success */}

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
              {locationNotice && <span>{locationNotice}</span>}
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

        {/* Error */}

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

        <form
          className="teacher-profile-card"
          onSubmit={handleSubmit}
        >

          {/* Personal Information */}

          <section className="teacher-top-section">

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
                    required
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
                    required
                  />
                </div>

                <div className="teacher-field">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="teacher-field">
                  <label>Location</label>

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

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>
                </div>

              </div>

              <div className="teacher-divider" />

              {/* Professional Information */}

            <h3>
              ▣ Professional Information
            </h3>

            <div className="teacher-form-grid">

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

              <div className="teacher-field">
                <label>Qualification</label>

                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="Enter highest qualification"
                />
              </div>

              <div className="teacher-field">
                <label>Teaching Experience</label>

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
                <label>Hourly Rate (USD)</label>

                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Enter hourly rate"
                  min="0"
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
                <label>Certification</label>

                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="Enter certification"
                />
              </div>

            </div>

            <div className="teacher-field teacher-full-field">
              <label>Bio / About Me</label>

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

          </div>
          </section>

          <div className="teacher-divider" />

          {/* Additional Information */}

          <section className="teacher-form-section">

            <h3>
              ▭ Additional Information
            </h3>

            <div className="teacher-form-grid">

              <div className="teacher-field">
                <label>Language</label>

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

              <div className="teacher-field">
                <label>Available For</label>

                <div className="teacher-checkbox-row">

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.online}
                      onChange={(e) => {
                        setTutoringMode(
                          e.target.checked
                            ? "Online"
                            : ""
                        );
                      }}
                    />
                    Online Tutoring
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.inPerson}
                      onChange={(e) => {
                        setTutoringMode(
                          e.target.checked
                            ? "In-Person"
                            : ""
                        );
                      }}
                    />
                    In-Person Tutoring
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={formData.both}
                      onChange={(e) => {
                        setTutoringMode(
                          e.target.checked
                            ? "Both"
                            : ""
                        );
                      }}
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

                  <option value="Flexible">
                    Flexible
                  </option>
                </select>
              </div>

              <div className="teacher-field">
                <label>Bangladesh Time</label>

                <select
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleChange}
                >
                  {!formData.availability && (
                    <option value="">
                      Select availability first
                    </option>
                  )}
                  {getTimeOptions(formData.availability).map((time) => (
                    <option key={time} value={time}>
                      {time} (Bangladesh Time)
                    </option>
                  ))}
                </select>
                <small className="teacher-timezone-note">
                  {formData.availability
                    ? `${formData.availability} · Bangladesh Time`
                    : "Select availability first"}
                </small>
              </div>

            </div>
          </section>

          {/* Buttons */}

          <div className="teacher-form-actions">

            <button
              type="button"
              className="teacher-cancel-button"
              onClick={() =>
                navigate("/teacher-dashboard")
              }
              disabled={
                saving || uploadingImage
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="teacher-save-button"
              disabled={
                saving || uploadingImage
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
