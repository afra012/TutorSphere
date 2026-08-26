import { useState } from "react";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import TutorCard from "./TutorCard";
import "./FindTutor.css";

export default function FindTutor() {
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [maxPrice, setMaxPrice] = useState("");

  const tutors = [];

  const filteredTutors = tutors
  .filter((tutor) => {
    const matchesSubject =
      !subject ||
      tutor.subject.toLowerCase().includes(subject.toLowerCase());

    const matchesLocation =
      !location ||
      tutor.location.toLowerCase().includes(location.toLowerCase());

    const matchesMode =
      !mode || tutor.mode === mode;

    const matchesPrice =
      !maxPrice || tutor.price <= Number(maxPrice);

    return (
      matchesSubject &&
      matchesLocation &&
      matchesMode &&
      matchesPrice
    );
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;

      case "price-high":
        return b.price - a.price;

      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);

      default:
        return 0;
    }
  });

  return (
    <main className="find-tutor-page">
      <DashboardSidebar />

      <section className="find-tutor-content">
        <div className="find-tutor-header">
          <h1>Find the Perfect Tutor</h1>
          <p>Search and connect with the best tutors for your learning needs.</p>
        </div>

        <div className="search-box">
          <div className="search-field">
            <label>Subject</label>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Select subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div className="search-field">
            <label>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Delhi"
            />
          </div>

          <div className="search-field">
            <label>Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="">Select mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="search-field">
            <label>Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 500"
            />
          </div>

          <button className="search-btn">
            Search Tutors
          </button>
        </div>

        <div className="results-header">
          <h2>Tutors</h2>

          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recommended">
              Recommended
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rated
            </option>
          </select>
        </div>

        <div className="tutor-results">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
              />
            ))
          ) : (
            <div className="no-tutors">
              <h2>No tutors found</h2>
              <p>Try changing your search criteria.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}