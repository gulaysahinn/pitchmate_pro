import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadVideo, getProjects } from "../services/api";
import { toast } from "react-toastify";
import {
  FiVideo,
  FiStopCircle,
  FiUploadCloud,
  FiCpu,
  FiCheckCircle,
  FiCameraOff,
  FiArrowLeft,
  FiMic,
  FiEye,
  FiSmile,
  FiList,
} from "react-icons/fi";

const PracticeRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // --- PROJE BİLGİLERİ STATE'LERİ ---
  const [projectTitle, setProjectTitle] = useState("Yükleniyor...");
  const [sessionCount, setSessionCount] = useState(0); // YENİ: Kaçıncı deneme olduğu

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // --- 1. PROJE DETAYLARINI VE DENEME SAYISINI ÇEKME ---
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        // Tüm projeleri çekip ID eşleşmesi yapıyoruz
        const allProjects = await getProjects();
        const foundProject = allProjects.find((p) => p.id === Number(id));

        if (foundProject) {
          setProjectTitle(foundProject.title);
          // YENİ: Backend'den gelen session_count'u alıyoruz.
          // Eğer undefined gelirse 0 kabul et.
          setSessionCount(foundProject.session_count || 0);
        } else {
          setProjectTitle("İsimsiz Proje");
        }
      } catch (error) {
        console.error("Proje detayları alınamadı:", error);
        setProjectTitle("Sunum Çalışması");
      }
    };

    fetchProjectDetails();

    // Component unmount olduğunda kamerayı kapat
    return () => stopCamera();
  }, [id]);

  // --- KAMERA İŞLEMLERİ ---
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
      toast.error("Kamera izni verilmedi.");
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
      const result = await uploadVideo(file, id);
      toast.success("Analiz Başarılı! 🚀");
      navigate("/analysis/result", { state: { analysis_results: result } });
    } catch (error) {
      console.error(error);
      toast.error("Yükleme hatası oluştu.");
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
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10 pb-24 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-gray-400 hover:text-white transition-all border border-white/5"
          >
            <FiArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 flex items-center gap-3">
              {projectTitle}
              {/* YENİ: Deneme Sayısı Göstergesi */}
              <span className="text-lg font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                (Deneme {sessionCount + 1})
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                Prova Modu Aktif
              </span>
            </div>
          </div>
        </div>

        {/* --- GRID LAYOUT (SOL: VİDEO, SAĞ: ASİSTAN) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --- SOL KOLON (2/3): KAMERA ALANI --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* VİDEO ÇERÇEVESİ */}
            <div
              className={`relative w-full aspect-video bg-black rounded-3xl overflow-hidden border transition-all duration-300 shadow-2xl ${
                recording
                  ? "border-red-500/50 shadow-red-900/20"
                  : "border-white/10"
              }`}
            >
              {/* Durum: Kayıt Yapılıyor */}
              {recording ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  {/* Kayıt Göstergesi */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <span className="font-mono font-bold text-white tracking-widest">
                      {formatTime(timer)}
                    </span>
                  </div>
                </>
              ) : videoBlob ? (
                /* Durum: Video Hazır */
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e0e11] relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0e0e11] to-[#0e0e11]"></div>
                  <FiCheckCircle
                    size={80}
                    className="text-emerald-500 mb-6 drop-shadow-2xl relative z-10"
                  />
                  <h2 className="text-3xl font-bold text-white relative z-10">
                    Kayıt Tamamlandı!
                  </h2>
                  <p className="text-gray-400 mt-2 relative z-10">
                    Videonu analiz etmeye hazırız.
                  </p>
                </div>
              ) : (
                /* Durum: Beklemede */
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e0e11] relative group">
                  {/* Arka plan deseni */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl relative z-10">
                    <FiCameraOff
                      size={32}
                      className="text-gray-500 group-hover:text-indigo-400 transition-colors"
                    />
                  </div>
                  <p className="text-lg font-medium text-gray-300 relative z-10">
                    Kamera Hazır Bekliyor
                  </p>
                  <p className="text-sm text-gray-500 mt-2 relative z-10">
                    Başlamak için aşağıdaki butonu kullan
                  </p>
                </div>
              )}
            </div>

            {/* KONTROL BUTONLARI */}
            <div className="flex justify-center">
              {!recording && !videoBlob && (
                <button
                  onClick={startCameraAndRecording}
                  className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <FiVideo size={16} className="fill-current" />
                  </div>
                  <span>Kaydı Başlat</span>
                </button>
              )}

              {recording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-red-500/20 hover:scale-105"
                >
                  <FiStopCircle size={24} className="animate-pulse" />
                  <span>Kaydı Bitir</span>
                </button>
              )}

              {videoBlob && !loading && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setVideoBlob(null);
                      setTimer(0);
                    }}
                    className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
                  >
                    <FiUploadCloud size={20} />
                    Analizi Başlat
                  </button>
                </div>
              )}

              {loading && (
                <div className="bg-[#18181b] px-8 py-4 rounded-2xl flex items-center gap-4 border border-indigo-500/30">
                  <FiCpu className="animate-spin text-indigo-400" size={24} />
                  <div>
                    <p className="text-indigo-400 font-bold text-sm">
                      Yapay Zeka Çalışıyor...
                    </p>
                    <p className="text-xs text-gray-500">
                      Video işleniyor, lütfen bekle.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- SAĞ KOLON (1/3): ASİSTAN PANELİ --- */}
          <div className="flex flex-col gap-6">
            {/* KART 1: AI Analiz Kriterleri */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <FiCpu size={20} />
                </div>
                <h3 className="font-bold text-white">Yapay Zeka Koçun</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                  <FiEye className="text-blue-400 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-bold text-gray-200">
                      Göz Teması
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ekrana değil, kameraya bakarak dinleyiciyle bağ kur.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                  <FiMic className="text-purple-400 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-bold text-gray-200">
                      Ses Netliği
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tane tane konuş, robotik bir tondan kaçın.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                  <FiSmile className="text-orange-400 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-bold text-gray-200">
                      Duygu Durumu
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Jest ve mimiklerin anlattığın konuyla uyumlu mu?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* KART 2: Hazırlık Checklist */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-4">
                <FiList className="text-gray-400" />
                <h3 className="font-bold text-gray-300 text-sm">
                  Başlamadan Önce
                </h3>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  Arkaplanın sade ve düzenli mi?
                </li>
                <li className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  Işık yüzüne karşıdan mı vuruyor?
                </li>
                <li className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  Mikrofonun yankı yapmıyor, değil mi?
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeRoom;
