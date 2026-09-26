import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

// =========================================================
// NAVBAR
// =========================================================

import Navbar from "./components/Navbar/Navbar";

// =========================================================
// PUBLIC
// =========================================================

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Help from "./pages/Help/Help";

// =========================================================
// AUTH
// =========================================================

import Login from "./pages/Auth/Login/login";
import Register from "./pages/Auth/Register/register";

// =========================================================
// STUDENT
// =========================================================

import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentProfile from "./pages/StudentDashboard/StudentProfile";
import StudentReviews from "./pages/StudentDashboard/components/StudentReviews/StudentReviews";
import StudentPosts from "./pages/StudentDashboard/StudentPosts";
import FindTutor from "./pages/StudentDashboard/FindTutor";
import TutorProfile from "./pages/StudentDashboard/TutorProfile";

// =========================================================
// TEACHER
// =========================================================

import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import TeacherProfile from "./pages/TeacherDashboard/TeacherProfile/TeacherProfile";
import TeacherRequests from "./pages/TeacherDashboard/TeacherRequests";
import TeacherReviews from "./pages/TeacherDashboard/TeacherReviews";
import TeacherPosts from "./pages/TeacherDashboard/TeacherPosts";

// =========================================================
// ADMIN
// =========================================================

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminProfile from "./pages/AdminDashboard/AdminProfile";
import AdminReviews from "./pages/AdminDashboard/AdminReviews";
import AdminManagement from "./pages/AdminDashboard/AdminManagement";

// =========================================================
// LOCATION
// =========================================================

import Location from "./pages/Location/Location";

// =========================================================
// CHAT
// =========================================================

import Chat from "./pages/Chat/Chat";

// =========================================================
// HOME PAGE
// =========================================================

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(window.location.search);

      const googleToken = params.get("google_token");
      const googleEmail = params.get("google_email");
      const googleError = params.get("google_error");

      const pendingAdminEmail =
        localStorage.getItem("pendingAdminEmail");

      // =====================================================
      // GOOGLE ERROR
      // =====================================================

      if (googleError) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("pendingAdminEmail");

        window.history.replaceState(
          {},
          document.title,
          "/login?google_error=" + googleError
        );

        navigate("/login?google_error=" + googleError);
        return;
      }

      // =====================================================
      // NO GOOGLE TOKEN
      // =====================================================

      if (!googleToken) {
        return;
      }

      // =====================================================
      // GOOGLE EMAIL MATCH
      // =====================================================

      if (
        !googleEmail ||
        !pendingAdminEmail ||
        googleEmail.toLowerCase() !==
          pendingAdminEmail.toLowerCase()
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("pendingAdminEmail");

        window.history.replaceState(
          {},
          document.title,
          "/login?google_error=email_mismatch"
        );

        navigate("/login?google_error=email_mismatch");
        return;
      }

      // =====================================================
      // VERIFY USER
      // =====================================================

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${googleToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get user.");
        }

        const user = await response.json();

        // ===================================================
        // ONLY ADMIN
        // ===================================================

        if (user?.role?.toLowerCase() !== "admin") {
          throw new Error("Admin access required.");
        }

        // ===================================================
        // SAVE LOGIN
        // ===================================================

        localStorage.setItem("authToken", googleToken);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(user)
        );

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "admin");

        localStorage.removeItem("pendingAdminEmail");

        // ===================================================
        // REMOVE QUERY STRING
        // ===================================================

        window.history.replaceState(
          {},
          document.title,
          "/"
        );

        // ===================================================
        // ADMIN DASHBOARD
        // ===================================================

        navigate("/admin-dashboard");
      } catch (error) {
        console.error("Google login error:", error);

        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("pendingAdminEmail");

        window.history.replaceState(
          {},
          document.title,
          "/login?google_error=login_failed"
        );

        navigate("/login?google_error=login_failed");
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}

// =========================================================
// LOGIN PAGE
// =========================================================

function HomeWithLogin() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    const role = user?.role?.toLowerCase();

    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  return (
    <>
      <Navbar />
      <Home />

      <Login
        onClose={() => navigate("/")}
        onRegister={() => navigate("/register")}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

// =========================================================
// REGISTER
// =========================================================

function HomeWithRegister() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Home />

      <Register
        onClose={() => navigate("/")}
        onLogin={() => navigate("/login")}
      />
    </>
  );
}

// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        <Route
          path="/help"
          element={
            <>
              <Navbar />
              <Help />
            </>
          }
        />

        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={<HomeWithLogin />}
        />

        <Route
          path="/register"
          element={<HomeWithRegister />}
        />

        {/* =================================================
            STUDENT
        ================================================= */}

        <Route
          path="/student-dashboard"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <StudentDashboard />
            </>
          }
        />

        <Route
          path="/student-profile"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <StudentProfile />
            </>
          }
        />

        <Route
          path="/student-reviews"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <StudentReviews />
            </>
          }
        />

        <Route
          path="/my-post"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <StudentPosts />
            </>
          }
        />

        <Route
          path="/find-tutor"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <FindTutor />
            </>
          }
        />

        <Route
          path="/tutor-profile/:id"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />
              <TutorProfile />
            </>
          }
        />

        {/* =================================================
            TEACHER
        ================================================= */}

        <Route
          path="/teacher-dashboard"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="teacher"
              />
              <TeacherDashboard />
            </>
          }
        />

        <Route
          path="/teacher-profile"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="teacher"
              />
              <TeacherProfile />
            </>
          }
        />

        <Route
          path="/teacher-requests"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="teacher"
              />
              <TeacherRequests />
            </>
          }
        />

        <Route
          path="/teacher-reviews"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="teacher"
              />
              <TeacherReviews />
            </>
          }
        />

        <Route
          path="/teacher-posts"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="teacher"
              />
              <TeacherPosts />
            </>
          }
        />

        {/* =================================================
            CHAT
        ================================================= */}

        <Route
          path="/chat"
          element={<Chat />}
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin-dashboard"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="admin"
              />
              <AdminDashboard />
            </>
          }
        />

        {/* =================================================
            ADMIN REVIEWS
        ================================================= */}

        <Route
          path="/admin-reviews"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="admin"
              />
              <AdminReviews />
            </>
          }
        />

        {/* =================================================
            ADMIN MANAGEMENT
        ================================================= */}

        <Route
          path="/admin-management"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="admin"
              />
              <AdminManagement />
            </>
          }
        />

        {/* =================================================
            ADMIN PROFILE
        ================================================= */}

        <Route
          path="/admin-profile"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="admin"
              />
              <AdminProfile />
            </>
          }
        />

        {/* =================================================
            LOCATION
        ================================================= */}

        <Route
          path="/location"
          element={
            <>
              <Navbar
                dashboardMode={true}
              />
              <Location />
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;