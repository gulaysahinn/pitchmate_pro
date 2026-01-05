import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiVideo,
  FiActivity,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { logout } from "../services/api";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  /* ================= KULLANICI YÜKLEME (HATASIZ) ================= */
  useEffect(() => {
    const fetchUser = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr || userStr === "undefined" || userStr === "null") {
          setUser(null);
          return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData?.user || userData);
      } catch (e) {
        console.error("Sidebar kullanıcı verisi yüklenemedi:", e);
        setUser(null);
      }
    };

    fetchUser();
    window.addEventListener("storage", (e) => {
      if (e.key === "user") fetchUser();
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  /* ================= AKSİYONLAR ================= */
  const handleConfirmLogout = () => {
    logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", name: "Stüdyo", icon: <FiVideo /> },
    { path: "/projects", name: "Projelerim", icon: <FiFolder /> },
    { path: "/history", name: "Analiz Geçmişi", icon: <FiActivity /> },
    { path: "/ai-coach", name: "AI Coach", icon: <FiMessageSquare /> },
    { path: "/settings", name: "Ayarlar", icon: <FiSettings /> },
  ];

  const username = user?.username || "Misafir";
  const avatarLetter = username ? username.charAt(0).toUpperCase() : "?";

  const getAvatarSrc = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith("http")) return user.avatar;
    return `http://localhost:8000/${user.avatar.replace(/^\/+/, "")}`;
  };

  return (
    <>
      <div
        className={`h-screen bg-[#09090b] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50
        transition-all duration-300 ${collapsed ? "w-23" : "w-64"}`}
      >
        {/* ================= LOGO ALANI ================= */}
        <div
          className={`relative shrink-0 border-b border-white/5 flex flex-col items-center justify-center transition-all duration-300 ${
            collapsed ? "h-32" : "h-48"
          }`}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition z-20"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/10 blur-[50px] rounded-full -z-0" />

          <div className="relative z-10 transition-all duration-500">
            {collapsed ? (
              <img
                src="/favicon.png"
                alt="Icon"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Logo"
                className="w-40 h-auto object-contain"
              />
            )}
          </div>

          {!collapsed && (
            <span className="mt-4 text-[8px] font-black text-indigo-400/50 uppercase tracking-[0.5em]">
              AI Presentation Coach
            </span>
          )}
        </div>

        {/* ================= MENÜ ================= */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
                ${collapsed ? "justify-center px-0" : ""}`}
              >
                <span
                  className={`text-xl ${
                    isActive
                      ? "text-indigo-400"
                      : "text-gray-500 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* ================= PROFİL ALANI ================= */}
        <div className="p-4 border-t border-white/5 bg-[#09090b]">
          <div
            className={`flex items-center p-2.5 rounded-2xl bg-[#121217]/50 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer
            ${collapsed ? "justify-center" : "justify-between"}`}
            onClick={() => navigate("/profile")}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img
                    src={getAvatarSrc()}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              {!collapsed && (
                <div className="overflow-hidden text-left">
                  <h4 className="text-xs font-bold text-white truncate">
                    {username}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                      Çevrimiçi
                    </span>
                  </div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLogoutModalOpen(true);
                }}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <FiLogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODERN ÇIKIŞ MODALI ================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative bg-[#121217] border border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                <FiAlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Çıkış Yap</h3>
              <p className="text-gray-400 text-sm mb-8">
                Resonix oturumunu kapatmak istediğine emin misin?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
