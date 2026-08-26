import "./TutorCard.css";

function TutorIcon({ name }) {
  const paths = {
    location: <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    badge: <><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></>,
    experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    heart: <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.5 5.4 3.7c2-.5 3.9.3 5.1 1.9a5 5 0 0 1 1.5-1.9c1.7-1.2 4-.9 5.6.4 2.4 2 2.3 5.4.5 8.4-2.3 3.9-6.1 6-6.1 8Z" />,
    person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" /></>,
  };

  return (
    <svg
      className="tutor-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function formatMode(mode) {
  if (!mode) return null;
  const normalized = String(mode).toLowerCase();
  if (normalized === "online") return "Online";
  if (normalized === "in-person" || normalized === "in person") return "In-Person";
  if (normalized === "both") return "Both";
  return mode;
}

export default function TutorCard({ tutor, isFavorite, onToggleFavorite, onViewProfile }) {
  if (!tutor) return null;

  const {
    name,
    verified,
    avatarUrl,
    subject,
    location,
    rating,
    reviewsCount,
    experienceYears,
    tags,
    mode,
    price,
    priceUnit,
  } = tutor;

  const modeLabel = formatMode(mode);

  return (
    <article className="tutor-card">
      <div className="tutor-card-main">
        <div className="tutor-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name || "Tutor"} />
          ) : (
            <TutorIcon name="person" />
          )}
        </div>

        <div className="tutor-info">
          <div className="tutor-name-row">
            <h3>{name || "Unnamed Tutor"}</h3>
            {verified && (
              <span className="tutor-verified" title="Verified tutor">
                <TutorIcon name="badge" />
              </span>
            )}
          </div>

          {subject && <p className="tutor-subject">{subject}</p>}

          {location && (
            <p className="tutor-location">
              <TutorIcon name="location" />
              {location}
            </p>
          )}

          {(rating || reviewsCount || experienceYears) && (
            <p className="tutor-meta">
              {rating && (
                <span className="tutor-rating">
                  <TutorIcon name="star" />
                  {rating}
                  {reviewsCount != null && <span>({reviewsCount} reviews)</span>}
                </span>
              )}
              {experienceYears && (
                <span className="tutor-experience">
                  <TutorIcon name="experience" />
                  {experienceYears}+ years experience
                </span>
              )}
            </p>
          )}

          {Array.isArray(tags) && tags.length > 0 && (
            <div className="tutor-tags">
              {tags.map((tag) => (
                <span className="tutor-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="tutor-card-side">
        <button
          type="button"
          className={`tutor-favorite ${isFavorite ? "is-active" : ""}`}
          onClick={() => onToggleFavorite?.(tutor)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          <TutorIcon name="heart" />
        </button>

        <div className="tutor-price-block">
          {price != null && (
           <p className="tutor-price">
           ৳{price}
           <span>/{priceUnit || "hour"}</span>
             </p> 
          )}
          {modeLabel && <span className="tutor-mode-badge">{modeLabel}</span>}
        </div>

        <button
          type="button"
          className="tutor-view-profile"
          onClick={() => onViewProfile?.(tutor)}
        >
          View Profile
        </button>
      </div>
    </article>
  );
}
