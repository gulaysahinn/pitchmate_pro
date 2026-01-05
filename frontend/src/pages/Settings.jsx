import { useState, useEffect } from "react";
import {
  FiCpu,
  FiBell,
  FiMoon,
  FiSun,
  FiShield,
  FiTrash2,
  FiDownload,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Settings = () => {
  // Tema ve ayar state'leri
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") !== "light"
  );
  const [aiStrictness, setAiStrictness] = useState("balanced");
  const [notifications, setNotifications] = useState(true);

  // 🟢 TEMA DEĞİŞTİRME MANTIĞI
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleSave = () => {
    toast.success("Ayarlar başarıyla kaydedildi! ✨");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black italic text-white dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            SİSTEM AYARLARI
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
            Uygulama tercihlerini yönet
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20"
        >
          <FiCheck size={16} /> Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* 🌗 GÖRÜNÜM VE TEMA (AKTİF ÇALIŞAN KISIM) */}
        <section className="bg-[#121217] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 text-purple-400 font-black uppercase tracking-[0.3em] text-[10px]">
            <FiMoon size={18} /> Görünüm Teması
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setIsDarkMode(true)}
              className={`flex-1 flex items-center justify-between p-6 rounded-[2rem] border transition-all ${
                isDarkMode
                  ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                  : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <FiMoon
                  size={24}
                  className={isDarkMode ? "text-indigo-400" : ""}
                />
                <span className="font-bold text-sm uppercase tracking-widest">
                  Karanlık Mod
                </span>
              </div>
              {isDarkMode && <FiCheck className="text-indigo-400" />}
            </button>

            <button
              onClick={() => setIsDarkMode(false)}
              className={`flex-1 flex items-center justify-between p-6 rounded-[2rem] border transition-all ${
                !isDarkMode
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-900"
                  : "bg-white/5 border-transparent text-gray-500 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <FiSun
                  size={24}
                  className={!isDarkMode ? "text-amber-500" : ""}
                />
                <span className="font-bold text-sm uppercase tracking-widest">
                  Aydınlık Mod
                </span>
              </div>
              {!isDarkMode && <FiCheck className="text-amber-500" />}
            </button>
          </div>
        </section>

        {/* 🤖 ANALİZ AYARLARI */}
        <section className="bg-[#121217] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px]">
            <FiCpu size={18} /> Yapay Zeka Koç Modu
          </div>

          <div className="space-y-4">
            {["soft", "balanced", "strict"].map((mode) => (
              <div
                key={mode}
                onClick={() => setAiStrictness(mode)}
                className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer border transition-all ${
                  aiStrictness === mode
                    ? "bg-white/10 border-white/10"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-white capitalize">
                    {mode === "soft"
                      ? "Nazik"
                      : mode === "balanced"
                      ? "Dengeli"
                      : "Disiplinli"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
                    {mode === "soft"
                      ? "Daha çok motivasyon odaklı geri bildirimler."
                      : mode === "balanced"
                      ? "Profesyonel ve tarafsız analiz."
                      : "En küçük hataları bile raporlayan detaycı mod."}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    aiStrictness === mode
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-600"
                  }`}
                >
                  {aiStrictness === mode && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔔 BİLDİRİMLER */}
        <section className="bg-[#121217] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">
              <FiBell size={18} /> Bildirim Tercihleri{" "}
              <span className="text-gray-500 font-thin text-xs ml-2">
                Resonix size bildirim gönderir.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </section>

        {/* 🛡️ VERİ YÖNETİMİ */}
        <section className="bg-red-500/5 border border-red-500/10 rounded-[3rem] p-8">
          <div className="flex items-center gap-3 mb-8 text-red-400 font-black uppercase tracking-[0.3em] text-[10px]">
            <FiShield size={18} /> Kritik Alan (Geri Dönüşü Yok)
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              <FiDownload size={18} /> Verilerimi Yedekle (.JSON)
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10">
              <FiTrash2 size={18} /> Hesabı ve Analizleri Sil
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
