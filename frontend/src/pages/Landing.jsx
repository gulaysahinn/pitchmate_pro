import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiVideo,
  FiMic,
  FiActivity,
  FiCpu,
  FiArrowRight,
  FiPlay,
  FiGithub,
  FiLinkedin,
} from "react-icons/fi";

const Landing = () => {
  const navigate = useNavigate();

  // "Nasıl Çalışır" butonuna basınca aşağı kaydırma fonksiyonu
  const scrollToHowItWorks = () => {
    const section = document.getElementById("nasil-calisir");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Animasyon varyasyonları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* --- ARKA PLAN EFEKTLERİ --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px] opacity-30"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="absolute top-10 left-10 flex items-center gap-4 z-50 group cursor-pointer">
              <img
                src="/logo.png"
                alt="Icon"
                className="w-48 h-32 object-contain"
              />
            </div>
          </div>

          {/* Butonlar (GÜNCELLENDİ) */}
          <div className="flex items-center gap-4">
            {/* Link olarak Kayıt Ol */}
            <button
              onClick={() => navigate("/register")}
              className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Kayıt Ol
            </button>

            {/* Ana Buton olarak Giriş Yap */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
            >
              Giriş Yap
            </motion.button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-32 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Rozet */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-8"
            >
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                Yapay Zeka Destekli Sunum Koçu
              </span>
            </motion.div>

            {/* Başlık */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight"
            >
              Sunum Becerilerinizi <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Mükemmelleştirin.
              </span>
            </motion.h1>

            {/* Açıklama */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Kameranızı açın, sunumunuzu yapın. Yapay zeka; ses tonunuzu, göz
              temasınızı ve beden dilinizi saniyeler içinde analiz etsin.
            </motion.p>

            {/* CTA Butonları */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30"
              >
                Hemen Başla <FiArrowRight />
              </motion.button>

              {/* Nasıl Çalışır Butonu (DÜZELTİLDİ) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-8 py-4 bg-[#18181b]/50 hover:bg-[#27272a]/80 backdrop-blur-md text-white border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <FiPlay className="ml-1 text-sm" />
                </div>
                Nasıl Çalışır?
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- MOCKUP / GÖRSEL ALANI --- */}
      <section className="relative z-10 px-4 -mt-10 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20 bg-[#121217]">
            <div className="h-10 bg-[#18181b] border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-[#0a0a0c] to-[#121217] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                  <FiVideo size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200">
                  Canlı Analiz Ekranı
                </h3>
                <p className="text-gray-500 mt-2">
                  Gerçek zamanlı AI geri bildirimleri burada görünür.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- ÖZELLİKLER (GRID) - ID EKLENDİ --- */}
      <section
        id="nasil-calisir"
        className="py-24 bg-[#08080a] border-t border-white/5 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Neleri Analiz Ediyoruz?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              PitchMate, gelişmiş görüntü işleme ve doğal dil işleme
              tekniklerini kullanarak sunumunuzun her karesini inceler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<FiVideo size={28} />}
              title="Göz Teması"
              desc="İzleyicilerle (kamerayla) kurduğunuz göz temasını saniye saniye takip eder."
              color="text-emerald-400"
              bg="from-emerald-500/20 to-emerald-500/5"
              border="group-hover:border-emerald-500/30"
            />
            <FeatureCard
              icon={<FiMic size={28} />}
              title="Ses & Akıcılık"
              desc="Konuşma hızınızı (WPM), tonlamanızı ve gereksiz duraksamaları ölçer."
              color="text-purple-400"
              bg="from-purple-500/20 to-purple-500/5"
              border="group-hover:border-purple-500/30"
            />
            <FeatureCard
              icon={<FiActivity size={28} />}
              title="Duygu Analizi"
              desc="Konuşmanızın pozitif, negatif veya nötr duygu durumunu tespit eder."
              color="text-amber-400"
              bg="from-amber-500/20 to-amber-500/5"
              border="group-hover:border-amber-500/30"
            />
            <FeatureCard
              icon={<FiCpu size={28} />}
              title="Gemini AI Koç"
              desc="Google Gemini destekli yapay zeka, size kişiselleştirilmiş gelişim tavsiyeleri sunar."
              color="text-indigo-400"
              bg="from-indigo-500/20 to-indigo-500/5"
              border="group-hover:border-indigo-500/30"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 bg-[#050507] text-gray-400 text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xs">
              R
            </div>
            <span>Resonix</span>
          </div>

          <p className="opacity-60">
            &copy; 2026 Resonix. Tüm hakları saklıdır.
          </p>

          <div className="flex gap-4">
            <a
              href="https://github.com/gulaysahinn"
              className="hover:text-white transition-colors"
            >
              <FiGithub size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/gulaysahinn/"
              className="hover:text-white transition-colors"
            >
              <FiLinkedin size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color, bg, border }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`p-8 rounded-[2rem] bg-[#121217] border border-white/5 transition-all duration-300 group relative overflow-hidden ${border}`}
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bg} blur-[60px] rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>

    <div
      className={`w-14 h-14 bg-gradient-to-br ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg relative z-10`}
    >
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-white relative z-10">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
      {desc}
    </p>
  </motion.div>
);

export default Landing;
