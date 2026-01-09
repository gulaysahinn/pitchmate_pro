import { useRef, useEffect, useState } from "react"; // 🟢 useState eklendi
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"; // 🟢 useSearchParams eklendi
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import * as api from "../services/api"; // 🟢 API import edildi
import {
  FiArrowLeft,
  FiActivity,
  FiEye,
  FiMic,
  FiDownload,
  FiCpu,
  FiZap,
  FiAlertTriangle,
  FiXOctagon,
  FiLoader,
} from "react-icons/fi";

const AnalysisResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // 🟢 URL'deki ?id= kısmını okumak için
  const reportRef = useRef(null);

  // 🟢 State yönetimi: Önce location.state'e bak, yoksa null başla
  const [result, setResult] = useState(
    location.state?.analysis_results || null
  );
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    window.scrollTo(0, 0);

    // 🟢 Eğer state boşsa ve URL'de id varsa veriyi çek
    const fetchPresentationData = async () => {
      const presId = searchParams.get("id");
      if (!result && presId) {
        try {
          setLoading(true);
          // Not: api.js içinde getPresentationById fonksiyonunun olduğundan emin olun
          const data = await api.getPresentationById(presId);
          setResult(data);
        } catch (error) {
          console.error("Sunum yükleme hatası:", error);
          toast.error("Analiz detayları yüklenemedi.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPresentationData();
  }, [searchParams, result]);

  // 🟢 Yükleme Ekranı
  if (loading) {
    return (
      <div className="h-screen bg-[#09090b] text-white flex flex-col items-center justify-center">
        <FiLoader size={40} className="text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          Veriler Hazırlanıyor...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4">
        <FiAlertTriangle size={40} className="text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold">Veri Bulunamadı</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-indigo-600 rounded-xl"
        >
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  // --- VERİ HESAPLAMA (Backend & Oracle Uyumluluğu) ---
  const overallScore = Math.round(result.overall_score || 0);
  const eyeContact = Math.round(result.eye_contact_score || 0);
  const wpm = Math.round(result.wpm || 0);
  const fillerCount = result.filler_count || 0;
  const monotonyScore = Math.round(result.monotony_score || 0);

  // Dinamik Etiketleme Mantığı
  const getMonotonyStatus = (score) => {
    if (score >= 70)
      return {
        label: "Çok Monoton",
        color: "text-red-400",
        border: "border-red-500/30",
        bg: "bg-red-500/5",
      };
    if (score >= 35)
      return {
        label: "Normal",
        color: "text-blue-400",
        border: "border-blue-500/30",
        bg: "bg-blue-500/5",
      };
    return {
      label: "Canlı & Etkileyici",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
    };
  };

  const status = getMonotonyStatus(monotonyScore);

  // Dolgu Kelime Temizliği
  let fillerWords = "Mükemmel! Hiç dolgu kelime yok.";
  if (fillerCount > 0 && result.filler_breakdown) {
    fillerWords =
      result.filler_breakdown
        .replace(/[{}'"]/g, "")
        .replace(/:/g, " (")
        .replace(/,/g, "), ") + ")";
  }

  const aiFeedback = Array.isArray(result.ai_feedback)
    ? result.ai_feedback
    : [result.ai_feedback];

  // PDF İndirme Fonksiyonu (Düzeltilmiş Hata Yakalama)
  const handleDownload = async () => {
    try {
      toast.info("Rapor oluşturuluyor...");
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#09090b",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Resonix-Rapor-${Date.now()}.pdf`);
      toast.success("Rapor indirildi! 📄");
    } catch (downloadError) {
      console.error("PDF Hatası:", downloadError);
      toast.error("Rapor oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 pb-24 font-sans">
      <div className="max-w-5xl mx-auto" ref={reportRef}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm"
          >
            <FiArrowLeft /> <span>Geri Dön</span>
          </button>
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Analiz Tamamlandı
          </div>
        </div>

        {/* 1. YAPAY ZEKA GERİ BİLDİRİMİ (EN ÜSTTE) */}
        <div className="bg-gradient-to-br from-[#1a1a23] to-[#121217] border border-white/10 rounded-[2rem] p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <FiCpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resonix AI Geri Bildirimi</h2>
              <p className="text-xs text-indigo-400">
                Yapay zeka tarafından hazırlanan iyileştirme önerileri.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {aiFeedback.map((text, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all"
              >
                <FiZap className="text-yellow-400 shrink-0 mt-1" size={18} />
                <div className="text-sm leading-relaxed text-gray-300">
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. ANALİZ SKORLARI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Genel Skor Kartı */}
          <div className="bg-[#121217] border border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center shadow-xl">
            <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-8">
              Performans Skoru
            </span>
            <div
              className={`w-40 h-40 rounded-full border-[6px] flex items-center justify-center relative shadow-2xl ${
                overallScore > 75
                  ? "border-emerald-500/50 text-emerald-400"
                  : "border-yellow-500/50 text-yellow-400"
              }`}
            >
              <div className="text-center">
                <span className="text-6xl font-black block leading-none">
                  {overallScore}
                </span>
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">
                  Skor
                </span>
              </div>
            </div>
          </div>

          {/* Sağ Grid (Metrikler) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Göz Teması */}
            <div className="bg-[#121217] p-6 rounded-3xl border border-white/5 group shadow-lg">
              <div className="flex justify-between items-center mb-4 text-blue-400">
                <FiEye size={20} />
                <span className="text-2xl font-black text-white">
                  %{eyeContact}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Göz Teması Oranı
              </p>
              <div className="w-full bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${eyeContact}%` }}
                ></div>
              </div>
            </div>

            {/* Ses Monotonluğu (Etiketli) */}
            <div
              className={`bg-[#121217] p-6 rounded-3xl border ${status.border} shadow-lg transition-all`}
            >
              <div
                className={`flex justify-between items-center mb-2 ${status.color}`}
              >
                <FiMic size={20} />
                <span className="text-2xl font-black text-white">
                  %{monotonyScore}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Ses Monotonluğu
              </p>
              <div
                className={`inline-block px-3 py-1 rounded-lg ${status.bg} border border-white/5 text-[10px] font-bold uppercase ${status.color}`}
              >
                Durum: {status.label}
              </div>
            </div>

            {/* Konuşma Hızı */}
            <div className="bg-[#121217] p-6 rounded-3xl border border-white/5 shadow-lg">
              <div className="flex justify-between items-center mb-2 text-emerald-400">
                <FiActivity size={20} />
                <span className="text-2xl font-black text-white">{wpm}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Kelime / Dakika
              </p>
            </div>

            {/* Dolgu Kelimeler */}
            <div className="bg-[#121217] p-6 rounded-3xl border border-white/5 shadow-lg">
              <div className="flex justify-between items-center mb-2 text-red-400">
                <FiXOctagon size={20} />
                <span className="text-2xl font-black text-white">
                  {fillerCount}
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                Dolgu Kelime
              </p>
              <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                <p className="text-[10px] text-red-300 italic leading-snug">
                  {fillerWords}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALT BUTON */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-3 bg-white text-black px-12 py-4 rounded-[1.2rem] font-black text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
          >
            <FiDownload size={18} />
            <span>RAPORU PDF İNDİR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
