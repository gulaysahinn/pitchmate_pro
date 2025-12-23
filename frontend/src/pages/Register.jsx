import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";
import { toast } from "react-toastify";
// İkonlar
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

// Resim Importları
import sunumImg from "../assets/toplanti.png";
import logoImg from "../assets/pitchmate_logo.png";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Şifre Göster/Gizle State'leri
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleRegister = () => {
    toast.info("Google ile kayıt yakında aktif olacak! 🚧");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Boş Alan Kontrolü
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.warning("Lütfen tüm alanları doldurun.");
      return;
    }

    // 2. Şifre Eşleşme Kontrolü
    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler birbiriyle uyuşmuyor!");
      return;
    }

    try {
      // 3. Backend'e gidecek veriyi hazırlama
      // confirmPassword'ü buraya dahil etmiyoruz.
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      await register(dataToSend);

      toast.success("Kayıt Başarılı! 🎉 Giriş yapabilirsiniz.");

      // Başarılı olursa 1.5 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Kayıt Hatası:", error);
      const errorMsg =
        error.response?.data?.detail || "Kayıt işlemi başarısız.";
      toast.error(errorMsg);
    }
  };

  return (
    // ANA KAPLAYICI: Ekranı kaplar, mobilde dikey, masaüstünde yatay sıralanır
    <div className="flex flex-col lg:flex-row w-full h-screen bg-[#0F0F1A] font-sans relative overflow-hidden">
      {/* --- CSS STYLE: Animasyonlar ve Scrollbar --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Özel Scrollbar Tasarımı */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0F0F1A;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #2B2B40;
          border-radius: 10px;
          border: 2px solid #0F0F1A;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #4B4B60;
        }
      `}</style>

      {/* Arka Plan Dekoratif Işıklar */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* --- SOL TARAFTAKİ RESİM ALANI (SABİT) --- */}
      <div className="w-full h-[200px] lg:h-full lg:w-[55%] relative flex flex-col justify-center items-center z-10 lg:border-r border-slate-800/30 shrink-0 bg-[#0F0F1A]">
        {/* LOGO */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12">
          <img
            src={logoImg}
            alt="PitchMate Logo"
            className="h-10 lg:h-20 w-auto object-contain drop-shadow-lg opacity-90"
          />
        </div>

        {/* ORTA GÖRSEL */}
        <div className="w-full h-full flex justify-center items-center p-4 lg:p-12">
          <img
            src={sunumImg}
            alt="Sunum İllüstrasyonu"
            className="max-h-full max-w-[80%] object-contain drop-shadow-2xl animate-float"
          />
        </div>
      </div>

      {/* --- SAĞ TARAFTAKİ FORM ALANI (KAYDIRILABİLİR) --- */}
      <div className="w-full flex-1 lg:h-full lg:w-[45%] flex flex-col items-center lg:justify-center relative z-10 px-4 py-8 lg:py-10 overflow-y-auto">
        {/* FORM KARTI */}
        <div className="w-full max-w-[460px] bg-[#1a1a2e] border border-slate-700/50 p-6 lg:p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-sm shrink-0 mb-8 lg:mb-0">
          {/* Üstteki Renkli Çizgi */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Kayıt Ol 🚀
            </h2>
            <p className="text-slate-400 text-sm">
              Hemen aramıza katıl ve sunumlarını geliştir.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kullanıcı Adı */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm hover:border-slate-600"
                placeholder="kullanici_adi"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-1">
                Email Adresi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm hover:border-slate-600"
                placeholder="ornek@email.com"
                required
              />
            </div>

            {/* Şifre Alanları (Masaüstünde Yan Yana) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Şifre */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">
                  Şifre
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm pr-10 hover:border-slate-600"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Şifre Tekrar */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">
                  Şifre Tekrar
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#0f0f1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm pr-10 hover:border-slate-600"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={16} />
                    ) : (
                      <FiEye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Kayıt Ol Butonu */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#FF4B4B] to-[#FF2E2E] hover:from-[#ff6b6b] hover:to-[#ff4040] text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-2 text-sm tracking-wide"
            >
              KAYIT OL
            </button>
          </form>

          {/* Ayrac */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-[1px] bg-slate-700/50"></div>
            <span className="px-3 text-xs text-slate-500 font-medium">
              veya
            </span>
            <div className="flex-grow h-[1px] bg-slate-700/50"></div>
          </div>

          {/* Google Butonu */}
          <button
            onClick={handleGoogleRegister}
            className="w-full py-3 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg active:scale-[0.98]"
          >
            <FcGoogle size={24} />
            <span className="text-sm">Google ile Devam Et</span>
          </button>

          <div className="mt-6 text-center pt-2">
            <p className="text-slate-500 text-sm">
              Zaten hesabın var mı?{" "}
              <Link
                to="/"
                className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-all"
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
