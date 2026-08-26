import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TutorCard from "./components/TutorCard/TutorCard";
import "./FindTutor.css";

// Base API URL — backend team will implement GET /tutors (with optional
// query params: subject, location, mode, price, sort) once the
// corresponding issue is picked up.
const API_BASE_URL = "http://127.0.0.1:8000/api";

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

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);

  const fetchTutors = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/tutors`);
      setTutors(Array.isArray(response.data) ? response.data : response.data?.data || []);
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
  }, []);

  // Subject options are derived from whatever tutor data is available —
  // never hardcoded.
  const subjectOptions = useMemo(() => {
    const unique = new Set(
      tutors.map((tutor) => tutor.subject).filter(Boolean)
    );
    return Array.from(unique);
  }, [tutors]);

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
        tutor.subject?.toLowerCase() === appliedFilters.subject.toLowerCase();

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
                <option value="in-person">In-Person</option>
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
