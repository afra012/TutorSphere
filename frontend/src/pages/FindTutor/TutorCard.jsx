import { useState } from "react";

export default function TutorCard({ tutor }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    name,
    subject,
    location,
    mode,
    price,
    rating,
    reviewsCount,
    experience,
    skills,
    profilePicture,
  } = tutor;

  return (
    <article className="tutor-card">
      <div className="tutor-card-header">
        <div className="tutor-profile">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={name}
              className="tutor-avatar-image"
            />
          ) : (
            <div className="tutor-avatar">
              {name?.charAt(0)?.toUpperCase() || "T"}
            </div>
          )}

          <div>
            <h3>{name}</h3>

            <p className="tutor-subject">
              {subject}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={`favorite-btn ${
            isFavorite ? "is-favorite" : ""
          }`}
          aria-label={
            isFavorite
              ? `Remove ${name} from favorites`
              : `Add ${name} to favorites`
          }
          aria-pressed={isFavorite}
          onClick={() => setIsFavorite((current) => !current)}
        >

          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="tutor-details">
        {location && (
          <span>
            📍 {location}
          </span>
        )}

        {mode && (
          <span>
            💻 {mode}
          </span>
        )}

        {price !== undefined && price !== null && (
          <span>
            ₹{price}/hour
          </span>
        )}
      </div>

      {(rating !== undefined || reviewsCount !== undefined) && (
        <div className="tutor-rating">
          ⭐ {rating ?? "N/A"}

          {reviewsCount !== undefined && (
            <span>
              ({reviewsCount} reviews)
            </span>
          )}
        </div>
      )}

      {experience && (
        <p className="tutor-experience">
          {experience} experience
        </p>
      )}

      {skills?.length > 0 && (
        <div className="tutor-skills">
          {skills.map((skill) => (
            <span key={skill}>
              {skill}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className="view-tutor-btn"
        aria-label={`View profile of ${name}`}
      >
        View Profile
      </button>
    </article>
  );
}