import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import "./TutorProfile.css";

// Same convention as FindTutor: backend serves the tutor at
// GET /api/find-tutor/{id} (auth:sanctum protected).
const API_BASE_URL = "http://127.0.0.1:8000/api";

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

/* =========================================================
   HELPERS
========================================================= */

const NOT_PROVIDED = "Not provided";

function formatMode(mode) {
  if (!mode) return "";
  const normalized = String(mode).toLowerCase();
  if (normalized === "online") return "Online";
  if (normalized === "in-person" || normalized === "in person") return "In-Person";
  if (normalized === "both") return "Online & In-Person";
  return mode;
}

function formatDate(value, options) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", options);
}

function formatAvailability(availability, timeZone) {
  if (!availability && !timeZone) return "";
  if (!timeZone) return availability;
  if (!availability) return timeZone;
  if (String(availability).includes(timeZone)) return availability;
  return `${availability} (${timeZone})`;
}

// Backend sends the shape returned by FindTutorController@show.
function normalizeTutor(raw) {
  return {
    id: raw.teacher_id,
    name: raw.name,
    avatarUrl: raw.profile_picture,
    gender: raw.gender,
    location: raw.location,
    subjects: Array.isArray(raw.subjects) ? raw.subjects : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    qualification: raw.qualification,
    institution: raw.institution,
    certification: raw.certification,
    experience: raw.teaching_experience,
    mode: raw.tutoring_mode,
    price: raw.hourly_rate != null ? Number(raw.hourly_rate) : null,
    availability: formatAvailability(raw.availability, raw.time_zone),
    bio: raw.bio,
    rating: raw.rating,
    reviewsCount: raw.review_count ?? 0,
    memberSince: raw.member_since,
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
  };
}

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, className = "tp-icon" }) {
  const paths = {
    back: <path d="m15 18-6-6 6-6" />,
    location: <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" /></>,
    experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    education: <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></>,
    institution: <><path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10" /><path d="M2 10 12 3l10 7Z" /></>,
    award: <><circle cx="12" cy="9" r="6" /><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Stars({ value }) {
  const filled = Math.round(Number(value) || 0);

  return (
    <span className="tp-stars" aria-label={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          className={`tp-star ${n <= filled ? "is-filled" : ""}`}
        />
      ))}
    </span>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="tp-detail">
      <dt>
        <Icon name={icon} />
        {label}
      </dt>
      <dd className={value ? "" : "is-empty"}>{value || NOT_PROVIDED}</dd>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Loading is derived (result.key !== requestKey) so the fetch effect
  // never needs a synchronous setState.
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${id}:${attempt}`;
  const [result, setResult] = useState({ key: null, tutor: null, error: "" });

  // "idle" | "sending" | "requested"
  const [requestState, setRequestState] = useState("idle");
  const [toast, setToast] = useState(null); // { type, message }

  const loading = result.key !== requestKey;
  const { tutor, error } = result;

  /* ---------- Load the selected tutor from the database ---------- */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/find-tutor/${id}`,
          getAuthConfig()
        );

        if (cancelled) return;

        setResult({
          key: requestKey,
          tutor: normalizeTutor(response.data.tutor),
          error: "",
        });
      } catch (err) {
        if (cancelled) return;

        const status = err.response?.status;

        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        console.error("Failed to load tutor profile:", err);

        setResult({
          key: requestKey,
          tutor: null,
          error:
            status === 404
              ? "This tutor could not be found. They may have removed their profile."
              : "Unable to load this tutor right now. Please try again.",
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, requestKey, navigate]);

  /* ---------- Did the student already request this tutor? ---------- */

  useEffect(() => {
    let cancelled = false;

    const checkExistingRequest = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/tutoring-requests`,
          getAuthConfig()
        );

        if (cancelled) return;

        const existing = Array.isArray(response.data?.requests)
          ? response.data.requests
          : Array.isArray(response.data)
          ? response.data
          : [];

        const hasActive = existing.some(
          (r) =>
            String(r.teacher_id ?? r.tutor_id) === String(id) &&
            (!r.status ||
              !["cancelled", "rejected", "declined"].includes(
                String(r.status).toLowerCase()
              ))
        );

        if (hasActive) setRequestState("requested");
      } catch (err) {
        // Non-fatal, same as FindTutor: duplicates are still caught server-side.
        console.error("Failed to load existing requests:", err);
      }
    };

    checkExistingRequest();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------- Actions ---------- */

  const handleBack = () => {
    // "default" key = the page was opened directly, nothing to go back to.
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/find-tutor");
    }
  };

  const handleRetry = () => setAttempt((n) => n + 1);

  const handleRequest = async () => {
    if (!tutor) return;

    if (requestState === "sending") return;

    if (requestState === "requested") {
      setToast({
        type: "info",
        message: `You already have an active request with ${tutor.name || "this tutor"}.`,
      });
      return;
    }

    setRequestState("sending");

    try {
      await axios.post(
        `${API_BASE_URL}/tutoring-requests`,
        { teacher_id: tutor.id },
        getAuthConfig()
      );

      setRequestState("requested");
      setToast({
        type: "success",
        message: `Request sent to ${tutor.name || "the tutor"}.`,
      });
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      if (status === 409 || /already/i.test(serverMessage || "")) {
        setRequestState("requested");
        setToast({
          type: "info",
          message:
            serverMessage ||
            `You already have an active request with ${tutor.name || "this tutor"}.`,
        });
      } else {
        setRequestState("idle");
        setToast({
          type: "error",
          message: serverMessage || "Could not send the request. Please try again.",
        });
      }

      console.error("Failed to send tutoring request:", err);
    }
  };

  /* ---------- Render ---------- */

  const isSending = requestState === "sending";
  const isRequested = requestState === "requested";
  const requestLabel = isSending ? "Sending…" : isRequested ? "Requested" : "Request";

  return (
    <main className="tutor-profile-page">
      <DashboardSidebar />

      <section className="tutor-profile-content">
        <button type="button" className="tp-back" onClick={handleBack}>
          <Icon name="back" />
          Back to Find Tutor
        </button>

        {toast && (
          <div className={`tp-toast tp-toast-${toast.type}`} role="status">
            {toast.message}
          </div>
        )}

        {loading && (
          <div className="tp-status">
            <p>Loading tutor profile…</p>
          </div>
        )}

        {!loading && error && (
          <div className="tp-status">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <div className="tp-status-actions">
              <button type="button" className="tp-btn-outline" onClick={handleBack}>
                Go Back
              </button>
              <button type="button" className="tp-btn-outline" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && tutor && (
          <>
            {/* ===== Header ===== */}
            <article className="tp-header">
              <div className="tp-avatar">
                {tutor.avatarUrl ? (
                  <img src={tutor.avatarUrl} alt={tutor.name || "Tutor"} />
                ) : (
                  <Icon name="person" className="tp-avatar-icon" />
                )}
              </div>

              <div className="tp-header-info">
                <h1>{tutor.name || "Unnamed Tutor"}</h1>

                {tutor.subjects.length > 0 && (
                  <p className="tp-subjects-line">{tutor.subjects.join(", ")}</p>
                )}

                {tutor.location && (
                  <p className="tp-location">
                    <Icon name="location" />
                    {tutor.location}
                  </p>
                )}

                <p className="tp-rating-line">
                  {tutor.rating != null ? (
                    <>
                      <Stars value={tutor.rating} />
                      <strong>{tutor.rating}</strong>
                      <span>
                        ({tutor.reviewsCount} review{tutor.reviewsCount === 1 ? "" : "s"})
                      </span>
                    </>
                  ) : (
                    <span>No reviews yet</span>
                  )}
                </p>
              </div>

              <div className="tp-header-side">
                <div className="tp-price-block">
                  {tutor.price != null && (
                    <p className="tp-price">
                      ৳{tutor.price}
                      <span>/hour</span>
                    </p>
                  )}
                  {tutor.mode && <span className="tp-mode-badge">{formatMode(tutor.mode)}</span>}
                </div>

                <button
                  type="button"
                  className={`tp-request ${isRequested ? "is-requested" : ""}`}
                  onClick={handleRequest}
                  disabled={isSending || isRequested}
                  title={
                    isRequested
                      ? "You already have an active request with this tutor"
                      : undefined
                  }
                >
                  {requestLabel}
                </button>
              </div>
            </article>

            {/* ===== Body (full-width sections, details laid out horizontally) ===== */}
            <div className="tp-body">
              <section className="tp-card">
                <h2>Tutor Details</h2>

                <dl className="tp-details">
                  <DetailItem icon="person" label="Gender" value={tutor.gender} />
                  <DetailItem icon="experience" label="Experience" value={tutor.experience} />
                  <DetailItem icon="education" label="Education" value={tutor.qualification} />
                  <DetailItem icon="institution" label="Institution" value={tutor.institution} />
                  <DetailItem icon="award" label="Certification" value={tutor.certification} />
                  <DetailItem icon="location" label="Address" value={tutor.location} />
                  <DetailItem icon="monitor" label="Tutoring Mode" value={formatMode(tutor.mode)} />
                  <DetailItem icon="clock" label="Availability" value={tutor.availability} />
                  <DetailItem icon="chat" label="Languages" value={tutor.languages.join(", ")} />
                  <DetailItem
                    icon="calendar"
                    label="Member Since"
                    value={formatDate(tutor.memberSince, { month: "long", year: "numeric" })}
                  />
                </dl>
              </section>

              <section className="tp-card">
                <h2>Subjects</h2>

                {tutor.subjects.length > 0 ? (
                  <div className="tp-tags">
                    {tutor.subjects.map((subject) => (
                      <span className="tp-tag" key={subject}>
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="tp-empty">No subjects listed.</p>
                )}
              </section>

              <section className="tp-card">
                <h2>About</h2>
                {tutor.bio ? (
                  <p className="tp-bio">{tutor.bio}</p>
                ) : (
                  <p className="tp-empty">This tutor has not added a bio yet.</p>
                )}
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
