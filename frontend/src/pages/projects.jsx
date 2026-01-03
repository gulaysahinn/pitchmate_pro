import { useState, useEffect } from "react";
import {
  FiFolder,
  FiPlus,
  FiMoreVertical,
  FiClock,
  FiVideo,
  FiArrowRight,
  FiSearch,
  FiLoader,
  FiTrendingUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { toast } from "react-toastify";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. VERİLERİ BACKEND'DEN ÇEK ---
  const fetchProjects = async () => {
    try {
      setLoading(true);
      // schemas.py içindeki ProjectOut modeline uygun veri döner
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error("Projeler yüklenirken bir hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- 2. TARİH FORMATLAYICI ---
  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- 3. DİNAMİK RENK ATAYICI ---
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-blue-500 to-cyan-600",
  ];

  // Arama filtresi
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090b]">
        <FiLoader className="text-indigo-500 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in font-sans overflow-y-auto max-h-screen custom-scrollbar">
      {/* ÜST BAŞLIK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Projelerim <span className="text-indigo-500">.</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium italic">
            Yapay zeka analizlerini organize et ve gelişimini izle.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Proje ara..."
              className="bg-[#121217] border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/dashboard")} // Genellikle yeni proje dashboard'dan oluşturulur
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg"
          >
            <FiPlus size={18} /> Yeni Proje
          </button>
        </div>
      </div>

      {/* İSTATİSTİK ÖZETİ (Dinamik) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#121217] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
            <FiFolder size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Kayıtlı Proje
            </p>
            <p className="text-xl font-bold text-white">{projects.length}</p>
          </div>
        </div>
        <div className="bg-[#121217] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
            <FiVideo size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Toplam Oturum
            </p>
            <p className="text-xl font-bold text-white">
              {projects.reduce((acc, p) => acc + (p.session_count || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-[#121217] border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
            <FiTrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Ort. Skor
            </p>
            <p className="text-xl font-bold text-white">
              %
              {(
                projects.reduce((acc, p) => acc + (p.average_score || 0), 0) /
                (projects.length || 1)
              ).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* PROJE KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group relative bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all duration-500 cursor-pointer overflow-hidden shadow-xl"
          >
            <div className="flex justify-between items-start mb-8">
              <div
                className={`p-4 bg-gradient-to-br ${
                  colors[index % colors.length]
                } rounded-2xl text-white shadow-lg`}
              >
                <FiFolder size={24} />
              </div>
              <button className="text-gray-600 hover:text-white transition-colors">
                <FiMoreVertical size={20} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
              {project.title} {/* schemas.py: title */}
            </h3>

            <p className="text-gray-500 text-xs mb-6 line-clamp-1 italic">
              {project.description || "Açıklama belirtilmemiş."}{" "}
              {/* schemas.py: description */}
            </p>

            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
              <span className="flex items-center gap-1.5">
                <FiVideo className="text-indigo-500" /> {project.session_count}{" "}
                Sunum
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock className="text-indigo-500" />{" "}
                {formatDate(project.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                Projeyi Aç
              </span>
              <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FiArrowRight size={16} />
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-[#121217] border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Aradığınız kriterde proje bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
