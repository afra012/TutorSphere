import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home/Home";
import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";

import About from "./pages/About/About";

import Login from "./pages/Auth/Login/login";
import Register from "./pages/Auth/Register/register";

import Help from "./pages/Help/Help";

import TeacherProfile from "./pages/TeacherProfile/TeacherProfile";
import Profile from "./pages/Profile/Profile";

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
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <>
              <Navbar
                dashboardMode={true}
                role="student"
              />

              <Profile />
            </>
          }
        />


        {/* =================================================
            REVIEWS
        ================================================= */}

        <Route
          path="/reviews"
          element={<ReviewsPage />}
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

              <div style={{ paddingTop: "76px" }}>
                <h1>Teacher Requests</h1>
              </div>
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

              <div style={{ paddingTop: "76px" }}>
                <h1>Teacher Reviews</h1>
              </div>
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;