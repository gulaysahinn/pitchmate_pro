import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo, getAnalysisHistory } from "../services/api"; // getHistory eklendi
import { toast } from "react-toastify";
import {
  FiVideo,
  FiStopCircle,
  FiUploadCloud,
  FiCpu,
  FiCheckCircle,
  FiCameraOff,
  FiUser,
  FiActivity,
} from "react-icons/fi";

const Dashboard = () => {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [username, setUsername] = useState(""); // Kullanıcı adı state'i
  const [stats, setStats] = useState({ total: 0, average: 0 }); // İstatistikler

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. GİRİŞ KONTROLÜ VE KULLANICI BİLGİSİ ---
  useEffect(() => {
    // LocalStorage'dan kullanıcıyı al
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login"); // Giriş yapılmamışsa at
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      // Login cevabında user objesi bazen direkt, bazen .user içinde olabilir
      const name = userData.username || userData.user?.username || "Misafir";
      setUsername(name);

      // Kullanıcının istatistiklerini çek (Opsiyonel ama şık)
      fetchStats(name);
    } catch (e) {
      console.error("Kullanıcı verisi okunamadı", e);
      navigate("/login");
    }

    return () => stopCamera();
  }, [navigate]);

  // --- İstatistikleri Çek ---
  const fetchStats = async (user) => {
    try {
      const history = await getAnalysisHistory(user);
      if (history && history.length > 0) {
        const total = history.length;
        const sum = history.reduce(
          (acc, curr) => acc + (Number(curr.overall_score) || 0),
          0
        );
        const avg = (sum / total).toFixed(1);
        setStats({ total, average: avg });
      }
    } catch (error) {
      // İstatistik çekilemezse sorun değil, sessiz kal
      console.log("İstatistikler alınamadı (Henüz veri yok olabilir).");
    }
  };

  // --- KAMERA BAĞLANTISI ---
  useEffect(() => {
    if (recording && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [recording]);

  const startCameraAndRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = mediaStream;
      setRecording(true);
      setTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoBlob(blob);
        stopCamera();
        clearInterval(timerIntervalRef.current);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Kamera hatası:", err);
      toast.error("Kamera açılamadı. İzinleri kontrol edin.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleUpload = async () => {
    if (!videoBlob) return;

    setLoading(true);
    const file = new File([videoBlob], "presentation.webm", {
      type: "video/webm",
    });

    try {
      const result = await uploadVideo(file);
      toast.success("Analiz tamamlandı! 🚀");
      navigate("/analysis/result", { state: { analysis_results: result } });
    } catch (error) {
      console.error(error);
      toast.error("Video yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 animate-fade-in pb-24">
      <div className="max-w-5xl mx-auto">
        {/* --- ÜST BİLGİ KARTI --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
              Hoş Geldin, {username} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Bugün harika bir sunum yapmaya hazır mısın?
            </p>
          </div>

          {/* Küçük İstatistikler */}
          <div className="flex gap-4">
            <div className="bg-[#121217] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <FiVideo />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">
                  Toplam
                </p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="bg-[#121217] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <FiActivity />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">
                  Ortalama
                </p>
                <p className="text-lg font-bold">{stats.average}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- KAMERA ALANI --- */}
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="aspect-video bg-black/50 rounded-2xl overflow-hidden relative border border-white/5 flex items-center justify-center group">
            {/* 1. KAYITTA */}
            {recording ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : videoBlob ? (
              /* 2. VİDEO HAZIR */
              <div className="text-center animate-fade-in">
                <div className="relative">
                  <FiCheckCircle
                    size={64}
                    className="text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>
                <p className="text-2xl font-bold text-white">Video Hazır!</p>
                <p className="text-gray-400 text-sm mt-2">
                  Hemen analizi başlatabilirsin.
                </p>
              </div>
            ) : (
              /* 3. BEKLEMEDE */
              <div className="text-center text-gray-500 transition-all duration-300 group-hover:scale-105">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
                  <FiCameraOff
                    size={40}
                    className="opacity-50 group-hover:text-indigo-400 group-hover:opacity-100 transition-all"
                  />
                </div>
                <p className="text-lg font-medium text-gray-300">
                  Kamera Hazır Değil
                </p>
                <p className="text-sm opacity-60">
                  Başlamak için aşağıdaki butona tıkla.
                </p>
              </div>
            )}

            {/* SÜRE SAYACI */}
            {recording && (
              <div className="absolute top-6 right-6 bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse font-bold border border-red-500/30 backdrop-blur-md shadow-lg">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_red]"></div>
                {formatTime(timer)}
              </div>
            )}
          </div>

          {/* BUTONLAR */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {!recording && !videoBlob && (
              <button
                onClick={startCameraAndRecording}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              >
                <div className="p-1.5 bg-white/20 rounded-full">
                  <FiVideo size={20} />
                </div>
                <span>Kaydı Başlat</span>
              </button>
            )}

            {recording && (
              <button
                onClick={stopRecording}
                className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 animate-pulse hover:animate-none"
              >
                <div className="p-1.5 bg-white/20 rounded-full">
                  <FiStopCircle size={20} />
                </div>
                <span>Kaydı Bitir</span>
              </button>
            )}

            {videoBlob && !loading && (
              <div className="flex gap-4 animate-fade-in-up">
                <button
                  onClick={() => {
                    setVideoBlob(null);
                    setTimer(0);
                  }}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors font-medium hover:text-white"
                >
                  Tekrar Çek
                </button>
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  <FiUploadCloud size={20} />
                  Analizi Başlat
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-3 text-indigo-400 font-bold animate-pulse">
                <FiCpu className="animate-spin text-indigo-500" size={40} />
                <span className="text-lg">Yapay Zeka Analiz Ediyor...</span>
                <span className="text-xs text-gray-500 font-normal">
                  Bu işlem birkaç saniye sürebilir.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
