import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";
import sunumImg from "/sunum.png";

const Login = () => {
  const navigate = useNavigate();

  // State'ler
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sayfa açılınca "Beni Hatırla" kontrolü
  useEffect(() => {
    const savedUser = localStorage.getItem("savedUsername");
    if (savedUser) {
      setFormData((prev) => ({ ...prev, username: savedUser }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorShake) setErrorShake(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      triggerShake();
      toast.warning("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      await login(formData.username, formData.password);
      if (rememberMe) {
        localStorage.setItem("savedUsername", formData.username);
      } else {
        localStorage.removeItem("savedUsername");
      }
      toast.success("Giriş Başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      triggerShake();
      const msg = error.response?.data?.detail || "Giriş başarısız.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0f1a] via-[#121225] to-[#0b0b14] flex items-center justify-center px-6 overflow-hidden relative">
      {/* ÜST SOL LOGO */}
      <div className="absolute top-10 left-10 flex items-center gap-4 z-50 group cursor-pointer">
        <img src="/logo.png" alt="Icon" className="w-48 h-32 object-contain" />
      </div>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
            border-color: #ef4444 !important;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          }
        `}
      </style>

      <div className="max-w-6xl w-full flex flex-col-reverse lg:flex-row rounded-3xl lg:pl-24 overflow-hidden">
        {/* SOL – LOGIN */}
        <div className="w-full lg:w-[45%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] z-10">
          {/* BAŞLIK */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent text-center bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6">
              Hoş Geldiniz
            </h1>

            {/* 🟣 TEK CÜMLE KART */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-3xl"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 shadow-xl">
                <p className="text-gray-200 italic text-[15px] leading-relaxed">
                  “Hitabet, sahip olduğunuz en güçlü beceridir.”
                </p>
                <div className="mt-3 text-right">
                  <span className="text-xs font-semibold text-purple-400">
                    – Resonix
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Kullanıcı adı"
                className={`w-full px-5 py-4 rounded-xl bg-[#0b0b14]/60 border border-white/10 text-white placeholder-gray-500 transition-all focus:outline-none focus:border-indigo-500 ${
                  errorShake ? "animate-shake" : ""
                }`}
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifre"
                className={`w-full px-5 py-4 rounded-xl bg-[#0b0b14]/60 border border-white/10 text-white placeholder-gray-500 transition-all focus:outline-none focus:border-indigo-500 ${
                  errorShake ? "animate-shake" : ""
                }`}
              />
            </div>

            <div className="flex items-center justify-between mt-5 text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-indigo-500"
                />
                Beni hatırla
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:text-indigo-400"
              >
                Şifremi unuttum
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="animate-spin" /> Giriş Yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-indigo-400 hover:underline">
              Hemen Kayıt ol
            </Link>
          </p>
        </div>

        {/* SAĞ – GÖRSEL */}
        <div className="flex w-[55%] items-center justify-center relative">
          <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <img
            src={sunumImg}
            alt="Sunum"
            className="max-w-[85%] relative z-10 opacity-90 drop-shadow-2xl animate-float"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
