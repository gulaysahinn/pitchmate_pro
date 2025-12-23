import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ... diğer login/register fonksiyonların burada kalabilir ...

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getDashboardStats = async (username) => {
  const response = await api.get(`/dashboard/stats/${username}`);
  return response.data;
};

// --- GÜNCELLENEN VİDEO YÜKLEME FONKSİYONU ---
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // 1. LocalStorage'dan kullanıcı bilgisini (Token'ı) çek
  const storedUser = localStorage.getItem("user");
  const token = storedUser ? JSON.parse(storedUser).access_token : null;

  if (!token) {
    throw new Error("Oturum açılmamış! Lütfen tekrar giriş yapın.");
  }

  // 2. İsteğe 'Authorization' başlığını ekle
  const response = await api.post("/analyze/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // 🔑 Anahtar burada!
    },
  });
  return response.data;
};

export default api;
