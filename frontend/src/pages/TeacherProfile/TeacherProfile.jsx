import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import teacherPhoto from "../../assets/teacher/tahmid-reference.png";
import booksReference from "../../assets/teacher/books-reference.png";
import "./TeacherProfile.css";

const subjects = [
  { name: "Physics", level: "Expert", icon: "⚛", topics: ["Mechanics", "Electricity", "Optics", "Thermodynamics"] },
  { name: "Mathematics", level: "Expert", icon: "▦", topics: ["Algebra", "Calculus", "Geometry"] },
  { name: "Mechanics", level: "Expert", icon: "⚙", topics: ["Newtonian Mechanics", "Motion", "Dynamics"] },
  { name: "Electricity", level: "Expert", icon: "ϟ", topics: ["Circuit Analysis", "AC/DC", "Magnetism"] },
  { name: "Optics", level: "Advanced", icon: "◉", topics: ["Ray Optics", "Wave Optics", "Polarization"] },
  { name: "Calculus", level: "Advanced", icon: "∫", topics: ["Differential Calculus", "Integral Calculus"] },
];

const availability = [
  ["Monday", "4:00 PM – 10:00 PM"], ["Tuesday", "4:00 PM – 10:00 PM"], ["Wednesday", "4:00 PM – 10:00 PM"],
  ["Thursday", "4:00 PM – 10:00 PM"], ["Friday", "4:00 PM – 10:00 PM"], ["Saturday", "10:00 AM – 8:00 PM"],
  ["Sunday", "10:00 AM – 8:00 PM"],
];

const reviews = [
  { name: "Farhana Islam", role: "Parent", rating: "5.0", time: "2 days ago", initials: "FI", text: "Tahmid is an excellent tutor! He explains concepts so clearly and my daughter's physics grade improved a lot. Highly recommended!" },
  { name: "Nafis Ahmed", role: "Student", rating: "4.9", time: "1 week ago", initials: "NA", text: "The sessions are well organized and practical. I finally feel confident with mechanics and electricity." },
];

