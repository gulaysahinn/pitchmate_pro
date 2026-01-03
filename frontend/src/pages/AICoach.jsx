import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiCpu,
  FiUser,
  FiInfo,
  FiZap,
  FiTarget,
  FiMessageCircle,
  FiTrendingUp,
} from "react-icons/fi";
import * as api from "../services/api";

const AICoach = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Selam! Ben PitchMate AI. Analiz verilerini inceledim. Bugün sunum tekniklerini mi geliştirelim yoksa son performansını mı değerlendirelim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.chatWithAI({ message: input });
      setMessages((prev) => [...prev, { role: "ai", text: response.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Bağlantıda bir aksaklık oldu. Lütfen tekrar dener misin?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 p-2 md:p-6 animate-fade-in font-sans overflow-hidden">
      {/* ANA SOHBET ALANI */}
      <div className="flex-1 flex flex-col bg-[#121217]/80 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* ARKA PLAN DEGRADE (Glow) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] -z-10"></div>

        {/* HEADER */}
        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.2rem] text-white shadow-lg shadow-indigo-500/20">
                <FiCpu size={26} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#121217] rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                AI Coach <span className="text-indigo-400">v2.0</span>
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                Gerçek Zamanlı Eğitim Modeli
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiTrendingUp className="text-indigo-400" /> %85 Başarı Oranı
            </div>
          </div>
        </div>

        {/* MESAJLAR */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-5 max-w-[85%] ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                    msg.role === "user"
                      ? "bg-indigo-600 border-indigo-400/50 text-white"
                      : "bg-[#1c1c24] border-white/5 text-indigo-400"
                  }`}
                >
                  {msg.role === "user" ? (
                    <FiUser size={22} />
                  ) : (
                    <FiCpu size={22} />
                  )}
                </div>
                <div
                  className={`relative px-7 py-5 rounded-[2.2rem] text-[15px] leading-relaxed tracking-wide ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-xl shadow-indigo-900/20"
                      : "bg-[#1c1c24]/80 backdrop-blur-md text-gray-200 border border-white/5 rounded-tl-none shadow-inner"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1c1c24] px-6 py-4 rounded-full flex gap-2 items-center border border-white/5 shadow-xl">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-8 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sunumun hakkında neyi merak ediyorsun?"
              className="w-full bg-[#09090b] border border-white/5 rounded-[1.8rem] px-8 py-6 pr-20 text-white text-sm focus:border-indigo-500/50 focus:outline-none transition-all shadow-2xl placeholder-gray-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              <FiSend size={22} />
            </button>
          </form>
        </div>
      </div>

      {/* SAĞ PANEL: HIZLI İPUÇLARI & İSTATİSTİK */}
      <div className="hidden xl:flex w-80 flex-col gap-6">
        <div className="bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <FiTarget className="text-indigo-500" /> Hızlı Konular
          </h3>
          <div className="space-y-3">
            {[
              "Heyecanı Kontrol Etme",
              "Göz Teması Kurma",
              "Dolgu Kelimeleri Sil",
            ].map((tip, i) => (
              <button
                key={i}
                onClick={() => setInput(tip)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-bold text-gray-300 transition-all hover:translate-x-1"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center">
          <div className="p-5 bg-indigo-500/20 rounded-3xl text-indigo-400 mb-4">
            <FiZap size={32} />
          </div>
          <h4 className="text-white font-black text-sm mb-2">Pro İpucu</h4>
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
            Sunumlarında her 3 dakikada bir duraksayarak izleyicilere soru
            sormak, etkileşimi %40 oranında artırır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
