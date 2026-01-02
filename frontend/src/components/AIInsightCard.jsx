import React from "react";
import { FiCpu, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const AIInsightCard = ({ analysisResults }) => {
  // Eğer analiz sonucu gelmediyse boş dön
  if (!analysisResults) return null;

  // Backend'den gelen 'ai_feedback' metnini alıyoruz
  // Eğer feedback yoksa varsayılan bir mesaj göster
  const feedback =
    analysisResults.ai_feedback ||
    "Analiz tamamlandı, ancak detaylı geri bildirim oluşturulamadı.";

  // Feedback metnini maddelere ayırmak için basit bir işlem (Eğer backend \n ile ayırdıysa)
  const feedbackItems = feedback
    .split("\n")
    .filter((item) => item.trim() !== "");

  return (
    <div className="bg-gradient-to-br from-[#1e1e24] to-[#121217] border border-indigo-500/30 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-lg animate-fade-in">
      {/* Dekoratif Arka Plan Efektleri */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[50px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-[40px] pointer-events-none"></div>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-inner shadow-indigo-500/10">
          <FiCpu size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            AI Koç Görüşü
          </h3>
          <p className="text-xs text-gray-400">
            Yapay zeka destekli performans analizi
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div className="relative z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
          {feedbackItems.length > 0 ? (
            <ul className="space-y-3">
              {feedbackItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed"
                >
                  <span className="mt-1 shrink-0 text-emerald-400">
                    <FiCheckCircle size={16} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <FiAlertCircle />
              <span>Henüz bir geri bildirim yok.</span>
            </div>
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Gemini 1.5 Flash tarafından analiz edildi</span>
          <span>%100 Otomatik</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;
