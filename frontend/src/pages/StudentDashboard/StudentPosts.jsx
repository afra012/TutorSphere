import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import "./StudentPosts.css";

const API_URL = "http://127.0.0.1:8000/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("auth_token") ||
  "";

const initialForm = {
  subject: "",
  location: "",
  contactNumber: "",
  tutoringMode: "",
  salary: "",
  salaryPeriod: "",
  description: "",
};

function FieldIcon({ children }) {
  return <span className="post-field-icon">{children}</span>;
}

function SvgIcon({ name }) {
  const paths = {
    location: <path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    phone: <path d="M7.3 3.2 5.5 4.1c-1 .5-1.5 1.6-1.2 2.7 1.5 6.4 6.5 11.4 12.9 12.9 1.1.3 2.2-.2 2.7-1.2l.9-1.8a1.7 1.7 0 0 0-.6-2.1l-2.4-1.5a1.7 1.7 0 0 0-2 .1l-1.3 1c-2.4-1.3-3.4-2.3-4.7-4.7l1-1.3a1.7 1.7 0 0 0 .1-2L9.4 3.8a1.7 1.7 0 0 0-2.1-.6Z" />,
    screen: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    file: <><path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    person: <><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.7-3.3 2.8-5 6.5-5s5.8 1.7 6.5 5" /></>,
    send: <path d="m21 3-7.5 18-3.2-7.3L3 10.5 21 3Zm-10.7 10.7L15 9" />,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function StudentPosts() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadSubjects = async () => {
      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/subjects`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const subjectList = Array.isArray(response.data?.subjects)
          ? response.data.subjects
          : [];

        setSubjects(subjectList);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      }
    };

    loadSubjects();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/tutor-posts`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        setPosts(Array.isArray(response.data?.posts) ? response.data.posts : []);
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    };

    loadPosts();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    const selectedSubject = subjects.find((subject) => String(subject.id) === String(form.subject));

    try {
      const response = await axios.post(`${API_URL}/tutor-posts`, {
        subject_id: Number(form.subject),
        location: form.location,
        contact_number: `+880${form.contactNumber.replace(/^0/, "")}`,
        tutoring_mode: form.tutoringMode,
        salary_amount: Number(form.salary),
        salary_period: form.salaryPeriod,
        description: form.description,
      }, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });

      setPosts((current) => [{ ...response.data.post, subject: selectedSubject }, ...current]);
      setForm(initialForm);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit post:", error);
      setSubmitted(false);
      window.alert(error.response?.data?.message || "Post could not be submitted. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setSubmitted(false);
    navigate("/student-dashboard");
  };

  return (
    <main className="student-posts-page">
      <DashboardSidebar />

      <section className="student-posts-content">
        <div className="post-page-heading">
          <h1>Create New Post</h1>
          <p>Fill in the details below to create a new tutoring job post.</p>
        </div>

        <form className="create-post-card" onSubmit={handleSubmit}>
          <div className="create-post-fields">
            <label className="post-form-row">
              <FieldIcon><SvgIcon name="briefcase" /></FieldIcon>
              <span className="post-field-content">
                <span className="post-label">Subject <b>*</b></span>
                <select name="subject" value={form.subject} onChange={updateField} required>
                  <option value="" disabled>Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="post-form-row">
              <FieldIcon><SvgIcon name="location" /></FieldIcon>
              <span className="post-field-content">
                <span className="post-label">Location <b>*</b></span>
                <input name="location" value={form.location} onChange={updateField} placeholder="Enter city, area or address" required />
              </span>
            </label>

            <label className="post-form-row">
              <FieldIcon><SvgIcon name="phone" /></FieldIcon>
              <span className="post-field-content">
                <span className="post-label">Contact Number <b>*</b></span>
                <span className="phone-input-group"><span>+880</span><input name="contactNumber" value={form.contactNumber} onChange={updateField} type="tel" inputMode="numeric" placeholder="Enter contact number" required /></span>
              </span>
            </label>

            <div className="post-form-row">
              <FieldIcon><SvgIcon name="screen" /></FieldIcon>
              <fieldset className="post-field-content mode-fieldset">
                <legend className="post-label">Mode of Tutoring <b>*</b></legend>
                <div className="mode-options">
                  {[ ["online", "Online", "globe"], ["in-person", "In-Person", "person"], ["both", "Both", "globe"] ].map(([value, label, icon]) => (
                    <label className="mode-option" key={value}>
                      <input type="radio" name="tutoringMode" value={value} checked={form.tutoringMode === value} onChange={updateField} required />
                      <SvgIcon name={icon} /><span>{label}</span><i aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="post-form-row price-row">
              <FieldIcon><span className="price-symbol">৳</span></FieldIcon>
              <div className="post-field-content price-content">
                <span className="post-label">Salary Offered <b>*</b></span>
                <div className="price-inputs">
                  <label><span>Salary Amount (BDT)</span><div className="money-input"><i>৳</i><input name="salary" value={form.salary} onChange={updateField} type="number" min="0" placeholder="Enter salary amount" required /></div></label>
                  <label><span>Payment Frequency</span><select name="salaryPeriod" value={form.salaryPeriod} onChange={updateField} required><option value="" disabled>Select frequency</option><option value="monthly">Monthly</option><option value="weekly">Weekly</option></select></label>
                </div>
              </div>
            </div>

            <label className="post-form-row description-row">
              <FieldIcon><SvgIcon name="file" /></FieldIcon>
              <span className="post-field-content">
                <span className="post-label">Description <b>*</b></span>
                <span className="textarea-wrap"><textarea name="description" value={form.description} onChange={updateField} maxLength="1000" placeholder="Describe what you will teach, who can apply, and any other details..." required /><small>{form.description.length}/1000</small></span>
              </span>
            </label>
          </div>

          <aside className="post-preview" aria-label="Post preview information">
            <span className="preview-icon"><SvgIcon name="briefcase" /></span>
            {posts.length ? (
              <>
                <h2>Your submitted posts</h2>
                <div className="post-preview-list">
                  {posts.map((post) => (
                    <article className="post-preview-card" key={post.id}>
                      <strong>{post.subject?.subject_name || post.subject_name || "Subject not selected"}</strong>
                      <span>{post.location}</span>
                      <span>{(post.tutoring_mode || post.tutoringMode) === "in-person" ? "In-Person" : (post.tutoring_mode || post.tutoringMode)}</span>
                      <span>৳{post.salary_amount || post.salary} / {post.salary_period || post.salaryPeriod}</span>
                      <p>{post.description}</p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2>Your post preview will appear here</h2>
                <p>Once you fill in the details, a preview of your post will be shown here.</p>
              </>
            )}
            <div className="post-tip"><strong>☼ &nbsp; Tip</strong><p>Provide clear details to attract the right students. Include your teaching style, experience and availability.</p></div>
          </aside>

          <footer className="post-form-actions">
            {submitted && <p className="post-success" role="status">Post submitted successfully!</p>}
            <button type="button" className="cancel-post-button" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="submit-post-button"><SvgIcon name="send" />Submit Post</button>
          </footer>
        </form>
      </section>
    </main>
  );
}
