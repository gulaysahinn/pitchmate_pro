import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../services/api";
import AICoachWidget from "../components/AICoachWidget";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; // 🟢 Grafik kütüphanesi eklendi
import {
  FiChevronRight,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiTrash2,
  FiFolder,
  FiAlertCircle,
  FiLoader,
  FiCalendar,
  FiMic,
} from "react-icons/fi";

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyRes, projectsRes] = await Promise.all([
          api.getAnalysisHistory(),
          api.getProjects(),
        ]);

        const rawHistory = Array.isArray(historyRes) ? historyRes : [];
        const rawProjects = Array.isArray(projectsRes) ? projectsRes : [];
        setProjects(rawProjects);

        const projectMap = {};
        rawProjects.forEach((p) => {
          if (p.id) projectMap[String(p.id)] = p.title;
        });

        const processedData = rawHistory
          .map((item) => {
            const pId = item.project_id ? String(item.project_id) : "null";
            return {
              ...item,
              project_id_str: pId,
              project_title: projectMap[pId] || "Genel Denemeler",
            };
          })
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Grafik için eskiden yeniye sıralı

        setHistory(processedData);
      } catch (err) {
        toast.error("Veriler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 📊 İSTATİSTİKLER ---
  const dynamicStats = useMemo(() => {
    const data =
      projectFilter === "all"
        ? history
        : history.filter((h) => h.project_id_str === projectFilter);

    if (data.length === 0) return { total: 0, best: 0, average: 0 };
    const scores = data.map((h) => Number(h.overall_score) || 0);
    return {
      total: data.length,
      best: Math.max(...scores).toFixed(1),
      average: (scores.reduce((a, b) => a + b, 0) / data.length).toFixed(1),
    };
  }, [history, projectFilter]);

  // --- 📂 FİLTRELEME VE GRUPLANDIRMA ---
  const filteredHistory = useMemo(() => {
    const data = history.filter((item) => {
      if (projectFilter !== "all" && item.project_id_str !== projectFilter)
        return false;
      const score = Number(item.overall_score) || 0;
      if (scoreFilter === "high" && score < 80) return false;
      if (scoreFilter === "medium" && (score < 60 || score >= 80)) return false;
      if (scoreFilter === "low" && score >= 60) return false;
      return true;
    });
    // Listeyi en yeni en üstte gösterebilmek için ters çeviriyoruz
    return [...data].reverse();
  }, [history, scoreFilter, projectFilter]);

  const groupedHistory = useMemo(() => {
    const groups = {};
    filteredHistory.forEach((item) => {
      const title = item.project_title;
      if (!groups[title]) groups[title] = [];
      groups[title].push(item);
    });
    return groups;
  }, [filteredHistory]);

  if (loading)
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">
        <FiLoader className="animate-spin" size={40} />
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full bg-[#09090b] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="px-8 pt-8 pb-4 z-10 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <header className="flex justify-between items-center max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl font-black">Analiz Geçmişi</h1>
          <div className="flex gap-3">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 bg-[#121217] border border-white/10 rounded-xl text-sm font-bold text-gray-300 outline-none"
            >
              <option value="all">📁 Tüm Konular</option>
              {projects.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 bg-indigo-600 rounded-xl text-sm font-bold shadow-lg"
            >
              YENİ KAYIT
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-4">
          <StatCard
            title="SUNUM SAYISI"
            value={dynamicStats.total}
            icon={<FiActivity />}
            color="text-indigo-400"
            bg="bg-indigo-400/10"
          />
          <StatCard
            title="EN İYİ SKOR"
            value={dynamicStats.best}
            icon={<FiAward />}
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
          <StatCard
            title="KONU ORTALAMASI"
            value={dynamicStats.average}
            icon={<FiTrendingUp />}
            color="text-purple-400"
            bg="bg-purple-400/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 z-10 custom-scrollbar">
        <div className="max-w-6xl mx-auto mt-8">
          {/* 🟢 GELİŞİM GRAFİĞİ BÖLÜMÜ */}
          {history.length > 0 && (
            <div className="bg-[#121217] border border-white/5 rounded-3xl p-6 mb-10 shadow-xl">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-400" />{" "}
                {projectFilter === "all"
                  ? "Genel Performans Trendi"
                  : "Konu Bazlı Gelişim"}
              </h3>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={history.filter(
                      (h) =>
                        projectFilter === "all" ||
                        h.project_id_str === projectFilter
                    )}
                  >
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ffffff05"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      stroke="#4b5563"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#4b5563"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(d) =>
                        new Date(d).toLocaleString("tr-TR")
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="overall_score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PUAN FİLTRELERİ */}
          <div className="flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
            {["all", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest border transition-all ${
                  scoreFilter === f
                    ? "bg-white text-black border-white shadow-xl"
                    : "bg-transparent text-gray-500 border-white/10 hover:border-white/20"
                }`}
              >
                {f === "all"
                  ? "TÜMÜ"
                  : f === "high"
                  ? "MÜKEMMEL"
                  : f === "medium"
                  ? "İYİ"
                  : "GELİŞTİRİLMELİ"}
              </button>
            ))}
          </div>

          {/* LİSTE */}
          {Object.entries(groupedHistory).length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <FiAlertCircle className="mx-auto text-gray-600 mb-4" size={40} />
              <p className="text-gray-500 font-bold">Kayıt bulunamadı.</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([title, sessions]) => (
              <div key={title} className="mb-12">
                <div className="flex items-center gap-4 mb-6 px-4">
                  <FiFolder className="text-indigo-400" size={20} />
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <div className="h-px bg-white/5 flex-1 ml-4"></div>
                </div>
                <div className="grid gap-3">
                  {sessions.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        navigate("/analysis/result", {
                          state: { analysis_results: item },
                        })
                      }
                      className="group bg-[#121217]/40 hover:bg-[#121217] border border-white/5 hover:border-indigo-500/40 p-5 rounded-[2.5rem] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${
                            item.overall_score >= 80
                              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                              : "text-yellow-400 border-yellow-500/20"
                          }`}
                        >
                          <span className="text-xl font-black">
                            {Math.round(item.overall_score)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-indigo-400">
                            Deneme {sessions.length - idx}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                            <span className="flex items-center gap-1.5">
                              <FiCalendar size={12} />{" "}
                              {new Date(item.created_at).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FiMic size={12} /> {Math.round(item.wpm)} WPM
                            </span>
                          </div>
                        </div>
                      </div>
                      <FiChevronRight
                        className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all"
                        size={24}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <AICoachWidget
        analysisResults={{
          ai_feedback:
            "Performans trendini yukarıdaki grafikten inceleyebilirsin.",
        }}
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex items-center gap-5 shadow-xl transition-all hover:border-indigo-500/20">
    <div className={`p-4 ${bg} ${color} rounded-2xl shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
        {title}
      </p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
    </div>
  </div>
);

export default AnalysisHistory;
