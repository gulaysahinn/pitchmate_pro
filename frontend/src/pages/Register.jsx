import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import { toast } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor!");
      return;
    }
    try {
      setLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      toast.success(
        "Kayıt Başarılı! 🚀 Giriş sayfasına yönlendiriliyorsunuz..."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Kayıt başarısız.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    toast.info("Google ile kayıt yakında eklenecek! 🚧");
  };

  return (
    <div className="flex w-full min-h-screen bg-[#050507] font-sans relative text-white selection:bg-indigo-500/30">
      <div className="absolute top-10 left-10 flex items-center gap-4 z-50 group cursor-pointer">
        <img src="/logo.png" alt="Icon" className="w-48 h-32 object-contain" />
      </div>
      {/* --- ARKA PLAN EFEKTLERİ (BLOBS) --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* --- SOL TARAF (GÖRSEL ALANI) - Sadece Büyük Ekranlar --- */}
      <div className="flex w-[55%] relative flex-col justify-center items-center z-10 bg-[#121217]/50 backdrop-blur-sm border-r border-white/5 p-12 h-screen sticky top-0">
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <img
            src="/toplanti.png"
            alt="PitchMate Toplantı"
            className="max-w-full max-h-[75%] object-contain drop-shadow-2xl animate-float relative z-10 hover:scale-[1.02] transition-transform duration-500"
          />
        </div>

        <div className="absolute bottom-12 max-w-md text-center p-6">
          <p className="text-gray-400 text-lg font-medium italic">
            "Potansiyelini keşfet, sahnede parla."
          </p>
        </div>
      </div>

      {/* --- SAĞ TARAF (FORM ALANI) --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center relative z-10 p-6 overflow-y-auto">
        {/* Mobil Header (Geri Dön) */}
        <div className="w-full max-w-[500px] flex justify-start mb-6 lg:hidden">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Ana Sayfa</span>
          </button>
        </div>

        {/* ✨ KUTU (CONTAINER) BURADA BAŞLIYOR ✨ */}
        <div className="w-full max-w-[500px] bg-[#121217]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Kutunun üzerindeki hafif parlama efekti */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>

          {/* Başlık */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-white">
              Hesap Oluştur 🚀
            </h2>
            <p className="text-gray-400 text-sm">
              Hemen aramıza katıl ve sunumlarını geliştirmeye başla.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kullanıcı Adı */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wide">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiUser size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0c] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0f0f12] focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
            </div>

            {/* E-Posta */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wide">
                E-Posta
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiMail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0c] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0f0f12] focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wide">
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiLock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3.5 bg-[#0a0a0c] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0f0f12] focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Şifre Tekrar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 ml-1 uppercase tracking-wide">
                Şifre Tekrar
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiCheck size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0c] border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0f0f12] focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 mt-4 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/20"
            >
              {loading ? "Kaydediliyor..." : "KAYIT OL"}
            </button>
          </form>

          {/* VEYA Ayracı */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="px-4 bg-[#15151a] text-gray-500 rounded-full">
                veya
              </span>
            </div>
          </div>

          {/* Google Butonu */}
          <button
            onClick={handleGoogleRegister}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] group"
          >
            <FcGoogle
              size={22}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-sm">Google ile Devam Et</span>
          </button>

          {/* Login Yönlendirmesi */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Zaten hesabın var mı?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline ml-1 transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
        {/* ✨ KUTU BİTİŞİ ✨ */}
      </div>
    </div>
  );
};

export default Register;
