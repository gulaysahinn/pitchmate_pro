import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiUser,
  FiLock,
  FiCamera,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";
import { changePassword, uploadAvatar } from "../services/api"; // Servisleri import et

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar_url: null,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Sayfa açılınca verileri yükle
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUser(parsed.user || parsed);
    }
  }, []);

  // --- AVATAR YÜKLEME ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Boyut Kontrolü (Örn: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Dosya boyutu 5MB'dan küçük olmalı.");
      return;
    }

    const loadingToast = toast.loading("Fotoğraf yükleniyor...");

    try {
      const response = await uploadAvatar(file);

      // 1. State'i güncelle (Anlık değişim için)
      const updatedUser = { ...user, avatar_url: response.avatar_url };
      setUser(updatedUser);

      // 2. LocalStorage'ı güncelle (Sayfa yenilenince gitmesin)
      const storedData = JSON.parse(localStorage.getItem("user"));
      if (storedData) {
        if (storedData.user) storedData.user.avatar_url = response.avatar_url;
        else storedData.avatar_url = response.avatar_url; // Yapıya göre değişebilir
        localStorage.setItem("user", JSON.stringify(storedData));
      }

      toast.update(loadingToast, {
        render: "Profil fotoğrafı güncellendi! 📸",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error(error);
      toast.update(loadingToast, {
        render: "Yükleme başarısız.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // --- ŞİFRE DEĞİŞTİRME ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Yeni şifreler birbiriyle eşleşmiyor!");
      return;
    }
    if (passwords.new.length < 6) {
      toast.warning("Şifre en az 6 karakter olmalı.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(passwords.current, passwords.new);
      toast.success("Şifreniz başarıyla değiştirildi! 🔒");
      setPasswords({ current: "", new: "", confirm: "" }); // Formu temizle
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Şifre değiştirilemedi.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Ayarlar</h1>
        <p className="text-gray-400">
          Profilini ve tercihlerini buradan yönetebilirsin.
        </p>
      </header>

      {/* Sekmeler */}
      <div className="flex gap-6 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiUser /> Profil Bilgileri
          </div>
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "security"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiLock /> Güvenlik
          </div>
        </button>
      </div>

      {/* İçerik */}
      <div className="bg-[#121217] border border-white/5 rounded-2xl p-8 shadow-xl">
        {/* PROFİL SEKMESİ */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            {/* Avatar Alanı */}
            <div className="flex items-center gap-6 pb-8 border-b border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-indigo-500 transition-colors bg-[#1a1a20] flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-500">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg">
                  <FiCamera className="text-white" size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  Profil Fotoğrafı
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG veya GIF (Max. 5MB)
                </p>
              </div>
            </div>

            {/* Bilgi Formu (Sadece Görsel) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Kullanıcı Adı
                </label>
                <div className="flex items-center gap-2 bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed">
                  <FiAlertCircle />
                  <span>{user.username}</span>
                </div>
                <p className="text-[10px] text-gray-600 mt-1 ml-1">
                  Kullanıcı adı değiştirilemez.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  E-Posta
                </label>
                <input
                  type="email"
                  value={user.email || "ornek@email.com"}
                  readOnly
                  className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* GÜVENLİK SEKMESİ */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Mevcut Şifre
              </label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                required
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                required
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <FiSave /> Şifreyi Güncelle
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
