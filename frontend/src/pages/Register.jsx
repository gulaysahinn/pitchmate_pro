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
      toast.success("Kayıt Başarılı! 🚀");
      setTimeout(() => navigate("/login"), 1000);
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
    <div className="flex w-full h-screen overflow-hidden bg-[#050507] font-sans relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SOL TARAF (GÖRSEL - PUBLIC KLASÖRÜNDEN) --- */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-center items-center z-10 bg-[#121217]/50 backdrop-blur-sm border-r border-white/5 p-12">
        <div
          className="absolute top-12 left-12 cursor-pointer flex items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-xl">P</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            PitchMate
          </span>
        </div>

        {/* ORTA GÖRSEL (toplanti.png) */}
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          {/* 👇 BURASI DEĞİŞTİ: Direkt public'ten okuyor */}
          <img
            src="/toplanti.png"
            alt="Toplantı Görseli"
            className="max-w-full max-h-[80%] object-contain drop-shadow-2xl animate-float z-10"
          />
        </div>

        <div className="absolute bottom-12 max-w-md text-center p-6">
          <p className="text-gray-300 text-lg font-medium italic">
            "Potansiyelini keşfet, geleceği şekillendir."
          </p>
        </div>
      </div>

      {/* --- SAĞ TARAF (FORM) --- */}
      <div className="w-full lg:w-[45%] flex justify-center items-center relative z-10 px-8">
        <div className="w-full max-w-[440px] p-8 my-auto overflow-y-auto custom-scrollbar max-h-screen">
          <div
            className="lg:hidden flex justify-center mb-8 cursor-pointer items-center gap-2"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-white font-bold text-xl">PitchMate</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Hesap Oluştur 🚀
            </h2>
            <p className="text-gray-400">Hemen aramıza katıl.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiUser size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#121217] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm group-hover:border-white/20"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                E-Posta
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiMail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-[#121217] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm group-hover:border-white/20"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Şifre
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Şifre Tekrar
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <FiCheck size={20} />
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
              {loading ? "Kaydediliyor..." : "KAYIT OL"}
            </button>
          </form>

          {/* VEYA Ayracı */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#050507] text-gray-500">veya</span>
            </div>
          </div>

          {/* Google Butonu */}
          <button
            onClick={handleGoogleRegister}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <FcGoogle size={24} />
            Google ile Devam Et
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Zaten hesabın var mı?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
