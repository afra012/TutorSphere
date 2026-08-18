import "./TeamCard.css";

function TeamCard({ member, index }) {
  const { name, role, university, description, image, github } = member;

  return (
    <div className="team-card">
      <span className="team-card-number">{index}</span>

      <div className="team-card-avatar">
        <img src={image} alt={name} loading="lazy" />
      </div>

      <h3 className="team-card-name">{name}</h3>
      <p className="team-card-role">{role}</p>
      <p className="team-card-university">{university}</p>
      <p className="team-card-desc">{description}</p>

      {github && (
        <a
          className="team-card-github"
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" className="github-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55v-2.1c-3.16.69-3.83-1.37-3.83-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.72-1.54-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.58.23 2.75.11 3.04.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55 4.51-1.5 7.77-5.76 7.77-10.78C23.02 5.24 18.27.5 12 .5Z"
            />
          </svg>
          GitHub · @{github}
        </a>
      )}
    </div>
  );
}

export default TeamCard;
