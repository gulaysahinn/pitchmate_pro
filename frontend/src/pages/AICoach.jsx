import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiCpu,
  FiUser,
  FiZap,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import api from "../services/api";
import { toast } from "react-toastify";

const AICoach = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullContext, setFullContext] = useState("");
  const chatEndRef = useRef(null);

  // 1. VERİLERİ ÇEKME (Projeler + Analizler)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Paralel olarak hem projeleri hem analiz geçmişini çekiyoruz
        const [projectsRes, historyRes] = await Promise.all([
          api.get("/projects"),
          api.get("/analysis/history"),
        ]);

        const projects = projectsRes.data || projectsRes;
        const history = historyRes.data || historyRes;

        if (Array.isArray(history) && history.length > 0) {
          // AI için geniş bir bağlam (Context) metni hazırlıyoruz
          let contextBuilder = "KULLANICI GEÇMİŞİ VE TÜM PROJELERİ:\n";

          projects.forEach((p) => {
            const related = history.filter((h) => h.project_id === p.id);
            contextBuilder += `- PROJE BAŞLIĞI: ${p.title}\n`;
            contextBuilder += `  * Yapılan deneme sayısı: ${related.length}\n`;
            if (related.length > 0) {
              const avg =
                related.reduce((acc, curr) => acc + curr.overall_score, 0) /
                related.length;
              contextBuilder += `  * Ortalama Başarı: %${avg.toFixed(1)}\n`;
            }
          });

          const latest = [...history].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )[0];
          contextBuilder += `\nEN SON ANALİZ EDİLEN SUNUM: ${
            latest.project_title || "İsimsiz"
          }\n`;
          contextBuilder += `- Skor: %${latest.overall_score}\n- Feedback: ${latest.ai_feedback}`;

          setFullContext(contextBuilder);

          setMessages([
            {
              role: "ai",
              text: `Merhaba! Toplam ${
                projects.length
              } konudaki ilerlemeni inceledim. En son "${
                latest.project_title || "sunumun"
              }" üzerine konuşmuştuk. Bugün hitabetini nasıl geliştirelim?`,
            },
          ]);
        } else {
          setMessages([
            {
              role: "ai",
              text: "Selam! Henüz kayıtlı bir analizin yok ama sunum hazırlıkları için sana tüyolar verebilirim.",
            },
          ]);
        }
      } catch (err) {
        console.error("Yükleme Hatası:", err);
        setMessages([
          {
            role: "ai",
            text: "Geçmiş verilerine şu an erişemiyorum ama genel bir sohbet edebiliriz.",
          },
        ]);
      }
    };
    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 2. MESAJ GÖNDERME VE HATA YÖNETİMİ
  const handleSend = async (e) => {
    if (e) e.preventDefault(); // Formdan tetiklenirse sayfa yenilemeyi durdur

    if (!input.trim() || loading) return;

    const userMsgText = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsgText }]);
    setInput("");
    setLoading(true);

    try {
      // API İSTEĞİ
      const response = await api.post("/chat/ask", {
        message: userMsgText,
        context: fullContext, // Artık AI tüm projeleri biliyor
      });

      // GÜVENLİ VERİ OKUMA
      const aiReply =
        response.data?.response || response.data?.reply || response.response;

      if (aiReply) {
        setMessages((prev) => [...prev, { role: "ai", text: aiReply }]);
      } else {
        throw new Error("Boş yanıt döndü.");
      }
    } catch (error) {
      console.error("Mesaj Gönderme Hatası:", error);

      // Hata detayını toast içinde gösterelim (Hata mesajını render etmeye çalışmıyoruz, sadece string basıyoruz)
      const errorMsg =
        error.response?.data?.detail ||
        "AI şu an yanıt veremiyor. Lütfen tekrar dene.";
      toast.error(errorMsg);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Üzgünüm, teknik bir aksaklık oldu. Tekrar dener misin?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex justify-center py-4 md:py-8 px-4 animate-fade-in font-sans overflow-hidden">
      <div className="w-full max-w-5xl flex gap-6 h-full">
        {/* SOHBET ALANI */}
        <div className="flex-1 flex flex-col bg-[#111116] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* HEADER */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiCpu size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Resonix AI Coach
                </h2>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  Sunum Performans Asistanın
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <FiTrendingUp /> Canlı Destek Aktif
            </div>
          </div>

          {/* MESAJLAR */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-6 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-xl"
                      : "bg-[#1c1c24] text-gray-200 border border-white/5 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start pl-2">
                <div className="bg-[#1c1c24] px-4 py-3 rounded-full flex gap-1.5 items-center border border-white/5 shadow-inner">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT ALANI */}
          <div className="px-8 pb-8 pt-2">
            <form
              onSubmit={handleSend}
              className="relative flex items-center bg-[#09090b] border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/50 transition-all shadow-inner group"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tüm sunumların hakkında soru sorabilirsin..."
                className="flex-1 bg-transparent px-5 py-3 text-sm text-white focus:outline-none placeholder-gray-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-20 shadow-lg"
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="hidden lg:flex w-64 flex-col gap-4">
          <div className="bg-[#111116] border border-white/5 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <FiTarget className="text-indigo-500" /> Hızlı Konular
            </h3>
            <div className="space-y-2">
              {[
                "Son performansım nasıl?",
                "Hangi konuda daha iyiyim?",
                "Zayıf yönlerim neler?",
              ].map((tip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(tip);
                  }}
                  className="w-full text-left px-4 py-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 rounded-xl text-[11px] font-bold text-gray-400 transition-all hover:text-white"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 rounded-[2rem] p-6 text-center">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <FiZap size={16} />
            </div>
            <h4 className="text-white font-bold text-[11px] mb-2">
              Hafıza Durumu
            </h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              AI şu an tüm sunum geçmişini ve proje başlıklarını analiz ediyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
