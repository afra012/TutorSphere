import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import studentJobImage from "../../assets/student-job.png";
import "./JobDashboard.css";

export default function JobDashboard() {
  return (
    <main className="student-dashboard-page">
      <DashboardSidebar />

      <section className="student-dashboard-content">
        <div className="student-empty-state">
          <img
            src={studentJobImage}
            alt="Student dashboard"
            className="student-empty-image"
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