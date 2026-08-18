import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import JobDashboard from "./pages/JobDashboard/JobDashboard";
import About from "./pages/About/About";

import Login from "./pages/Auth/Login/login";
import Register from "./pages/Auth/Register/register";

import Help from "./pages/Help/Help";
import Review from "./pages/Reviews/Review";

/* =========================
   LOGIN PAGE
========================= */

function HomeWithLogin() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Home />

      <Login
        onClose={() => navigate("/")}
        onRegister={() => navigate("/register")}
        onLoginSuccess={() => navigate("/job-dashboard")}
      />
    </>
  );
}

/* =========================
   REGISTER PAGE
========================= */

function HomeWithRegister() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Home />

      <Register
        onClose={() => navigate("/")}
        onLogin={() => navigate("/login")}
        onRegisterSuccess={() => navigate("/login")}
      />
    </>
  );
}

/* =========================
   REVIEWS PAGE
========================= */

function ReviewsPage() {
  return (
    <>
      <Navbar />
      <Review />
    </>
  );
}

/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME
        ========================= */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        {/* =========================
            ABOUT
        ========================= */}
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        {/* =========================
            LOGIN
        ========================= */}
        <Route
          path="/login"
          element={<HomeWithLogin />}
        />

        {/* =========================
            REGISTER
        ========================= */}
        <Route
          path="/register"
          element={<HomeWithRegister />}
        />

        {/* =========================
            HELP
        ========================= */}
        <Route
          path="/help"
          element={
            <>
              <Navbar />
              <Help />
            </>
          }
        />

        {/* =========================
            JOB DASHBOARD
        ========================= */}
        <Route
          path="/job-dashboard"
          element={
            <>
              <Navbar dashboardMode />
              <JobDashboard />
            </>
          }
        />

        {/* =========================
            REVIEWS
        ========================= */}
        <Route
          path="/reviews"
          element={<ReviewsPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
