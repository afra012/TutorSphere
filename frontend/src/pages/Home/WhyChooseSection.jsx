import "./WhyChooseSection.css";

function WhyChooseSection() {
  return (
    <section className="why-choose">
      <h2>Why Choose TutorSphere?</h2>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Easy Tutor Search</h3>
          <p>Find suitable tutors quickly and easily.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👨‍🏫</div>
          <h3>Qualified Tutors</h3>
          <p>Connect with experienced and qualified tutors.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Direct Connection</h3>
          <p>Connect directly with tutors without middlemen.</p>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseSection;