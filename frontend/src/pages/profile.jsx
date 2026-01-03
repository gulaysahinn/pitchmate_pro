import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../services/api";
import {
  FiUser,
  FiLock,
  FiCamera,
  FiSave,
  FiEdit2,
  FiAlertTriangle,
  FiLoader,
  FiMail,
  FiTrash2,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "",
    created_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const actualUser = userData.user || userData;
        setUser(actualUser);
        setFormData({ email: actualUser.email || "" });
      } catch (error) {
        console.error("Profil yükleme hatası", error);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Yükleniyor...";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const result = await api.uploadAvatar(file);
      const updatedUser = { ...user, avatar: result.avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      toast.success("Profil fotoğrafı güncellendi!");
    } catch (error) {
      toast.error("Yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedData = await api.updateProfile(formData);
      const newUserState = { ...user, email: updatedData.email };
      setUser(newUserState);
      localStorage.setItem("user", JSON.stringify(newUserState));
      setEditMode(false);
      toast.success("Bilgiler güncellendi!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Güncelleme hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      toast.error("Şifreler uyuşmuyor!");
      return;
    }
    try {
      setLoading(true);
      await api.changePassword({
        current_password: passData.current_password,
        new_password: passData.new_password,
      });
      toast.success("Şifre güncellendi.");
      setPassData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Hesabınızı silmek istediğinize emin misiniz?")) {
      try {
        setLoading(true);
        await api.deleteAccount();
        api.logout();
        navigate("/login");
      } catch (error) {
        toast.error("İşlem başarısız.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12 pb-24 font-sans relative">
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-3xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Profil Ayarları
        </h1>
        <p className="text-gray-400 mb-10">
          Kişisel bilgilerinizi ve güvenliğinizi yönetin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* SOL PANEL: AVATAR VE DİNAMİKA BİLGİLER */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 text-center shadow-xl group">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-[#1c1c24] flex items-center justify-center text-4xl font-bold text-indigo-400 border-2 border-indigo-500/20 overflow-hidden relative shadow-inner">
                  {user.avatar ? (
                    <img
                      src={
                        user.avatar.startsWith("http")
                          ? user.avatar
                          : `http://localhost:8000/${user.avatar.replace(
                              /^\/+/,
                              ""
                            )}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling)
                          e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center"
                    style={{ display: user.avatar ? "none" : "flex" }}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-full backdrop-blur-sm">
                  <FiCamera size={24} className="text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={loading}
                  />
                </label>
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                {user.username}
              </h2>
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                Standart Üye
              </span>

              {/* 🟢 DİNAMİK BİLGİ BLOKLARI */}
              <div className="grid grid-cols-1 gap-3 mt-8 pt-8 border-t border-white/5">
                {/* Üyelik Tarihi (Gün/Ay/Yıl) */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCalendar size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Kayıt Tarihi
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-white">
                    {formatDate(user.created_at)}
                  </span>
                </div>

                {/* Durum Bilgisi (Dinamik Hisli) */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Oturum Durumu
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-bold text-emerald-400">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-6 text-center">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <FiTrash2 /> HESABI SİL
              </button>
            </div>
          </div>

          {/* SAĞ PANEL: FORMLAR */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                    <FiMail size={24} />
                  </div>
                  <h3 className="text-xl font-black text-white">İletişim</h3>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-3 rounded-xl transition-all ${
                    editMode
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  <FiEdit2 size={18} />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1 opacity-50">
                      Kullanıcı Adı (Sabit)
                    </label>
                    <div className="w-full bg-[#09090b]/50 border border-white/5 rounded-2xl px-5 py-4 text-gray-500 flex items-center gap-2 cursor-not-allowed">
                      <FiUser /> {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-1">
                      E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[#09090b] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none disabled:opacity-30 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ email: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                {editMode && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? <FiLoader className="animate-spin" /> : "KAYDET"}
                  </button>
                )}
              </form>
            </div>

            <div className="bg-[#121217] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400">
                  <FiLock size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Güvenlik</h3>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <input
                  required
                  type="password"
                  placeholder="Mevcut Şifre"
                  className="w-full bg-[#09090b] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-purple-500 outline-none"
                  value={passData.current_password}
                  onChange={(e) =>
                    setPassData({
                      ...passData,
                      current_password: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    required
                    type="password"
                    placeholder="Yeni Şifre"
                    className="w-full bg-[#09090b] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-purple-500 outline-none"
                    value={passData.new_password}
                    onChange={(e) =>
                      setPassData({ ...passData, new_password: e.target.value })
                    }
                  />
                  <input
                    required
                    type="password"
                    placeholder="Tekrar"
                    className="w-full bg-[#09090b] border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-purple-500 outline-none"
                    value={passData.confirm_password}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase text-xs transition-all shadow-xl"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    "ŞİFREYİ GÜNCELLE"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
