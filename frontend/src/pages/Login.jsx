import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api"; // API servisin
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi"; // Spinner ikonu için
import sunumImg from "/sunum.png"; // Public klasöründen

const Login = () => {
  const navigate = useNavigate();

  // State'ler
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false); // Titreme kontrolü
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
    // Kullanıcı yazmaya başlayınca titremeyi durdur
    if (errorShake) setErrorShake(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit validasyon
    if (!formData.username || !formData.password) {
      triggerShake();
      toast.warning("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // API İsteği
      await login(formData.username, formData.password);

      // Beni Hatırla Mantığı
      if (rememberMe) {
        localStorage.setItem("savedUsername", formData.username);
      } else {
        localStorage.removeItem("savedUsername");
      }

      toast.success("Giriş Başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.error(error);
      triggerShake(); // Hata varsa titret
      const msg =
        error.response?.data?.detail ||
        "Giriş başarısız. Bilgileri kontrol edin.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Titreme Animasyonunu Tetikleyici
  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500); // 500ms sonra durdur
  };

  // Şifremi Unuttum İşlevi
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0f1a] via-[#121225] to-[#0b0b14] flex items-center justify-center px-6 overflow-hidden">
      {/* CSS STYLES (Float & Shake) */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
            border-color: #ef4444 !important; /* Hata durumunda kırmızı sınır */
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); /* Kırmızı glow */
          }
        `}
      </style>

      <div className="max-w-6xl w-full flex flex-col-reverse lg:flex-row rounded-3xl overflow-hidden">
        {/* SOL KUTU – LOGIN FORM */}
        <div className="w-full lg:w-[45%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] z-10">
          {/* LOGO / BAŞLIK */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
              PitchMate
            </h1>
            <p className="text-indigo-200/60 font-medium">
              AI Presentation Coach
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* INPUTLAR */}
            <div className="space-y-5">
              {/* Kullanıcı Adı */}
              <div className="group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Kullanıcı adı"
                  className={`
                    w-full px-5 py-4 rounded-xl bg-[#0b0b14]/60 border border-white/10 text-white placeholder-gray-500 
                    transition-all duration-300
                    focus:outline-none focus:border-indigo-500 
                    focus:shadow-[0_0_15px_rgba(99,102,241,0.5)] 
                    ${errorShake ? "animate-shake" : ""}
                  `}
                />
              </div>

              {/* Şifre */}
              <div className="group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifre"
                  className={`
                    w-full px-5 py-4 rounded-xl bg-[#0b0b14]/60 border border-white/10 text-white placeholder-gray-500 
                    transition-all duration-300
                    focus:outline-none focus:border-indigo-500 
                    focus:shadow-[0_0_15px_rgba(99,102,241,0.5)]
                    ${errorShake ? "animate-shake" : ""}
                  `}
                />
              </div>
            </div>

            {/* HATIRLA + UNUTTUM */}
            <div className="flex items-center justify-between mt-5 text-sm text-gray-400">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500 focus:ring-offset-0 focus:ring-2 focus:ring-indigo-500/50"
                />
                Beni hatırla
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none"
              >
                Şifremi unuttum
              </button>
            </div>

            {/* GİRİŞ BUTONU (LOADING SPINNER EKLENDİ) */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full mt-8 py-4 rounded-xl text-white font-bold
                bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-600 hover:to-purple-700
                shadow-lg shadow-indigo-500/30
                transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-xl" /> Giriş
                  Yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          {/* AYRAÇ */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-gray-500 text-xs tracking-widest uppercase font-medium">
              veya
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* GOOGLE BUTONU */}
          <button
            onClick={() => toast.info("Google entegrasyonu yakında!")}
            className="
              w-full py-3.5 rounded-xl bg-white text-black font-bold
              hover:bg-gray-100 transition-all duration-300
              hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]
              hover:scale-[1.01] active:scale-[0.98]
              flex items-center justify-center gap-3
            "
          >
            {/* Google SVG İkonu */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google ile giriş yap
          </button>

          {/* KAYIT LİNKİ */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Hesabın yok mu?{" "}
            <Link
              to="/register"
              className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors"
            >
              Hemen Kayıt ol
            </Link>
          </p>
        </div>

        {/* SAĞ TARAF – GÖRSEL */}
        <div className="flex w-[55%] items-center justify-center relative">
          {/* Arka Plan Glow Efekti */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

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
