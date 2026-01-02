import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  uploadAvatar,
  changePassword,
  logout,
  updateProfile,
  deleteAccount,
} from "../services/api";
import {
  FiUser,
  FiLock,
  FiCamera,
  FiSave,
  FiCheck,
  FiEdit2,
  FiAlertTriangle,
} from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(false);

  // Şifre State'leri
  const [passData, setPassData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Profil Düzenleme State'i
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const actualUser = userData.user || userData;
        setUser(actualUser);
        setFormData({
          username: actualUser.username,
          email: actualUser.email || "",
        });
      } catch (e) {
        console.error("Profil yükleme hatası", e);
      }
    }
  }, []);

  // --- 1. AVATAR YÜKLEME ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      const result = await uploadAvatar(file);
      setUser((prev) => ({ ...prev, avatar: result.avatar }));
      toast.success("Profil fotoğrafı güncellendi!");
    } catch (error) {
      console.error(error);
      toast.error("Fotoğraf yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. BİLGİ GÜNCELLEME (ARTIK GERÇEK!) ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 👇 ARTIK YORUM SATIRI DEĞİL, GERÇEKTEN GÖNDERİYORUZ
      const updatedData = await updateProfile(formData);

      // Backend'den gelen yeni veriyi state'e işle
      setUser((prev) => ({
        ...prev,
        username: updatedData.username,
        email: updatedData.email,
      }));

      setEditMode(false);
      toast.success("Profil bilgileri güncellendi!");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      // Hata mesajını güvenli bir şekilde alıyoruz
      const errorMsg = error.response?.data?.detail || "Güncelleme başarısız.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. ŞİFRE DEĞİŞTİRME ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      toast.error("Yeni şifreler eşleşmiyor!");
      return;
    }
    if (passData.new_password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    try {
      setLoading(true);
      await changePassword({
        current_password: passData.current_password,
        new_password: passData.new_password,
      });
      toast.success("Şifreniz başarıyla değiştirildi.");
      setPassData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Şifre hatası:", error);
      const errorMsg = error.response?.data?.detail || "Şifre değiştirilemedi.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. HESAP SİLME (ARTIK GERÇEK!) ---
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "DİKKAT! Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Emin misiniz?"
      )
    ) {
      try {
        setLoading(true);

        // 👇 ARTIK YORUM SATIRI DEĞİL, SİLME EMRİNİ GÖNDERİYORUZ
        await deleteAccount();

        toast.success("Hesabınız başarıyla silindi.");

        // Token'ı temizle ve login'e at
        logout();
        navigate("/login");
      } catch (error) {
        console.error("Silme hatası:", error);
        const errorMsg = error.response?.data?.detail || "Hesap silinemedi.";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12 animate-fade-in pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Profil Ayarları
        </h1>
        <p className="text-gray-400 mb-8">
          Hesap bilgilerinizi ve tercihlerinizi yönetin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- SOL KOLON: KİMLİK KARTI --- */}
          <div className="md:col-span-1 space-y-6">
            {/* Profil Kartı */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden group">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-indigo-500/20 flex items-center justify-center text-4xl font-bold text-indigo-400 border-2 border-dashed border-indigo-500/30 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
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

              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-500 text-sm">Ücretsiz Plan</p>

              <div className="mt-6 pt-6 border-t border-white/5 text-left text-sm text-gray-400 space-y-2">
                <div className="flex justify-between">
                  <span>Üyelik Tarihi:</span>
                  <span className="text-white">Ocak 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Durum:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <FiCheck size={14} /> Aktif
                  </span>
                </div>
              </div>
            </div>

            {/* Tehlikeli Bölge (Hesap Silme) */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
              <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                <FiAlertTriangle /> Tehlikeli Bölge
              </h3>
              <p className="text-red-400/60 text-xs mb-4">
                Hesabını silersen tüm verilerin kaybolur.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-sm font-bold rounded-xl transition-all border border-red-500/20 disabled:opacity-50"
              >
                {loading ? "Siliniyor..." : "Hesabımı Sil"}
              </button>
            </div>
          </div>

          {/* --- SAĞ KOLON: FORMLAR --- */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Kişisel Bilgiler Formu */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Kişisel Bilgiler
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Kimlik bilgilerini güncelle.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiEdit2 />
                </button>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      E-Posta
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!editMode}
                      placeholder="Henüz eklenmemiş"
                    />
                  </div>
                </div>
                {editMode && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {loading ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* 2. Şifre Değiştirme Formu */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <FiLock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Şifre Değiştir
                  </h3>
                  <p className="text-gray-400 text-sm">Hesabını güvende tut.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                    value={passData.current_password}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="••••••••"
                      value={passData.new_password}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          new_password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="••••••••"
                      value={passData.confirm_password}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          confirm_password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      "Kaydediliyor..."
                    ) : (
                      <>
                        <FiSave /> Şifreyi Güncelle
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
