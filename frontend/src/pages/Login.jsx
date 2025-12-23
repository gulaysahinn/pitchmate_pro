import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Resim Importları
import sunumImg from "../assets/sunum.png";
import logoImg from "../assets/pitchmate_logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.identifier,
        password: formData.password,
      };
      const response = await login(payload);
      localStorage.setItem("user", JSON.stringify(response));
      toast.success("Giriş Başarılı! 🚀");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login Hatası:", error);
      const errorMsg = error.response?.data?.detail || "Giriş başarısız.";
      toast.error(errorMsg);
    }
  };

  return (
    // 1. ANA ARKA PLAN: Tek renk (Koyu Lacivert/Siyah karışımı)
    // Ekranı bölmeden tüm arka planı burada veriyoruz.
    <div className="flex w-full h-screen overflow-hidden bg-[#0F0F1A] font-sans relative">
      {/* Animasyon Stili */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Arka Plan Dekoratif Işıklar (Tüm sayfa için ortak) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SOL TARAF (Logo ve Resim) --- */}
      <div className="w-[55%] relative flex flex-col justify-center items-center z-10">
        {/* LOGO: Büyütüldü (h-12 -> h-20) */}
        <div className="absolute top-12 left-12">
          <img
            src={logoImg}
            alt="PitchMate Logo"
            className="h-20 w-auto object-contain drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* ORTA GÖRSEL */}
        <div className="w-full h-full flex justify-center items-center p-12">
          <img
            src={sunumImg}
            alt="Sunum İllüstrasyonu"
            className="max-w-full max-h-[75%] object-contain drop-shadow-2xl animate-float"
          />
        </div>
      </div>

      {/* --- SAĞ TARAF (Form Kutusu) --- */}
      <div className="w-[45%] flex justify-center items-center relative z-10 px-8">
        {/* 2. FORM KUTUSU (CARD STYLE) */}
        {/* Arka plan rengi, border ve gölge ekleyerek 'Kutu' görünümü verdik */}
        <div className="w-full max-w-[440px] bg-[#1a1a2e] border border-slate-700/50 p-10 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Kutunun üzerindeki ince parlama efekti */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
            <p className="text-slate-400 text-sm">
              Lütfen hesabınıza giriş yapın.
            </p>
          </div>

          {/* Alıntı */}
          <div className="mb-8 p-4 bg-[#13131f] rounded-xl border border-slate-800">
            <p className="text-slate-300 italic text-sm">
              "Hitabet, sahip olduğunuz en güçlü beceridir."
            </p>
            <p className="text-purple-400 text-xs mt-2 font-bold text-right">
              - PitchMate AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kullanıcı Adı */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm group-hover:border-slate-600"
                  placeholder="Kullanıcı adınız"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1">
                Şifre
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm pr-12 group-hover:border-slate-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla */}
            <div className="flex items-center pt-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded bg-[#0f0f1a] border-slate-600 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300"
              >
                Beni Hatırla
              </label>
            </div>

            {/* Buton */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#FF4B4B] to-[#FF2E2E] hover:from-[#ff6b6b] hover:to-[#ff4040] text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-4 text-sm tracking-wide"
            >
              GİRİŞ YAP
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">
              Hesabın yok mu?{" "}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-all"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
