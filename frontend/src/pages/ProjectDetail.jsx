import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../services/api";
import {
  FiArrowLeft,
  FiLoader,
  FiCalendar,
  FiBarChart2,
  FiPlay,
  FiClock,
  FiChevronRight,
  FiTrendingUp,
} from "react-icons/fi";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- VERİ ÇEKME MANTIĞI ---
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        // 1. Proje detayını getir
        const projectData = await api.getProjectById(id);
        setProject(projectData);

        try {
          const presentationData = await api.getPresentationsByProjectId(id);
          setPresentations(presentationData);
        } catch (presError) {
          console.warn("Bu projeye ait sunum bulunamadı.");
          setPresentations([]);
        }
      } catch (error) {
        console.error("Detay Yükleme Hatası:", error);
        toast.error("Proje bilgileri yüklenemedi.");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id, navigate]);

  // --- YARDIMCI FONKSİYONLAR ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- YÜKLEME VE HATA KONTROLLERİ ---
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090b]">
        <FiLoader className="text-indigo-500 animate-spin" size={40} />
      </div>
    );

  if (!project) return null;

  return (
    <div className="p-8 animate-fade-in font-sans pb-24 text-white">
      {/* GERİ DÖNÜŞ BUTONU */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-black uppercase tracking-widest group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
        Projelere Dön
      </button>

      {/* PROJE ÜST BİLGİ ALANI */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 italic">
            {project.title}
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
            {project.description || "Bu proje için bir açıklama girilmemiş."}
          </p>
        </div>

        {/* ÖZET İSTATİSTİK KARTI */}
        <div className="bg-[#121217] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
          <div className="text-center px-4 border-r border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              Ort. Başarı
            </p>
            <p className="text-3xl font-black text-indigo-400">
              %{project.average_score?.toFixed(0) || 0}
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              Sunum
            </p>
            <p className="text-3xl font-black text-white">
              {project.session_count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* ANALİZ LİSTESİ BAŞLIĞI */}
      <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
        <FiBarChart2 className="text-indigo-500" /> Analiz Geçmişi (
        {presentations.length})
      </h3>

      {/* ANALİZ KARTLARI LİSTESİ */}
      <div className="space-y-4">
        {presentations.length > 0 ? (
          presentations.map((item) => (
            <div
              key={item.id}
              // 🟢 ANALİZ SONUÇ SAYFASINA LİNK
              onClick={() => navigate(`/analysis/result?id=${item.id}`)}
              className="group flex flex-col md:flex-row items-center justify-between p-6 bg-[#121217] border border-white/5 rounded-[2.2rem] hover:border-indigo-500/40 transition-all duration-300 cursor-pointer hover:bg-[#16161d] shadow-lg"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                {/* Oynat/İkon Kutusu */}
                <div className="w-16 h-16 bg-white/5 rounded-[1.2rem] flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <FiPlay size={24} fill="currentColor" />
                </div>

                {/* Detaylar */}
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Sunum {item.id}
                  </h4>
                  <div className="flex items-center gap-5 mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="text-indigo-500/50" />{" "}
                      {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiTrendingUp className="text-indigo-500/50" />{" "}
                      {item.overall_score?.toFixed(0)} Skor
                    </span>
                  </div>
                </div>
              </div>

              {/* Sağ Kısım: Aksiyon/Ok */}
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="hidden md:block text-right">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    Durum
                  </p>
                  <p className="text-[11px] font-bold text-emerald-400">
                    Tamamlandı
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-indigo-600/20 transition-all">
                  <FiChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          /* BOŞ DURUM MESAJI */
          <div className="py-24 text-center bg-[#121217]/50 border-2 border-dashed border-white/5 rounded-[3rem]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
              <FiBarChart2 size={32} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Henüz analiz yapılmamış.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
            >
              Yeni Analiz Başlat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
