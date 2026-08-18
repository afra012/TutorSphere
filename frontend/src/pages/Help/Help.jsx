import "./Help.css";
import FAQ from "../../components/FAQ/FAQ";

function Help() {
  return (
    <div className="help-page">
      <section className="help-hero">
        <h1 className="help-heading">How can we help you?</h1>
        <p className="help-subtext">
          Search our frequently asked questions about finding tutors, posting
          requirements, hiring, profiles, and reviews — or get in touch with
          our support team.
        </p>

        <FAQ />

        <div className="help-contact-card">
          <div className="help-contact-text">
            <h2>Still need help?</h2>
            <p>
              Can't find what you're looking for? Our support team is happy
              to help with anything related to tutors, requirements, or your
              account.
            </p>
          </div>

          <a href="mailto:support@tutorsphere.com" className="help-contact-button">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}

export default Help;
