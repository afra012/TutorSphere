import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import studentJobImage from "../../assets/student-job.png";
import "./JobDashboard.css";


const posts = [
  ["📚", "Need Math Tutor for Class 10", "Class 10 · Mathematics", "Dhanmondi, Dhaka", "৳ 800/hour", "2 hours ago"],
  ["⚛", "Physics Help for HSC Preparation", "HSC · Physics", "Uttara, Dhaka", "৳ 1000/hour", "5 hours ago"],
  ["●●●", "English Speaking Practice", "Spoken English · All Levels", "Mirpur, Dhaka", "৳ 600/hour", "1 day ago"],
];

function FeatureIcon({ type }) {
  return type === "posts" ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h5M10 12h6M10 16h6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.2 3.5-6 8-6s7.2 1.8 8 6" />
    </svg>
  );
}

function FeatureCard({
  type,
  title,
  description,
  items,
  button,
  image,
  onClick,
}) {
  return (
    <article className={`dashboard-card feature-card ${type}`}>
      <div className="feature-copy">
        <div className="feature-icon">
          <FeatureIcon type={type} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item}>
            ✓ <span>{item}</span>
          </li>
        ))}
      </ul>

      <button
        className="primary-dashboard-button"
        type="button"
        onClick={onClick}
      >
        {button} <span>→</span>
      </button>

      <div className="feature-art" aria-hidden="true">
        <img src={image} alt="" />
      </div>
    </article>
  );
}


export default function JobDashboard() {
  const navigate = useNavigate();

  return (
    <main className="student-dashboard-page">
      <DashboardSidebar />


      <section className="student-dashboard-content">
        <div className="student-empty-state">
          <img
            src={studentJobImage}
            alt="Student dashboard"
            className="student-empty-image"

      <section className="dashboard-content">
        <header className="dashboard-heading">
          <h1>Job Dashboard</h1>
          <p>
            Browse tutoring opportunities and manage your profile
          </p>
        </header>

        <div className="feature-grid">
          <FeatureCard
            type="posts"
            title="Student Job Posts"
            description="View and manage job requests posted by students"
            items={[
              "Browse student requests",
              "Accept or reject jobs",
              "Track ongoing jobs",
            ]}
            button="View Student Posts"
            image={studentJobImage}
          />

          <FeatureCard
            type="teachers"
            title="Teachers Profiles"
            description="Explore and connect with registered tutors"
            items={[
              "View tutor profiles",
              "Check experience & expertise",
              "Find the right tutor",
            ]}
            button="View Teachers Profiles"
            image={teacherProfileImage}
            onClick={() => navigate("/teacher-profile")}

          />

          <h1>Welcome, Student!</h1>

          <p>
            Explore tutors and find the perfect match for your learning journey.
          </p>
        </div>
      </section>
    </main>
  );
}