function Icon({ name }) {
  const shapes = {
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.6-3.3 2.6-5 6-5s5.4 1.7 6 5M16 5.5a3 3 0 0 1 0 5.8M17 15c2.1.5 3.4 2.1 4 5" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 11h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    graduation: <><path d="m3 10 9-5 9 5-9 5-9-5Z" /><path d="M7 12.2V17c2.8 2.2 9.2 2.2 12 0v-4.8M21 10v6" /></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-4-.9L3 21l1.7-4.1A8 8 0 1 1 21 11.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  };
  return <svg className="tp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
}

function ProfileHeader({ onMessage, onBook }) {
  return (
    <section className="tp-header-card">
      <div className="tp-header-decoration" aria-hidden="true"><img src={booksReference} alt="" /></div>
      <div className="tp-header-main">
        <div className="tp-avatar-wrap"><img className="tp-avatar" src={teacherPhoto} alt="Tahmid Rahman" /><span className="tp-online-dot" /></div>
        <div className="tp-header-copy">
          <div className="tp-name-row"><h1>Tahmid Rahman</h1><span className="verified-badge">✓ Verified Tutor</span></div>
          <div className="tp-rating"><span>★</span><strong>4.9</strong><span className="muted">(142 reviews)</span></div>
          <div className="tp-header-stats"><span><Icon name="users" /><b>312</b> Students</span><span><Icon name="book" /><b>756</b> Sessions</span></div>
          <div className="tp-meta-grid">
            <span><Icon name="graduation" /> BSc in Physics, University of Dhaka</span>
            <span><Icon name="users" /> 5+ Years of Teaching Experience</span>
            <span><Icon name="location" /> Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
      <div className="tp-header-actions">
        <button className="tp-btn tp-btn-outline" onClick={onMessage}><Icon name="message" /> Message</button>
        <button className="tp-btn tp-btn-primary" onClick={onBook}><Icon name="calendar" /> Book a Session</button>
      </div>
    </section>
  );
}

function SubjectTags() {
  return <section className="subject-tags card-surface"><div><strong>Teaching</strong><div className="tag-list">{["Physics", "Mathematics", "Mechanics", "Electricity", "Optics"].map(x => <span key={x}>{x}</span>)}</div></div><div><strong>Also teaches</strong><div className="tag-list">{["Calculus", "Algebra", "Science"].map(x => <span key={x}>{x}</span>)}</div></div></section>;
}

function Stats() {
  const stats = [["৳800 / hour", "Starting from", "book"], ["5+", "Years Experience", "graduation"], ["250+", "Students Taught", "users"], ["95%", "Positive Reviews", "star"], ["1 hour", "Typically replies in", "clock"]];
  return <section className="tp-stats">{stats.map(([value, label, icon]) => <article className="stat-card" key={label}><span className="stat-icon"><Icon name={icon} /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</section>;
}

function AboutSection() {
  return <section className="tp-card about-card"><h2>About Me</h2><p>Hello! I'm Tahmid Rahman, a passionate Physics tutor with over 5 years of teaching experience. I specialize in making complex concepts simple and helping students build strong foundations. I believe in interactive learning and personalized guidance to help students achieve their academic goals.</p></section>;
}

function SubjectsSection() {
  return <section className="tp-card"><div className="section-title-row"><h2>Subjects & Expertise</h2><button type="button">View All Subjects</button></div><div className="subject-grid">{subjects.map(subject => <article className="expertise-card" key={subject.name}><div className="expertise-top"><span className="subject-icon">{subject.icon}</span><div><h3>{subject.name}</h3><span className="level-pill">{subject.level}</span></div></div><div className="topic-list">{subject.topics.map(topic => <span key={topic}>{topic}</span>)}</div></article>)}</div></section>;
}

function ReviewsPanel() {
  return <section className="tp-card reviews-panel"><div className="section-title-row"><div><h2>Reviews <span className="count">(142)</span></h2><div className="overall-rating"><span>★</span><strong>4.9</strong><span>Overall rating</span></div></div><button type="button">View All Reviews</button></div>{reviews.map(review => <article className="review-item" key={review.name}><div className="review-avatar">{review.initials}</div><div className="review-body"><div className="review-head"><div><strong>{review.name}</strong><span>{review.role}</span></div><small>{review.time}</small></div><div className="review-stars">★★★★★ <b>{review.rating}</b></div><p>{review.text}</p></div></article>)}</section>;
}

function AvailabilityCard() {
  return <section className="tp-card side-card availability-card"><div className="section-title-row"><h2>Availability</h2><button type="button">View Calendar</button></div><p className="timezone">Time Zone: Asia/Dhaka (GMT+6)</p><div className="availability-list">{availability.map(([day, time]) => <div key={day}><strong>{day}</strong><span>{time}</span><em>Available</em></div>)}</div></section>;
}

function EducationCard() { return <section className="tp-card side-card"><h2>Education</h2><div className="education-row"><span className="education-icon"><Icon name="graduation" /></span><div><strong>BSc in Physics</strong><p>University of Dhaka</p><small>2018 – 2022</small></div></div></section>; }
function LanguagesCard() { return <section className="tp-card side-card"><h2>Languages</h2><div className="language-list"><span>Bengali <b>Native</b></span><span>English <b>Fluent</b></span></div></section>; }
function SessionsPanel() { return <section className="tp-card simple-panel"><h2>Sessions</h2><p>Tahmid has completed 756 tutoring sessions. Students can book one-to-one sessions based on the availability shown on this profile.</p><div className="session-mock"><span><Icon name="calendar" /></span><div><strong>Next available session</strong><small>Today · 7:00 PM – 8:00 PM</small></div><button type="button">Book</button></div></section>; }
function FAQsPanel() { return <section className="tp-card simple-panel"><h2>FAQs</h2><div className="faq-mock"><strong>Do you offer personalized lesson plans?</strong><p>Yes. Each session is adapted to the student's level, goals, and upcoming exams.</p></div><div className="faq-mock"><strong>Can I book recurring sessions?</strong><p>Yes. Students can discuss a recurring weekly schedule with the tutor after booking.</p></div></section>; }

export default function TeacherProfile() {
  const [activeTab, setActiveTab] = useState("About");
  const [bookingMessage, setBookingMessage] = useState("");
  const navigate = useNavigate();
  const handleBook = () => { setBookingMessage("Demo booking opened — no real booking is submitted in this frontend task."); setTimeout(() => setBookingMessage(""), 3500); };

  return (
    <div className="teacher-profile-page">
      <Navbar dashboardMode />
      <div className="teacher-profile-shell">
        <DashboardSidebar active="Browse Tutors" />
        <main className="teacher-profile-content">
          <ProfileHeader onMessage={() => navigate("/job-dashboard")} onBook={handleBook} />
          <SubjectTags />
          <Stats />
          <div className="tp-tabs" role="tablist" aria-label="Teacher profile sections">
            {['About', 'Reviews', 'Sessions', 'Availability', 'FAQs'].map(tab => <button key={tab} type="button" className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}{tab === 'Reviews' ? ' (142)' : ''}</button>)}
          </div>

          {activeTab === 'About' ? (
            <div className="tp-main-grid">
              <div className="tp-primary"><AboutSection /><SubjectsSection /><ReviewsPanel /></div>
              <aside className="tp-rail"><AvailabilityCard /><EducationCard /><LanguagesCard /></aside>
            </div>
          ) : (
            <div className="tp-main-grid single-tab-layout">
              <div className="tp-primary">
                {activeTab === 'Reviews' && <ReviewsPanel />}
                {activeTab === 'Sessions' && <SessionsPanel />}
                {activeTab === 'Availability' && <AvailabilityCard />}
                {activeTab === 'FAQs' && <FAQsPanel />}
              </div>
              <aside className="tp-rail"><EducationCard /><LanguagesCard /></aside>
            </div>
          )}
          {bookingMessage && <div className="booking-toast" role="status">{bookingMessage}</div>}
        </main>
      </div>
    </div>
  );
}
