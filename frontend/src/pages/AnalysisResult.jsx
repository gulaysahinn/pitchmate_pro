import { useLocation, useNavigate } from "react-router-dom";
import AIInsightCard from "../components/AIInsightCard"; // Bu dosyanın var olduğundan emin ol
import AICoachWidget from "../components/AICoachWidget";
import { FiArrowLeft, FiVideo, FiMic, FiAlertTriangle } from "react-icons/fi";

const AnalysisResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.analysis_results;

  if (!result) {
    return (
      <div className="h-full w-full bg-[#09090b] text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <FiAlertTriangle size={30} className="text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Veri Bulunamadı</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 bg-indigo-600 rounded-xl font-medium"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  // Verileri güvenli şekilde al
  const overallScore = Number(result.overall_score) || 0;
  const eyeContact = Number(result.eye_contact_score) || 0;
  const bodyLanguage = Number(result.body_language_score) || 0;
  const wpm = Number(result.wpm) || 0;
  const fillerCount = Number(result.filler_count) || 0;
  const fillerDetails = result.filler_breakdown || "Yok";
  const monotony = Number(result.monotony_score) || 0;

  // Renk belirleme fonksiyonları
  const getScoreColor = (score) =>
    score >= 80
      ? "text-emerald-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";
  const getProgressColor = (score) =>
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="h-full w-full bg-[#09090b] text-white font-sans overflow-y-auto selection:bg-indigo-500/30 custom-scrollbar relative animate-fade-in">
      <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10 pb-24">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Geri Dön
          </button>
        </header>

        {/* 1. AI KOÇ GÖRÜŞÜ */}
        <AIInsightCard analysisResults={result} />

        {/* 2. SKOR KARTI */}
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 mb-6 relative overflow-hidden mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Analiz Raporu 📊
              </h1>
              <p className="text-gray-400 max-w-md">
                {overallScore >= 80
                  ? "Harika iş çıkardın! Sahne senin."
                  : "Gelişime açıksın, pratikle mükemmelleşeceksin."}
              </p>
            </div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={351}
                  strokeDashoffset={351 - (351 * overallScore) / 100}
                  className={`${
                    overallScore >= 80 ? "text-emerald-500" : "text-yellow-500"
                  } transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold">{overallScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. METRİKLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {/* GÖRSEL ANALİZ */}
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <FiVideo size={24} />
              </div>
              <h3 className="text-lg font-bold">Görsel Analiz</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Göz Teması</span>
                  <span className={getScoreColor(eyeContact)}>
                    {eyeContact}/100
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full">
                  <div
                    className={`h-full ${getProgressColor(
                      eyeContact
                    )} rounded-full`}
                    style={{ width: `${eyeContact}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Beden Dili</span>
                  <span className={getScoreColor(bodyLanguage)}>
                    {bodyLanguage}/100
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full">
                  <div
                    className={`h-full ${getProgressColor(
                      bodyLanguage
                    )} rounded-full`}
                    style={{ width: `${bodyLanguage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* SES ANALİZİ */}
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <FiMic size={24} />
              </div>
              <h3 className="text-lg font-bold">Ses Analizi</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.round(wpm)}
                </div>
                <div className="text-xs text-gray-500 uppercase">Kelime/Dk</div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl text-center flex flex-col justify-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {fillerCount}
                </div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Dolgu Kelime
                </div>
                {fillerCount > 0 && (
                  <div className="text-[10px] text-yellow-400 font-mono mt-1 px-2 py-1 bg-yellow-500/10 rounded-lg break-words">
                    {fillerDetails}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Ses Enerjisi / Canlılık</span>
                <span className={getScoreColor(monotony)}>{monotony}/100</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full">
                <div
                  className={`h-full ${getProgressColor(
                    monotony
                  )} rounded-full`}
                  style={{ width: `${monotony}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <AICoachWidget analysisResults={result} />
      </div>
    </div>
  );
};

export default AnalysisResult;
