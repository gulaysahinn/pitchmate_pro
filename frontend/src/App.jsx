import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AnalysisResult from "./pages/AnalysisResult"; // <-- YENİ İMPORT
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/result" element={<AnalysisResult />} />{" "}
        {/* <-- YENİ ROTA */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
