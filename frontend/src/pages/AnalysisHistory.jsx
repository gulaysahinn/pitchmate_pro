import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalysisHistory, logout } from "../services/api";
import { toast } from "react-toastify";
import AICoachWidget from "../components/AICoachWidget"; // 1. AI Koç Eklendi
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiVideo,
  FiCalendar,
  FiMic,
  FiChevronRight,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiTrash2,
  FiFilter,
} from "react-icons/fi";

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // --- AnalysisHistory.jsx içindeki useEffect ---
  useEffect(() => {
    // Eğer kullanıcı yoksa "/login" sayfasına at (Eskiden /auth/login idi)
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const username = user.username || user.user?.username;
        if (!username) return;

        const data = await getAnalysisHistory(username);
        setHistory(data);
      } catch (error) {
        console.error("Geçmiş hatası:", error);
        // Token süresi dolduysa
        if (error.response && error.response.status === 401) {
          logout();
          navigate("/login"); // Burayı da düzelt
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate, user]);

  // --- İstatistikleri Hesapla ---
  const stats = useMemo(() => {
    if (history.length === 0) return { total: 0, best: 0, average: 0 };
    const total = history.length;
    const best = Math.max(...history.map((h) => Number(h.overall_score) || 0));
    const sum = history.reduce(
      (acc, curr) => acc + (Number(curr.overall_score) || 0),
      0
    );
    const average = (sum / total).toFixed(1);
    return { total, best, average };
  }, [history]);

  // --- AI Koç İçin Genel Veri Hazırla ---
  const generalStatsForAI = useMemo(() => {
    return {
      overall_score: stats.average, // Ortalamayı genel puan gibi gösteriyoruz
      wpm: 0, // Geçmiş sayfasında detay olmadığı için 0
      filler_count: 0,
      filler_breakdown: "Genel Geçmiş Analizi",
      eye_contact_score: 0,
      body_language_score: 0,
      ai_feedback: `Bu kullanıcı toplam ${stats.total} sunum yaptı. En yüksek puanı ${stats.best}, genel ortalaması ise ${stats.average}. Lütfen kullanıcının genel gelişimi hakkında konuş.`,
    };
  }, [stats]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm("Bu analizi kalıcı olarak silmek istediğine emin misin?")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/dashboard/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Analiz silindi.");
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.error("Sunucu hatası oluştu.");
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const score = Number(item.overall_score) || 0;
      if (filter === "all") return true;
      if (filter === "high") return score >= 80;
      if (filter === "medium") return score >= 60 && score < 80;
      if (filter === "low") return score < 60;
      return true;
    });
  }, [history, filter]);

  const getScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 80)
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (s >= 60) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  // --- 2. DÜZELTME: ETİKET RENDER FONKSİYONU ---
  const renderScoreBadge = (score) => {
    const s = Number(score) || 0;

    if (s >= 80) {
      return (
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold tracking-wide">
          MÜKEMMEL
        </span>
      );
    } else if (s >= 60) {
      return (
        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 font-bold tracking-wide">
          İYİ
        </span>
      );
    } else {
      return (
        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold tracking-wide">
          GELİŞTİRİLMELİ
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const chartData = [...history].reverse();

  return (
    <div className="flex flex-col h-full w-full relative bg-[#09090b] text-white selection:bg-indigo-500/30 animate-fade-in">
      {/* ... CSS STYLES AYNI KALSIN ... */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #52525b; }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="px-8 pt-8 pb-4 shrink-0 z-10 bg-[#09090b]/90 backdrop-blur-md">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Analiz Geçmişi
            </h1>
            <p className="text-gray-400 text-sm">Gelişim sürecini takip et.</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all hover:border-indigo-500/30"
          >
            <FiVideo /> Yeni Kayıt
          </button>
        </header>
      </div>

      {/* İÇERİK */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 z-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {!loading && history.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-4">
                <StatCard
                  title="Toplam Analiz"
                  value={stats.total}
                  icon={<FiActivity size={24} />}
                  color="text-indigo-400"
                  bg="bg-indigo-500/10"
                  border="hover:border-indigo-500/20"
                />
                <StatCard
                  title="En Yüksek Skor"
                  value={stats.best}
                  icon={<FiAward size={24} />}
                  color="text-emerald-400"
                  bg="bg-emerald-500/10"
                  border="hover:border-emerald-500/20"
                />
                <StatCard
                  title="Ortalama Puan"
                  value={stats.average}
                  icon={<FiTrendingUp size={24} />}
                  color="text-purple-400"
                  bg="bg-purple-500/10"
                  border="hover:border-purple-500/20"
                />
              </div>

              <div className="bg-[#121217] border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiTrendingUp className="text-indigo-400" /> Performans
                    Grafiği
                  </h3>
                </div>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                        stroke="#ffffff10"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="created_at"
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })
                        }
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "#27272a",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="overall_score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Filtreleme */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
            {["all", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  filter === f
                    ? f === "all"
                      ? "bg-white text-black border-white"
                      : f === "high"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
                      : f === "medium"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
                      : "bg-red-500/10 text-red-400 border-red-500/50"
                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
                }`}
              >
                {f === "all"
                  ? "Tümü"
                  : f === "high"
                  ? "Mükemmel (80+)"
                  : f === "medium"
                  ? "İyi (60-79)"
                  : "Geliştirilmeli (0-59)"}
              </button>
            ))}
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm animate-pulse">
                Analizler yükleniyor...
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20 bg-[#121217] border border-white/5 rounded-3xl border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFilter size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-300">
                {filter === "all"
                  ? "Henüz Analiz Yok"
                  : "Bu filtrede kayıt bulunamadı"}
              </h3>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    navigate("/analysis/result", {
                      state: { analysis_results: item },
                    })
                  }
                  className="group bg-[#121217] hover:bg-[#18181f] border border-white/5 hover:border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between transition-all cursor-pointer relative overflow-hidden shadow-lg"
                >
                  <div className="flex items-center gap-5 z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border ${getScoreColor(
                        item.overall_score
                      )}`}
                    >
                      {item.overall_score || 0}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-lg">
                          Sunum #{item.id}
                        </h3>

                        {/* 3. DÜZELTME: ETİKETLER ARTIK BURADA ÇAĞRILIYOR */}
                        {renderScoreBadge(item.overall_score)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={14} /> {formatDate(item.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiMic size={14} />{" "}
                          {`${Math.round(Number(item.wpm) || 0)} kelime/dk`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 z-20">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                      title="Sil"
                    >
                      <FiTrash2 size={20} />
                    </button>
                    <div className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <FiChevronRight size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. AI KOÇ EKLENDİ (GENEL İSTATİSTİKLERLE) */}
      <AICoachWidget analysisResults={generalStatsForAI} />
    </div>
  );
};

const StatCard = ({ title, value, icon, color, bg, border }) => (
  <div
    className={`bg-[#121217] border border-white/5 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group ${border} transition-all`}
  >
    <div className={`p-3 ${bg} ${color} rounded-xl`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-bold uppercase">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

export default AnalysisHistory;
