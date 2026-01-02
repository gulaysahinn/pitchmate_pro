import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import Layout from "./components/Layout";

// Sayfalar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AnalysisResult from "./pages/AnalysisResult";
import AnalysisHistory from "./pages/AnalysisHistory";
import Profile from "./pages/profile";
import Landing from "./pages/Landing";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PRIVATE ROUTES (Layout ile Sidebar Dahil) */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />

        <Route
          path="/analysis/result"
          element={
            <Layout>
              <AnalysisResult />
            </Layout>
          }
        />

        {/* --- 2. YENİ ROTA BURASI --- */}
        <Route
          path="/history"
          element={
            <Layout>
              <AnalysisHistory />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
