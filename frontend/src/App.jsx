
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";


import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";

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

        {/* Job Dashboard */}
        <Route
          path="/job-dashboard"
          element={
            <>
              <Navbar />

              <div
                style={{
                  minHeight: "80vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h1>Job Dashboard</h1>
              </div>
            </>
          }
        />


      </Routes>
    </BrowserRouter>
  );
}

export default App;