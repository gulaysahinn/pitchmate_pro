import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiVideo,
  FiActivity,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiFolder,
} from "react-icons/fi"; // Yeni ikonlar eklendi
import { logout } from "../services/api";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const actualUser = userData.user || userData;
        setUser(actualUser);
      } catch (e) {
        console.error("Sidebar kullanıcı verisi hatası:", e);
      }
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation();
    if (window.confirm("Çıkış yapmak istediğine emin misin?")) {
      logout();
      navigate("/login");
    }
  };

  // 🟢 GELİŞTİRİLMİŞ MENÜ ÖĞELERİ
  const menuItems = [
    { path: "/dashboard", name: "Stüdyo", icon: <FiVideo /> },
    { path: "/projects", name: "Projelerim", icon: <FiFolder /> }, // Proje grupları
    { path: "/history", name: "Analiz Geçmişi", icon: <FiActivity /> }, // Tüm analizler
    { path: "/ai-coach", name: "AI Coach", icon: <FiMessageSquare /> }, // Yapay zeka sohbet
  ];

  const username = user?.username || "Misafir";
  const avatarLetter = username.charAt(0).toUpperCase();

  const getAvatarSrc = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith("http")) return user.avatar;
    return `http://localhost:8000/${user.avatar.replace(/^\/+/, "")}`;
  };

  return (
    <div className="w-64 h-screen bg-[#09090b] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      {/* LOGO */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          P
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          PitchMate
        </span>
      </div>

      {/* MENÜ */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">
          Ana Menü
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-indigo-400"
                    : "text-gray-500 group-hover:text-white"
                }
              >
                {item.icon}
              </span>
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* ALT KISIM: PROFİL & AYARLAR */}
      <div className="p-4 border-t border-white/5 bg-[#0c0c10]">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center justify-between p-3 rounded-xl bg-[#121217] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1a1a20] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 shrink-0 overflow-hidden relative">
              {user?.avatar ? (
                <img
                  src={getAvatarSrc()}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full items-center justify-center bg-[#1c1c24]"
                style={{ display: user?.avatar ? "none" : "flex" }}
              >
                {avatarLetter}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                {username}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-emerald-500/80 font-medium">
                  Çevrimiçi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/profile");
              }}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiSettings size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
