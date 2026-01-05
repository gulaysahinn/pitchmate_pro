import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiFolder,
  FiClock,
  FiPlay,
  FiLoader,
  FiActivity,
  FiLayers,
  FiX,
  FiEdit3,
  FiAlignLeft,
  FiAward,
  FiTrendingUp,
  FiTarget,
  FiTrash2,
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal ve Form Stateleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUsername(userData.username || "Kullanıcı");
        }

        const data = await api.getProjects();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Yükleme hatası:", err);
        toast.error(
          "Projeler yüklenemedi. Lütfen giriş yaptığınızdan emin olun."
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 🧠 AI İÇGÖRÜ HESAPLAMALARI ---
  const insights = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    const analyzedProjects = projects.filter((p) => p.average_score > 0);
    if (analyzedProjects.length === 0) return null;

    const best = [...analyzedProjects].sort(
      (a, b) => b.average_score - a.average_score
    )[0];
    const worst = [...analyzedProjects].sort(
      (a, b) => a.average_score - b.average_score
    )[0];
    const avgOverall =
      analyzedProjects.reduce((acc, curr) => acc + curr.average_score, 0) /
      analyzedProjects.length;

    let message = "Henüz yolun başındasın, pratik yapmaya devam et! 🚀";
    if (avgOverall >= 85)
      message = "Mükemmel performans! Tam bir profesyonelsin. 🏆";
    else if (avgOverall >= 60)
      message = "İyi yoldasın, küçük dokunuşlarla zirveye çıkabilirsin. ✨";

    return { best, worst, message, avgOverall };
  }, [projects]);

  // --- 🛠️ PROJE İŞLEMLERİ (Submit & Delete) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Lütfen bir başlık girin.");
      return;
    }

    setCreating(true);
    try {
      if (editingProject) {
        await api.updateProject(
          editingProject.id,
          formData.title,
          formData.description
        );
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? {
                  ...p,
                  title: formData.title,
                  description: formData.description,
                }
              : p
          )
        );
        toast.success("Konu güncellendi.");
      } else {
        const newProject = await api.createProject(
          formData.title,
          formData.description
        );
        setProjects((prev) => [newProject, ...prev]);
        toast.success("Çalışma oluşturuldu.");
        navigate(`/practice/${newProject.id}`);
      }
      closeModal();
    } catch (err) {
      console.error("İşlem hatası:", err);
      toast.error("İşlem gerçekleştirilemedi. Sunucu hatası.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`"${title}" silinsin mi? Bu işlem geri alınamaz!`))
      return;

    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Proje silindi.");
    } catch (err) {
      console.error("Silme hatası:", err);
      toast.error("Silme işlemi başarısız.");
    }
  };

  const openEditModal = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ title: "", description: "" });
  };

  const getScoreColor = (score) => {
    if (!score || score === 0)
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    if (score >= 85)
      return "bg-green-500/10 text-green-400 border-green-500/20";
    if (score >= 50)
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 animate-fade-in pb-24 font-sans relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Merhaba, {username} 👋
            </h1>
            <p className="text-gray-400 mt-2 text-lg italic">
              {insights?.message ||
                "Yeni bir çalışma başlat veya gelişimini takip et."}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <FiPlus
              size={22}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Yeni Sunum Oluştur</span>
          </button>
        </div>

        {/* --- INSIGHTS --- */}
        {!loading && insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <StatInsight
              title="En Güçlü Konu"
              value={insights.best.title}
              sub={`Skor: %${insights.best.average_score}`}
              color="emerald"
              Icon={FiAward}
            />
            <StatInsight
              title="Odaklanman Gereken"
              value={insights.worst.title}
              sub={`Skor: %${insights.worst.average_score}`}
              color="red"
              Icon={FiTarget}
            />
            <StatInsight
              title="Genel Başarı"
              value="Ortalama Performans"
              sub={`Genel: %${insights.avgOverall.toFixed(1)}`}
              color="indigo"
              Icon={FiTrendingUp}
            />
          </div>
        )}

        {/* --- PROJECT LIST --- */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <FiLoader className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-gray-500 font-medium">Veriler yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] transition-all group h-[300px]"
            >
              <FiPlus className="w-16 h-16 text-gray-500 group-hover:text-indigo-500 mb-4 transition-all" />
              <p className="text-xl font-semibold text-gray-400 group-hover:text-white">
                Yeni Başlat
              </p>
            </div>

            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/practice/${project.id}`)}
                className="bg-[#121217] border border-white/5 rounded-3xl p-6 hover:border-indigo-500/40 transition-all hover:translate-y-[-4px] group relative overflow-hidden h-[300px] flex flex-col cursor-pointer shadow-xl"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={(e) => openEditModal(e, project)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, project.id, project.title)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/20 rounded-lg text-red-500/60 hover:text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <FiFolder size={26} />
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase ${getScoreColor(
                      project.average_score
                    )}`}
                  >
                    %{project.average_score}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 italic">
                  {project.description || "Açıklama yok."}
                </p>
                <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                  <div className="text-xs text-gray-500">
                    <FiClock className="inline mr-1" />
                    {new Date(project.created_at).toLocaleDateString("tr-TR")}
                  </div>
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FiPlay className="ml-1 fill-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => !creating && closeModal()}
            ></div>
            <div className="relative bg-[#18181b] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingProject ? "Düzenle" : "Yeni Kayıt"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                  placeholder="Başlık"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <textarea
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                  placeholder="Açıklama"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 p-4 rounded-xl border border-white/10"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-indigo-600 rounded-xl font-bold"
                  >
                    {creating ? (
                      <FiLoader className="animate-spin mx-auto" />
                    ) : (
                      "Kaydet"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatInsight = ({ title, value, sub, color, Icon: IconComponent }) => {
  // Renk sınıflarını güvenli hale getiriyoruz
  const colorClasses = {
    emerald: "border-emerald-500/20 text-emerald-400 bg-emerald-500/10",
    red: "border-red-500/20 text-red-400 bg-red-500/10",
    indigo: "border-indigo-500/20 text-indigo-400 bg-indigo-500/10",
  };

  const activeClass = colorClasses[color] || colorClasses.indigo;

  return (
    <div
      className={`bg-[#121217] border ${
        activeClass.split(" ")[0]
      } p-5 rounded-3xl flex items-center gap-4 relative overflow-hidden group`}
    >
      {/* Dekoratif Arka Plan İkonu */}
      <div className="absolute top-0 right-0 p-2 opacity-5">
        {IconComponent && <IconComponent size={80} />}
      </div>

      {/* Sol İkon Kutusu */}
      <div
        className={`p-3 rounded-2xl ${activeClass
          .split(" ")
          .slice(1)
          .join(" ")}`}
      >
        {IconComponent && <IconComponent size={24} />}
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
          {title}
        </p>
        <h4 className="text-lg font-bold truncate max-w-[150px]">{value}</h4>
        <p className="text-xs font-bold opacity-80">{sub}</p>
      </div>
    </div>
  );
};

export default Dashboard;
