import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TutorCard from "./components/TutorCard/TutorCard";
import "./FindTutor.css";

// Base API URL — backend exposes tutor search at GET /api/find-tutor
// (auth:sanctum protected, so the request needs the logged-in
// student's token).
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

// Backend sends: teacher_id, name, profile_picture, location,
// subjects (array), qualification, teaching_experience,
// tutoring_mode, hourly_rate, availability, bio, languages (array),
// rating, review_count.
// TutorCard / this page expect: id, name, avatarUrl, subject,
// location, mode, price, rating, reviewsCount, experienceYears, tags.
function normalizeTutor(raw) {
  const subjects = Array.isArray(raw.subjects) ? raw.subjects : [];

  return {
    id: raw.teacher_id,
    name: raw.name,
    avatarUrl: raw.profile_picture,
    subject: subjects[0] || "",
    subjects,
    tags: subjects,
    location: raw.location,
    mode: raw.tutoring_mode,
    price: raw.hourly_rate != null ? Number(raw.hourly_rate) : null,
    priceUnit: "hour",
    rating: raw.rating,
    reviewsCount: raw.review_count,
    experienceYears: raw.teaching_experience,
    verified: false,
  };
}

const initialFilters = {
  subject: "",
  location: "",
  mode: "",
  price: "",
};

const priceRanges = [
  { value: "", label: "Any price" },
  { value: "0-1000", label: "৳0 - ৳1000 / hr" },
  { value: "1000-2000", label: "৳1000 - ৳2000 / hr" },
  { value: "2000-3000", label: "৳2000 - ৳3000 / hr" },
  { value: "3000+", label: "৳3000+ / hr" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
];

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function FieldIcon({ children }) {
  return <span className="ft-field-icon">{children}</span>;
}

function matchesPriceRange(price, range) {
  if (!range) return true;
  if (price == null) return false;

  if (range === "30+") return price >= 30;

  const [min, max] = range.split("-").map(Number);
  return price >= min && price <= max;
}

export default function FindTutor() {
  const navigate = useNavigate();

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allSubjects, setAllSubjects] = useState([]);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subjects`,
        getAuthConfig()
      );

      const subjectList = Array.isArray(response.data?.subjects)
        ? response.data.subjects
        : [];

      setAllSubjects(
        subjectList.map((s) => s.subject_name).filter(Boolean)
      );
    } catch (err) {
      console.error("Failed to load subjects:", err);
      setAllSubjects([]);
    }
  };

  const fetchTutors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/find-tutor`,
        getAuthConfig()
      );

      const rawTutors = Array.isArray(response.data?.tutors)
        ? response.data.tutors
        : [];

      setTutors(rawTutors.map(normalizeTutor));
    } catch (err) {
      console.error(err);
      setTutors([]);
      setError("Unable to load tutors right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
    fetchSubjects();
  }, []);

  // Subject dropdown always shows the full subject list from the
  // backend (/api/subjects) — not just subjects among loaded tutors.
  const subjectOptions = allSubjects;

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const matchesSubject =
        !appliedFilters.subject ||
        (tutor.subjects || []).some(
          (s) => s?.toLowerCase() === appliedFilters.subject.toLowerCase()
        );

      const matchesLocation =
        !appliedFilters.location ||
        tutor.location?.toLowerCase().includes(appliedFilters.location.toLowerCase());

      const matchesMode =
        !appliedFilters.mode ||
        tutor.mode?.toLowerCase() === appliedFilters.mode.toLowerCase() ||
        tutor.mode?.toLowerCase() === "both";

      const matchesPrice = matchesPriceRange(tutor.price, appliedFilters.price);

      return matchesSubject && matchesLocation && matchesMode && matchesPrice;
    });
  }, [tutors, appliedFilters]);

  const sortedTutors = useMemo(() => {
    const list = [...filteredTutors];

    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    } else if (sortBy === "rating-desc") {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  }, [filteredTutors, sortBy]);

  const toggleFavorite = (tutor) => {
    setFavorites((current) =>
      current.includes(tutor.id)
        ? current.filter((id) => id !== tutor.id)
        : [...current, tutor.id]
    );
  };

  const handleViewProfile = (tutor) => {
    navigate(`/tutor-profile/${tutor.id}`);
  };

  return (
    <main className="find-tutor-page">
      <DashboardSidebar />

      <section className="find-tutor-content">
        <div className="find-tutor-heading">
          <h1>
            Find the <span>Perfect Tutor</span>
          </h1>
          <p>Search and connect with the best tutors for your learning needs.</p>
        </div>

        <form className="tutor-search-bar" onSubmit={handleSearch}>
          <label className="tutor-search-field">
            <span className="ft-label">Subject</span>
            <span className="ft-input-wrap">
              <FieldIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
              </FieldIcon>
              <select name="subject" value={filters.subject} onChange={updateFilter}>
                <option value="">Select subject</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="tutor-search-field">
            <span className="ft-label">Location</span>
            <span className="ft-input-wrap">
              <FieldIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>
              </FieldIcon>
              <input
                name="location"
                value={filters.location}
                onChange={updateFilter}
                placeholder="Enter city or area"
                type="text"
              />
            </span>
          </label>

          <label className="tutor-search-field">
            <span className="ft-label">Mode of Tutoring</span>
            <span className="ft-input-wrap">
              <FieldIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </FieldIcon>
              <select name="mode" value={filters.mode} onChange={updateFilter}>
                <option value="">Any mode</option>
                <option value="online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="both">Both</option>
              </select>
            </span>
          </label>

          <label className="tutor-search-field">
            <span className="ft-label">Price</span>
            <span className="ft-input-wrap">
              <FieldIcon>
                <span className="ft-price-symbol">$</span>
              </FieldIcon>
              <select name="price" value={filters.price} onChange={updateFilter}>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <button type="submit" className="tutor-search-button">
            <SearchIcon className="ft-search-icon" />
            Search Tutors
          </button>
        </form>

        <div className="tutor-results-header">
          <p className="tutor-results-count">
            {loading ? "Searching tutors…" : `${sortedTutors.length} Tutor${sortedTutors.length === 1 ? "" : "s"} found`}
          </p>

          <label className="tutor-sort">
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="tutor-results-status">
            <p>Loading tutors…</p>
          </div>
        )}

        {!loading && error && (
          <div className="tutor-results-status">
            <p>{error}</p>
            <button type="button" className="tutor-retry-button" onClick={fetchTutors}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && sortedTutors.length === 0 && (
          <div className="tutor-empty-state">
            <SearchIcon className="tutor-empty-icon" />
            <h2>No tutors found.</h2>
            <p>Try changing your search criteria.</p>
            {(appliedFilters.subject || appliedFilters.location || appliedFilters.mode || appliedFilters.price) && (
              <button type="button" className="tutor-retry-button" onClick={handleReset}>
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && sortedTutors.length > 0 && (
          <div className="tutor-results-list">
            {sortedTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                isFavorite={favorites.includes(tutor.id)}
                onToggleFavorite={toggleFavorite}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
