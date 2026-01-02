import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// --- TOKEN EKLEYİCİ (INTERCEPTOR) ---
api.interceptors.request.use(
  (config) => {
    // Token'ı "token" anahtarından al
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- AUTH İŞLEMLERİ ---

// İsim düzeltildi: registerUser -> register
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// İsim ve Parametre düzeltildi: loginUser -> login
export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await api.post("/auth/login", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // Token ve Kullanıcıyı Kaydet
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
    // User bilgisini kaydet (response yapısına göre)
    const userToSave = response.data.user || response.data;
    localStorage.setItem("user", JSON.stringify(userToSave));
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const changePassword = async (passwordData) => {
  const response = await api.post("/auth/change-password", passwordData);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/auth/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Avatar güncellenince LocalStorage'daki user bilgisini de güncelle
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    user.avatar = response.data.avatar;
    localStorage.setItem("user", JSON.stringify(user));
  }
  return response.data;
};

// --- PROFİL GÜNCELLEME ---

export const updateProfile = async (userData) => {
  const response = await api.put("/auth/update-profile", userData);

  // LocalStorage güncelleme
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const localUser = JSON.parse(userStr);
    // Gelen yeni verilerle mevcut veriyi birleştir
    const updatedUser = { ...localUser, ...response.data };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
  return response.data;
};

// Hesabı Sil
export const deleteAccount = async () => {
  const response = await api.delete("/auth/delete-account");
  return response.data;
};

// --- ANALİZ VE CHAT ---

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // Endpoint adını senin koduna göre korudum
  const response = await api.post("/analysis/analyze_video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAnalysisHistory = async (username) => {
  if (!username) throw new Error("Kullanıcı adı bulunamadı");
  const response = await api.get(`/dashboard/history/${username}`);
  return response.data;
};

export const deleteAnalysis = async (id) => {
  const response = await api.delete(`/dashboard/delete/${id}`);
  return response.data;
};

export const askAICoach = async (chatData) => {
  const response = await api.post("/chat/ask", chatData);
  return response.data;
};

export default api;
