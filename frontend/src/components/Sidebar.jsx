import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiVideo, FiActivity, FiSettings, FiLogOut } from "react-icons/fi";
import { logout } from "../services/api";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // --- KULLANICI BİLGİSİNİ ÇEK ---
  useEffect(() => {
    // LocalStorage'dan "user" anahtarını oku
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Bazen user objesi { access_token: "...", user: {...} } içinde olabilir
        // Bazen de direkt { username: "...", ... } olabilir. İkisini de destekleyelim.
        const actualUser = userData.user || userData;
        setUser(actualUser);
      } catch (e) {
        console.error("Sidebar kullanıcı verisi hatası:", e);
      }
    }
  }, []);

  const handleLogout = (e) => {
    e.stopPropagation();
    if (window.confirm("Çıkış yapmak istediğine emin misin?")) {
      logout(); // api.js içindeki logout'u kullan
      navigate("/login");
    }
  };

  const handleSettingsClick = (e) => {
    e.stopPropagation();
    navigate("/profile"); // Ayarlar sayfası genellikle Profil'dir
  };

  const menuItems = [
    { path: "/dashboard", name: "Stüdyo", icon: <FiVideo /> },
    { path: "/history", name: "Analiz Geçmişi", icon: <FiActivity /> }, // Yolu düzelttim
  ];

  const username = user?.username || "Misafir";
  // Avatar yoksa ismin baş harfini göster
  const avatarLetter = username.charAt(0).toUpperCase();

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
      <nav className="flex-1 py-6 px-4 space-y-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-4">
          Menü
        </div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
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
      <div className="p-4 border-t border-white/5">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center justify-between p-3 rounded-xl bg-[#121217] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1a1a20] transition-all cursor-pointer group"
        >
          {/* Sol Taraf: Avatar ve İsim */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                {username}
              </h4>
              <p className="text-[10px] text-gray-500">Free Plan</p>
            </div>
          </div>

          {/* Sağ Taraf: İkonlar */}
          <div className="flex items-center gap-1">
            {/* Ayarlar İkonu */}
            <button
              onClick={handleSettingsClick}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Ayarlar"
            >
              <FiSettings size={16} />
            </button>

            {/* Çıkış İkonu */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Çıkış Yap"
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
