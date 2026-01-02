import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import { toast } from "react-toastify";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import sunumImg from "/sunum.png"; // Public görseli

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // URL'den token'ı alalım (Gerçek senaryoda linkten ?token=xyz diye gelir)
  // Şimdilik test için token var varsayıyoruz.
  const token =
    new URLSearchParams(window.location.search).get("token") || "test-token";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }

    if (formData.password.length < 6) {
      toast.warning("Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, formData.password);

      toast.success(
        "Şifreniz başarıyla güncellendi! Girişe yönlendiriliyorsunuz. 🚀"
      );

      // 2 saniye sonra login'e at
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || "Şifre sıfırlama başarısız.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#050507] font-sans relative">
      {/* Arka Plan Efektleri */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SOL TARAF (GÖRSEL) --- */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-center items-center z-10 bg-[#121217]/50 backdrop-blur-sm border-r border-white/5 p-12">
        <div
          className="absolute top-12 left-12 cursor-pointer flex items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            PitchMate
          </span>
        </div>

        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <img
            src={sunumImg}
            alt="Görsel"
            className="max-w-full max-h-[80%] object-contain drop-shadow-2xl animate-float z-10 opacity-80"
          />
        </div>
      </div>

      {/* --- SAĞ TARAF (FORM) --- */}
      <div className="w-full lg:w-[45%] flex justify-center items-center relative z-10 px-8">
        <div className="w-full max-w-[440px] p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Yeni Şifre Belirle 🔑
            </h2>
            <p className="text-gray-400">
              Lütfen hesabın için güçlü bir şifre oluştur.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Yeni Şifre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Yeni Şifre
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiLock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-[#121217] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm group-hover:border-white/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiCheckCircle size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#121217] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm group-hover:border-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-6 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Güncelleniyor..." : "ŞİFREYİ GÜNCELLE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
