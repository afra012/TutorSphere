import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import TeacherSidebar from "./components/TeacherSidebar";
import "./TeacherPosts.css";

const API_URL = "http://127.0.0.1:8000/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("auth_token") ||
  "";

export default function TeacherPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/tutor-posts`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        setPosts(Array.isArray(response.data?.posts) ? response.data.posts : []);
      } catch (error) {
        console.error("Failed to load student posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [navigate]);

  return (
    <main className="teacher-posts-layout">
      <TeacherSidebar />
      <section className="teacher-posts-content">
        <header>
          <p className="teacher-posts-label">Tutor opportunities</p>
          <h1>Student posts</h1>
          <p>Browse active tutoring requests posted by students.</p>
        </header>

        {loading ? <p className="teacher-posts-empty">Loading posts...</p> : null}
        {!loading && posts.length === 0 ? <p className="teacher-posts-empty">No active student posts yet.</p> : null}

        <div className="teacher-posts-grid">
          {posts.map((post) => (
            <article className="teacher-post-card" key={post.id}>
              <div className="teacher-post-card-head">
                <h2>{post.subject_name}</h2>
                <span>{post.tutoring_mode}</span>
              </div>
              <p>{post.description}</p>
              <dl>
                <div><dt>Student</dt><dd>{post.student_name}</dd></div>
                <div><dt>Location</dt><dd>{post.location}</dd></div>
                <div><dt>Budget</dt><dd>BDT {post.salary_amount} / {post.salary_period}</dd></div>
                <div><dt>Contact</dt><dd>{post.profile_phone || post.contact_number}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
