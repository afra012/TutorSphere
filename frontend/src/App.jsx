import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Help from "./pages/Help/Help";

import Login from "./pages/Auth/Login/login";
import Register from "./pages/Auth/Register/register";

import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import StudentProfile from "./pages/StudentDashboard/StudentProfile";
import StudentReviews from "./pages/StudentDashboard/components/StudentReviews/StudentReviews";
import StudentPosts from "./pages/StudentDashboard/StudentPosts";

import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import TeacherProfile from "./pages/TeacherDashboard/TeacherProfile/TeacherProfile";
import TeacherRequests from "./pages/TeacherDashboard/TeacherRequests";
import TeacherReviews from "./pages/TeacherDashboard/TeacherReviews";
import TeacherPosts from "./pages/TeacherDashboard/TeacherPosts";


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


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* About */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={<HomeWithLogin />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<HomeWithRegister />}
        />

        {/* Help */}
        <Route
          path="/help"
          element={
            <>
              <Navbar />
              <Help />
            </>
          }
        />

        {/* Student Dashboard */}
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

        {/* Student Profile */}
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

        {/* Student Reviews */}
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

        {/* Student posts */}
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

        {/* Teacher Dashboard */}
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

        {/* Teacher Profile */}
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

        {/* Teacher Requests */}
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

        {/* Teacher Reviews */}
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
          path="/teacher-post"
          element={
            <>
              <Navbar dashboardMode={true} role="teacher" />
              <TeacherPosts />
            </>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
