import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import "./Profile.css";

function Profile() {
  return (
    <div className="student-profile-shell">
      <DashboardSidebar />

      <main className="student-profile-main">

        {/* PROFILE HEADER */}
        <section className="sp-profile-header">

          {/* PROFILE ICON */}
          <div className="sp-photo-wrap">
            <div className="sp-profile-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </div>

            <button
              type="button"
              className="sp-camera"
            >
              📷
            </button>
          </div>

          {/* STUDENT INFORMATION */}
          <div className="sp-user-info">
            <div className="sp-name-row">
              <h2>Ayesha Rahman</h2>

              <span className="sp-student-badge">
                Student
              </span>
            </div>

            <p>✉ ayesha@example.com</p>
            <p>☎ +880 17XX-XXXXXX</p>
            <p>▣ Joined May 12, 2026</p>
            <p>⌖ Dhaka, Bangladesh</p>
          </div>

          {/* EDIT PROFILE */}
          <button
            type="button"
            className="sp-edit-btn"
            onClick={() => alert("Edit Profile clicked")}
          >
            ✎ Edit Profile
          </button>

        </section>

        {/* SUMMARY */}
        <section className="sp-summary-grid">

          <div className="sp-summary-card">
            <div className="sp-summary-icon">
              ▤
            </div>

            <div>
              <h4>Tuition Requests</h4>
              <p>No tuition request sent yet</p>
            </div>
          </div>

          <div className="sp-summary-card">
            <div className="sp-summary-icon">
              ▣
            </div>

            <div>
              <h4>Upcoming Sessions</h4>
              <p>No sessions scheduled</p>
            </div>
          </div>

        </section>

        {/* ABOUT + ACTIVITY */}
        <section className="sp-middle-grid">

          {/* ABOUT ME */}
          <div className="sp-content-card">
            <h3>▧ About Me</h3>

            <p className="sp-about">
              I am a student passionate about learning and improving my
              academic performance. I am interested in Mathematics,
              Physics, and English.
            </p>

            <div className="sp-detail-row">
              <span>Education Level</span>
              <b>Higher Secondary (HSC)</b>
            </div>

            <div className="sp-detail-row">
              <span>Institution</span>
              <b>Government Science College</b>
            </div>

            <div className="sp-detail-row">
              <span>Preferred Subjects</span>

              <div className="sp-tags">
                <small>Mathematics</small>
                <small>Physics</small>
                <small>English</small>
              </div>
            </div>

            <div className="sp-detail-row">
              <span>Class/Grade</span>
              <b>HSC 1st Year</b>
            </div>

            <div className="sp-detail-row">
              <span>Preferred Time</span>
              <b>Evenings & Weekends</b>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="sp-content-card">
            <h3>▣ Recent Activity</h3>

            <div className="sp-empty-activity">
              <span>◷</span>
              <p>No recent activity yet.</p>
            </div>
          </div>

        </section>

        {/* SUBJECTS OF INTEREST */}
        <section className="sp-subjects">
          <h3>▤ My Subjects of Interest</h3>

          <div className="sp-subject-grid">

            <div className="sp-subject">
              <div className="sp-subject-head">
                <h4>Mathematics</h4>
                <span>High Priority</span>
              </div>

              <p>Algebra, Calculus, Geometry</p>
            </div>

            <div className="sp-subject">
              <div className="sp-subject-head">
                <h4>Physics</h4>
                <span>High Priority</span>
              </div>

              <p>Mechanics, Electricity, Optics</p>
            </div>

            <div className="sp-subject">
              <h4>English</h4>
              <p>Grammar, Writing, Literature</p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;