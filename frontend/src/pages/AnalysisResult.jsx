import { useLocation, useNavigate } from "react-router-dom";

const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dashboard'dan gelen veriyi al
  const result = location.state?.analysis_results;

  // Veri yoksa geri gönder
  if (!result) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <p className="mb-4">Analiz verisi bulunamadı.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-400 hover:underline"
        >
          Panele Dön
        </button>
      </div>
    );
  }

  // Renk belirleme
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  // Emojiyi metinden ayıran temizleme fonksiyonu (Kırmızı çizgiyi bu çözer)
  const formatRecommendation = (text) => {
    // Emojileri ve baştaki boşlukları siler
    return text.replace(
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u,
      ""
    );
  };

  const overallScore = result.overall_score || 0;
  const eyeScore =
    result.video_metrics?.eye_contact?.overall_eye_contact_score || 0;
  const bodyScore =
    result.video_metrics?.body_language?.overall_body_language_score || 0;

  const wpm = result.audio_metrics?.speaking_rate?.words_per_minute || 0;
  const fillers = result.audio_metrics?.filler_words?.count || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8 overflow-y-auto">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Analiz Raporun 📝
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 transition-colors"
        >
          ← Yeni Analiz Yap
        </button>
      </header>

      <div className="max-w-4xl mx-auto grid gap-8">
        {/* GENEL SKOR */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

          <div>
            <h2 className="text-xl text-slate-400 mb-2">
              Genel Sunum Performansı
            </h2>
            <div
              className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}
              <span className="text-2xl text-slate-500">/100</span>
            </div>
            <p className="text-slate-400 mt-2 max-w-md">
              {overallScore > 75
                ? "Harika iş çıkardın! Sunumun etkileyici ve profesyonel duruyor."
                : "Güzel bir başlangıç. Aşağıdaki tavsiyelerle daha iyi olabilirsin."}
            </p>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Göz Teması</span>
                <span className={getScoreColor(eyeScore)}>{eyeScore}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${eyeScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Beden Dili & Duruş</span>
                <span className={getScoreColor(bodyScore)}>{bodyScore}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${bodyScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAYLI METRİKLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Konuşma Hızı</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {wpm}{" "}
              <span className="text-sm text-slate-500 font-normal">
                kelime/dk
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {wpm > 160
                ? "Çok hızlı konuşuyorsun."
                : wpm < 100
                ? "Biraz yavaş konuşuyorsun."
                : "İdeal bir hızdasın! ⭐"}
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-pink-500/20 rounded-lg text-pink-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Dolgu Kelimeler</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {fillers}{" "}
              <span className="text-sm text-slate-500 font-normal">adet</span>
            </div>
            <p className="text-sm text-slate-400">
              {fillers === 0
                ? "Harika! Hiç dolgu kelime yok."
                : "Konuşma akıcılığı için 'eee'leri azaltabilirsin."}
            </p>
          </div>
        </div>

        {/* TAVSİYELER */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            🤖 Yapay Zeka Tavsiyeleri
          </h3>

          <div className="space-y-4">
            {result.recommendations && result.recommendations.length > 0 ? (
              result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  {/* Emojiyi burada gösteriyoruz */}
                  <span className="text-xl">
                    {rec.includes("🔴")
                      ? "🔴"
                      : rec.includes("🟡")
                      ? "🟡"
                      : rec.includes("🟢")
                      ? "🟢"
                      : "💡"}
                  </span>
                  {/* Metni temizleyip gösteriyoruz */}
                  <p className="text-slate-300">{formatRecommendation(rec)}</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
                Mükemmel! Yapay zeka eleştirecek bir nokta bulamadı. Harikasın!
                🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
