import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Help from "./pages/Help/Help";

import Login from "./pages/Auth/Login/login";
import Register from "./pages/Auth/Register/register";

import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";

import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import TeacherProfile from "./pages/TeacherDashboard/TeacherProfile/TeacherProfile";
import TeacherRequests from "./pages/TeacherDashboard/TeacherRequests";
import TeacherReviews from "./pages/TeacherDashboard/TeacherReviews";

import Review from "./pages/Reviews/Review";

/* =========================================================
   LOGIN PAGE
========================================================= */

function HomeWithLogin() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user) => {
    const userRole = user?.role?.toLowerCase();

    if (userRole === "student") {
      navigate("/student-dashboard");
    } else if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else if (userRole === "admin") {
      navigate("/admin-dashboard");
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

/* =========================================================
   REGISTER PAGE
========================================================= */

function HomeWithRegister() {
  const navigate = useNavigate();

  const handleRegisterSuccess = (role) => {
    const userRole = role?.toLowerCase();

    if (userRole === "student") {
      navigate("/student-dashboard");
    } else if (userRole === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />

      <Home />

      <Register
        onClose={() => navigate("/")}
        onLogin={() => navigate("/login")}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
}

/* =========================================================
   REVIEWS PAGE
========================================================= */

function ReviewsPage() {
  return (
    <>
      <Navbar />
      <Review />
    </>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* =================================================
            ABOUT
        ================================================= */}

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={<HomeWithLogin />}
        />

        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={<HomeWithRegister />}
        />

        {/* =================================================
            HELP
        ================================================= */}

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
            STUDENT DASHBOARD
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

        {/* =================================================
            TEACHER DASHBOARD
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

        {/* =================================================
            TEACHER PROFILE
        ================================================= */}

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

        {/* =================================================
            TEACHER REQUESTS
        ================================================= */}

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

        {/* =================================================
            TEACHER REVIEWS
        ================================================= */}

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

        {/* =================================================
            GENERAL REVIEWS
        ================================================= */}

        <Route
          path="/reviews"
          element={<ReviewsPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;