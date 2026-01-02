import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import { toast } from "react-toastify";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import sunumImg from "/sunum.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Lütfen e-posta adresinizi girin.");
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSent(true); // Başarılı ekranına geç
      toast.success("Sıfırlama bağlantısı gönderildi! 📧");
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "İşlem başarısız.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#050507] font-sans relative">
      {/* Arka Plan Işıkları */}
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
            alt="Sunum Görseli"
            className="max-w-full max-h-[80%] object-contain drop-shadow-2xl animate-float z-10 opacity-80 grayscale-[30%]"
          />
        </div>
      </div>

      {/* --- SAĞ TARAF (FORM) --- */}
      <div className="w-full lg:w-[45%] flex justify-center items-center relative z-10 px-8">
        <div className="w-full max-w-[440px] p-8">
          {/* Geri Dön Butonu */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
          >
            <FiArrowLeft /> Giriş Ekranına Dön
          </button>

          {!isSent ? (
            // --- FORM EKRANI ---
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Şifreni mi Unuttun? 🔒
                </h2>
                <p className="text-gray-400">
                  Endişelenme, e-posta adresine sıfırlama bağlantısı
                  göndereceğiz.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 ml-1">
                    E-Posta Adresi
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                      <FiMail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#121217] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm group-hover:border-white/20"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 mt-6 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Gönderiliyor..." : "SIFIRLAMA BAĞLANTISI GÖNDER"}
                </button>
              </form>
            </>
          ) : (
            // --- BAŞARILI EKRANI ---
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <FiCheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                E-Posta Gönderildi!
              </h2>
              <p className="text-gray-400 mb-8">
                <span className="text-white font-semibold">{email}</span>{" "}
                adresine talimatları içeren bir e-posta gönderdik. Lütfen gelen
                kutunu (ve spam klasörünü) kontrol et.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
