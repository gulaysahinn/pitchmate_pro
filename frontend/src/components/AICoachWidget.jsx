import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const AICoachWidget = ({ analysisResults: initialResults }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Merhaba! Ben Resonix AI. Sunum verilerini hazırladım, bugün neyi geliştirelim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeResults, setActiveResults] = useState(initialResults || null);
  const messagesEndRef = useRef(null);

  // 🟢 EĞER PROP BOŞSA BACKEND'DEN ÇEK
  useEffect(() => {
    if (!initialResults) {
      const fetchLastData = async () => {
        try {
          const res = await api.get("/analysis/history");
          const history = Array.isArray(res) ? res : res.data;
          if (history && history.length > 0) {
            // En güncel analizi ayarla
            setActiveResults(history[history.length - 1]);
          }
        } catch (err) {
          console.error("Widget veri çekme hatası:", err);
        }
      };
      fetchLastData();
    } else {
      setActiveResults(initialResults);
    }
  }, [initialResults]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Context Oluşturma
  const createContextString = () => {
    if (!activeResults)
      return "Kullanıcı henüz analiz yapmadı. Yeni kullanıcı.";

    return `
      KULLANICI ANALİZ VERİLERİ (Buna göre cevap ver):
      - Genel Puan: ${activeResults.overall_score}/100
      - Konuşma Hızı: ${Math.round(activeResults.wpm || 0)} kelime/dk
      - Dolgu Kelimeler: ${activeResults.filler_count || 0} adet
      - Göz Teması: %${activeResults.eye_contact_score || 0}
      - Beden Dili Skoru: %${activeResults.body_language_score || 0}
      - Senin Önceki Yorumun: "${activeResults.ai_feedback || "Yok"}"
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat/ask", {
        message: userMsg,
        context: createContextString(),
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response.data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Üzgünüm, şu an bağlantı kuramıyorum." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-[#0f0f14] border border-white/10 w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 text-white font-bold">
                <FiCpu className="animate-pulse" /> <span>Resonix Koç</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white/10 text-gray-200 rounded-tl-none border border-white/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-xl flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#09090b] border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Örn: Hızım nasıldı?"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white p-2.5 rounded-xl transition-all shadow-lg"
              >
                <FiSend size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <FiX size={24} /> : <FiCpu size={24} />}
      </button>
    </div>
  );
};

export default AICoachWidget;
