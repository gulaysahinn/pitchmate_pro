import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadVideo, getDashboardStats } from "../services/api"; // Backend fonksiyonları
// İkonlar
import {
  FiLogOut,
  FiVideo,
  FiActivity,
  FiSettings,
  FiCamera,
  FiMic,
  FiStopCircle,
  FiBarChart2,
  FiClock,
} from "react-icons/fi";
import { BiCameraMovie, BiCameraOff, BiMicrophone } from "react-icons/bi";

const Dashboard = () => {
  // --- 1. STATE YÖNETİMİ ---

  // Kullanıcı Bilgisi (LocalStorage'dan güvenli okuma)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("User data error", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  // İstatistikler (Backend'den gelecek)
  const [stats, setStats] = useState({
    total_presentations: 0,
    average_score: 0,
    total_duration_minutes: 0,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const navigate = useNavigate();

  // --- 2. EFFECTLER (Yaşam Döngüsü) ---

  // A. Kullanıcı Kontrolü ve İstatistik Çekme
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Backend'den istatistikleri çek
    const fetchStats = async () => {
      try {
        // Kullanıcı adını al (user objesinin yapısına göre)
        const currentUsername = user.username || user.user?.username;
        if (currentUsername) {
          const data = await getDashboardStats(currentUsername);
          setStats({
            total_presentations: data.total_presentations || 0,
            average_score: data.average_score || 0,
            total_duration_minutes: data.total_duration_minutes || 0,
          });
        }
      } catch (error) {
        console.error("İstatistikler alınamadı:", error);
        // Hata olsa bile varsayılan 0 değerleri kalır, uygulama çökmez.
      }
    };

    fetchStats();
  }, [user, navigate]);

  // B. Kamera Görüntüsünü Video Elementine Bağla
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // C. Sayfadan Ayrılırken Temizlik
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // --- 3. FONKSİYONLAR ---

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      toast.success("Stüdyo hazır! 📸");
    } catch (err) {
      toast.error("Kameraya erişim izni gerekli.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  };

  const handleStartRecording = () => {
    if (!stream) {
      toast.warning("Önce kamerayı açmalısın!");
      return;
    }
    chunksRef.current = [];
    const options = { mimeType: "video/webm" };

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = handleStopRecordingUpload;
      recorder.start();
      setIsRecording(true);
      toast.info("Kayda girildi! Başarılar... 🎬");
    } catch (error) {
      console.error("Recorder hatası:", error);
      toast.error("Kayıt başlatılamadı.");
    }
  };

  const handleStopClick = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStopRecordingUpload = async () => {
    stopCamera();
    setIsUploading(true);

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const file = new File([blob], "live_session.webm", { type: "video/webm" });

    try {
      const response = await uploadVideo(file);
      toast.success("Analiz tamamlandı! 🚀", { autoClose: 2000 });

      setTimeout(() => {
        navigate("/result", {
          state: { analysis_results: response.analysis_results },
        });
      }, 2000);
    } catch (error) {
      console.error("Upload hatası:", error);
      toast.error("Yükleme başarısız oldu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    stopCamera();
    localStorage.removeItem("user");
    navigate("/");
  };

  // Yükleniyor durumu (User yoksa)
  if (!user) return <div className="min-h-screen bg-[#09090b]"></div>;

  // Kullanıcı Bilgileri Hazırlığı
  const displayUsername = user.username || user.user?.username || "Kullanıcı";
  const displayEmail = user.email || user.user?.email || "Free Plan";
  const userInitial = displayUsername.charAt(0).toUpperCase();

  // Dakikayı saate çevir (Görsel amaçlı)
  const durationInHours = (stats.total_duration_minutes / 60).toFixed(1);

  return (
    <div className="flex w-full h-screen bg-[#09090b] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      {/* --- GLOBAL STYLES --- */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        
        @keyframes pulse-soft { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes music { 0%, 100% { height: 20%; } 50% { height: 100%; } }
      `}</style>

      {/* Arka Plan Deseni (Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0c0c10] border-r border-white/5 flex flex-col justify-between z-30 shrink-0 h-full">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-sm">
                P
              </div>
              <span className="text-lg font-bold tracking-tight">
                PitchMate
              </span>
            </div>
          </div>

          {/* Menü */}
          <div className="p-3 space-y-1 mt-4">
            <p className="px-3 text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Dashboard
            </p>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10 font-medium text-sm transition-all">
              <FiVideo size={16} />
              <span>Stüdyo</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all">
              <FiActivity size={16} />
              <span>Analiz Geçmişi</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all">
              <FiSettings size={16} />
              <span>Ayarlar</span>
            </button>
          </div>

          {/* Pro Banner */}
          <div className="mx-3 mt-4 p-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-white/10 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-sm mb-1 text-white">
                Pro'ya Geç 🚀
              </h4>
              <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                Sınırsız analiz ve detaylı AI koçluğu için yükseltin.
              </p>
              <button className="w-full py-1.5 bg-white text-black text-[10px] font-bold rounded hover:bg-gray-200 transition-colors">
                Planları İncele
              </button>
            </div>
            {/* Dekoratif */}
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* User Profile (Sidebar Footer) */}
        <div className="p-3 border-t border-white/5 bg-[#0a0a0c]">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-white/10 shrink-0">
                {userInitial}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">
                  {displayUsername}
                </span>
                <span className="text-[10px] text-gray-500 truncate">
                  {displayEmail}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Çıkış Yap"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-gray-300">
              Hoş geldin,{" "}
              <span className="text-white font-bold">{displayUsername}</span> 👋
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
                stream
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  stream ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"
                }`}
              ></div>
              {stream ? "Kamera Aktif" : "Beklemede"}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* VIDEO STUDIO */}
            <div className="bg-[#121217] border border-white/5 rounded-2xl p-1 shadow-2xl overflow-hidden relative group">
              <div className="aspect-video bg-black/50 rounded-xl relative overflow-hidden flex flex-col justify-center items-center">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  ></video>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <FiCamera size={30} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Stüdyo Kapalı
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">
                      Sunum provasına başlamak için kameranızı aktifleştirin.
                    </p>
                  </div>
                )}

                {/* Pro Grid Lines (Kamera açıkken) */}
                {stream && (
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-white"></div>
                      <div className="border-r border-white"></div>
                      <div></div>
                      <div className="border-t border-r border-white"></div>
                      <div className="border-t border-r border-white"></div>
                      <div className="border-t border-white"></div>
                      <div className="border-t border-r border-white"></div>
                      <div className="border-t border-r border-white"></div>
                      <div className="border-t border-white"></div>
                    </div>
                  </div>
                )}

                {/* Kayıt Göstergeleri */}
                {isRecording && (
                  <>
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div> REC
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-end gap-1 h-5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full animate-[music_0.5s_ease-in-out_infinite]"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  </>
                )}

                {/* Yükleniyor Ekranı */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold">
                      Video Analiz Ediliyor...
                    </p>
                  </div>
                )}
              </div>

              {/* Control Bar (Dock) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex items-center gap-2 shadow-xl z-20">
                {!isRecording ? (
                  <>
                    <button
                      onClick={stream ? stopCamera : startCamera}
                      className={`p-3 rounded-lg transition-all ${
                        stream
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                      title={stream ? "Kamerayı Kapat" : "Kamerayı Aç"}
                    >
                      {stream ? (
                        <BiCameraOff size={20} />
                      ) : (
                        <FiCamera size={20} />
                      )}
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <button
                      onClick={handleStartRecording}
                      disabled={!stream || isUploading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                        stream
                          ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                          : "bg-white/5 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          stream ? "bg-red-500" : "bg-gray-500"
                        }`}
                      ></div>
                      Kaydı Başlat
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <button className="p-3 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all">
                      <BiMicrophone size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStopClick}
                    className="flex items-center gap-2 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-500/20 transition-all"
                  >
                    <FiStopCircle size={20} />
                    Bitir ve Analiz Et
                  </button>
                )}
              </div>
            </div>

            {/* İSTATİSTİK WIDGETLARI (Backend Verileri) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Widget 1: Toplam Prova */}
              <div className="bg-[#121217] border border-white/5 rounded-xl p-5 flex items-start justify-between group hover:border-white/10 transition-colors">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Toplam Prova
                  </p>
                  <h4 className="text-2xl font-bold text-white">
                    {stats.total_presentations}
                  </h4>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <FiVideo size={20} />
                </div>
              </div>

              {/* Widget 2: Ortalama Skor */}
              <div className="bg-[#121217] border border-white/5 rounded-xl p-5 flex items-start justify-between group hover:border-white/10 transition-colors">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Ortalama Skor
                  </p>
                  <h4 className="text-2xl font-bold text-white">
                    {stats.average_score}
                    <span className="text-sm text-gray-500 font-normal">
                      /100
                    </span>
                  </h4>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <FiBarChart2 size={20} />
                </div>
              </div>

              {/* Widget 3: Pratik Süresi */}
              <div className="bg-[#121217] border border-white/5 rounded-xl p-5 flex items-start justify-between group hover:border-white/10 transition-colors">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
                    Pratik Süresi
                  </p>
                  <h4 className="text-2xl font-bold text-white">
                    {durationInHours}
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}
                      saat
                    </span>
                  </h4>
                </div>
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <FiClock size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
