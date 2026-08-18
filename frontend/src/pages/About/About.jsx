import TeamCard from "../../components/TeamCard/TeamCard";
import teamData from "../../data/teamData";
import "./About.css";

function About() {
  return (
    <>
      <main className="about-page">
        {/* Intro */}
        <section className="about-hero">
          <div className="dots dots-left" aria-hidden="true"></div>
          <div className="dots dots-right" aria-hidden="true"></div>

          <h1 className="section-title">About Us</h1>
          <p className="about-intro">
            TutorSphere is a platform built to make finding, hiring, and working
            with tutors simple, transparent, and reliable. We connect students
            and parents with verified tutors through clear profiles, honest
            reviews, and a streamlined hiring process — so learning can start
            faster and with more confidence.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="mission-vision">
          <div className="mv-card">
            <div className="mv-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2 3 7l9 5 9-5-9-5Z" stroke="#6425e8" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M3 12l9 5 9-5" stroke="#6425e8" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M3 17l9 5 9-5" stroke="#6425e8" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Our Mission</h2>
            <p>
              To simplify tuition matching by bringing students, parents, and
              tutors onto one dependable platform — replacing scattered
              searches and messages with a clear, organized process from
              first contact to first class.
            </p>
          </div>

          <div className="mv-card">
            <div className="mv-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="#6425e8" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3.2" stroke="#6425e8" strokeWidth="1.6" />
              </svg>
            </div>
            <h2>Our Vision</h2>
            <p>
              To become the most trusted tuition network for modern learning —
              a place where every student finds the right tutor, and every
              tutor finds the opportunity to grow.
            </p>
          </div>
        </section>

        {/* What We Focus On */}
        <section className="focus-section">
          <h2 className="section-title small">What We Focus On</h2>
          <p className="section-subtitle">
            TutorSphere is built around a few practical needs that make
            everyday tuition workflows simpler.
          </p>

          <div className="focus-grid">
            <div className="focus-card">
              <div className="focus-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="8" r="3.2" stroke="#6425e8" strokeWidth="1.6" />
                  <path d="M3.5 19c.6-3.2 3-5 5.5-5s4.9 1.8 5.5 5" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="17" cy="9" r="2.6" stroke="#6425e8" strokeWidth="1.6" />
                  <path d="M15 19c.4-2.4 1.9-4 3.8-4.4" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Trusted connections</h3>
              <p>
                We help students and parents connect with clear profiles,
                honest reviews, and a smoother hiring experience.
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="5" r="2.2" stroke="#6425e8" strokeWidth="1.6" />
                  <circle cx="5" cy="18" r="2.2" stroke="#6425e8" strokeWidth="1.6" />
                  <circle cx="19" cy="18" r="2.2" stroke="#6425e8" strokeWidth="1.6" />
                  <path d="M12 7.2v4M12 11.2 6.2 16M12 11.2 17.8 16" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Simpler hiring flow</h3>
              <p>
                From searching to shortlisting and chatting to payments,
                TutorSphere keeps the process more organized and less
                stressful.
              </p>
            </div>

            <div className="focus-card">
              <div className="focus-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17 9 11l4 4 8-8" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 7h5v5" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Tutor growth</h3>
              <p>
                Tutors can present their expertise, manage opportunities, and
                build long-term trust with families.
              </p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#6425e8" strokeWidth="1.6" />
                  <path d="M12 7v5l3.5 2" stroke="#6425e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="info-label">Why It Matters</span>
              <h3>
                A lot of time gets lost between searching, verifying, and
                communicating.
              </h3>
              <p>
                TutorSphere brings these steps into one place so users can
                compare opportunities, view profiles, and move forward faster
                without scattered conversations.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#6425e8" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4.5" stroke="#6425e8" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="1.4" fill="#6425e8" />
                </svg>
              </div>
              <span className="info-label">Where We Are Going</span>
              <h3>
                We are shaping the platform into a dependable hub for modern
                tuition matching.
              </h3>
              <p>
                We invest in product growth, curated learning journeys, and
                reduced friction, so we can build trust and support better
                learning outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="team-section">
          <h2 className="section-title small">Meet Our Team</h2>
          <p className="section-subtitle">
            TutorSphere is currently run by a student team, with each member
            focusing on a specific part of the platform.
          </p>

          <div className="team-grid">
            {teamData.map((member, i) => (
              <TeamCard key={member.id} member={member} index={i + 1} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
