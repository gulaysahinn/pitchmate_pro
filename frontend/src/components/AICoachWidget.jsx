import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const AICoachWidget = ({ analysisResults }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Merhaba! Ben PitchMate AI. Analiz sonuçlarına baktım. Bana sunumunla ilgili ne sormak istersin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Context Oluşturma
  const createContextString = () => {
    if (!analysisResults) return "Kullanıcı henüz analiz yapmadı.";

    return `
      KULLANICI ANALİZ VERİLERİ:
      - Genel Puan: ${analysisResults.overall_score}/100
      - Konuşma Hızı: ${Math.round(analysisResults.wpm)} kelime/dk
      - Dolgu Kelimeler: ${analysisResults.filler_count} adet (${
      analysisResults.filler_breakdown
    })
      - Göz Teması: ${analysisResults.eye_contact_score}/100
      - Beden Dili: ${analysisResults.body_language_score}/100
      - AI İlk Yorumu: "${analysisResults.ai_feedback}"
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 👇 api.post kullanıyoruz (Token otomatik ekleniyor)
      const response = await api.post("/chat/ask", {
        message: userMsg,
        context: createContextString(),
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat Hatası:", error);
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
            className="bg-[#121217] border border-white/10 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white font-bold">
                <FiCpu /> <span>AI Koç</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
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
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-xl rounded-bl-none flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
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
                placeholder="Bir soru sor..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <FiSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <FiX size={24} /> : <FiCpu size={24} />}
      </button>
    </div>
  );
};

export default AICoachWidget;
