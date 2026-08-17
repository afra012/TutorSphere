import "./HeroSection.css";
import heroBg from "../../assets/hero-bg.jpeg";

function HeroSection() {
  return (
    <section
      className="hero-section"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="hero-content">
        <h1>
          Find the <span>Perfect Tutor</span>
          <br />
          for Your Child
        </h1>

        <p>
          TutorSphere connects guardians with qualified tutors
          <br />
          through a secure, moderated, and transparent
          <br />
          matching process.
        </p>

        <a href="/request-tutor" className="request-btn">
          Request a Tutor
        </a>
      </div>
    </section>
  );
}

export default HeroSection;