import "./TutorCard.css";

function TutorIcon({ name }) {
  const paths = {
    location: (
      <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),

    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),

    badge: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    experience: (
      <>
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
        />

        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),

    person: (
      <>
        <circle
          cx="12"
          cy="8"
          r="4"
        />

        <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
      </>
    ),
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

/*
|--------------------------------------------------------------------------
| FORMAT TUTORING MODE
|--------------------------------------------------------------------------
*/

function formatMode(mode) {
  if (!mode) {
    return null;
  }

  const normalized =
    String(mode).toLowerCase();

  if (normalized === "online") {
    return "Online";
  }

  if (
    normalized === "in-person" ||
    normalized === "in person"
  ) {
    return "In-Person";
  }

  if (normalized === "both") {
    return "Both";
  }

  return mode;
}

/*
|--------------------------------------------------------------------------
| TUTOR CARD
|--------------------------------------------------------------------------
*/

export default function TutorCard({
  tutor,
  onViewProfile,
  onRequest,

  /*
  requestState possible values:

  idle      -> Request
  sending   -> Sending...
  requested -> Requested
  accepted  -> Accepted
  */

  requestState = "idle",
}) {
  if (!tutor) {
    return null;
  }

  const {
    name,
    subscriptionPlan,
    subscriptionStatus,
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

  const modeLabel =
    formatMode(mode);

  /*
  |--------------------------------------------------------------------------
  | REQUEST STATUS
  |--------------------------------------------------------------------------
  */

  const isSending =
    requestState === "sending";

  const isRequested =
    requestState === "requested";

  const isAccepted =
    requestState === "accepted";

  /*
  Pending and Accepted both cannot
  send another request.
  */

  const requestDisabled =
    isSending ||
    isRequested ||
    isAccepted;

  /*
  Button text
  */

  let requestLabel = "Request";

  if (isSending) {
    requestLabel = "Sending…";
  } else if (isRequested) {
    requestLabel = "Requested";
  } else if (isAccepted) {
    requestLabel = "Accepted";
  }

  /*
  Button title
  */

  let requestTitle;

  if (isRequested) {
    requestTitle =
      "Your request is waiting for the teacher's response.";
  } else if (isAccepted) {
    requestTitle =
      "Your tutor request has been accepted.";
  }

  return (
    <article className="tutor-card">

      {/* LEFT SIDE */}

      <div className="tutor-card-main">

        {/* AVATAR */}

        <div className="tutor-avatar">

          {avatarUrl ? (

            <img
              src={avatarUrl}
              alt={name || "Tutor"}
            />

          ) : (

            <TutorIcon name="person" />

          )}

        </div>

        {/* TUTOR INFO */}

        <div className="tutor-info">

          {/* NAME */}

          <div className="tutor-name-row">

            <h3>
              {name || "Unnamed Tutor"}
            </h3>

            {subscriptionPlan && (
              <span className="tutor-subscription-icon" title={subscriptionPlan + " plan - " + (subscriptionStatus || "subscribed")} aria-label={subscriptionPlan + " plan, " + (subscriptionStatus || "subscribed")}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 6l4 4 3-7 3 7 4-4-2 12H5L3 6Z" />
                </svg>
              </span>
            )}

            {verified && (

              <span
                className="tutor-verified"
                title="Verified tutor"
              >
                <TutorIcon name="badge" />
              </span>

            )}

          </div>

          {/* SUBJECT */}

          {subject && (

            <p className="tutor-subject">
              {subject}
            </p>

          )}

          {/* LOCATION */}

          {location && (

            <p className="tutor-location">

              <TutorIcon name="location" />

              {location}

            </p>

          )}

          {/* RATING / EXPERIENCE */}

          {(rating ||
            reviewsCount ||
            experienceYears) && (

            <p className="tutor-meta">

              {rating && (

                <span className="tutor-rating">

                  <TutorIcon name="star" />

                  {rating}

                  {reviewsCount != null && (

                    <span>
                      ({reviewsCount} reviews)
                    </span>

                  )}

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

          {/* TAGS */}

          {Array.isArray(tags) &&
            tags.length > 0 && (

            <div className="tutor-tags">

              {tags.map(
                (tag) => (

                  <span
                    className="tutor-tag"
                    key={tag}
                  >
                    {tag}
                  </span>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="tutor-card-side">

        {/* PRICE */}

        <div className="tutor-price-block">

          {price != null && (

            <p className="tutor-price">

              ৳{price}

              <span>
                /{priceUnit || "hour"}
              </span>

            </p>

          )}

          {modeLabel && (

            <span className="tutor-mode-badge">
              {modeLabel}
            </span>

          )}

        </div>

        {/* BUTTONS */}

        <div className="tutor-card-actions">

          {/* VIEW PROFILE */}

          <button
            type="button"
            className="tutor-view-profile"
            onClick={() =>
              onViewProfile?.(tutor)
            }
          >
            View Profile
          </button>

          {/* REQUEST BUTTON */}

          <button
            type="button"

            className={`tutor-request-button ${
              isRequested
                ? "is-requested"
                : ""
            } ${
              isAccepted
                ? "is-accepted"
                : ""
            }`}

            onClick={() =>
              onRequest?.(tutor)
            }

            disabled={
              requestDisabled
            }

            title={
              requestTitle
            }
          >
            {requestLabel}
          </button>

        </div>

      </div>

    </article>
  );
}