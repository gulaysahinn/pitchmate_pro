import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import Layout from "./components/MainLayout";

// Sayfalar
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnalysisResult from "./pages/AnalysisResult";
import AnalysisHistory from "./pages/AnalysisHistory";
import Profile from "./pages/profile";
import Landing from "./pages/Landing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PracticeRoom from "./pages/PracticeRoom";

// 🟢 YENİ EKLENEN SAYFALAR
import Projects from "./pages/Projects";
import AICoach from "./pages/AICoach";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <Routes>
        {/* --- 1. PUBLIC ROUTES --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* --- 2. PROTECTED ROUTES (Sidebar Olan Sayfalar) --- */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<AnalysisHistory />} />
          <Route path="/analysis/result" element={<AnalysisResult />} />

          {/* 🟢 YENİ ROTALAR BURAYA EKLENDİ */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/ai-coach" element={<AICoach />} />
        </Route>

        {/* --- 3. FULL SCREEN PAGES --- */}
        <Route path="/practice/:id" element={<PracticeRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
