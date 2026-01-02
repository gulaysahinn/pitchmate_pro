import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// --- TOKEN EKLEYİCİ (INTERCEPTOR) ---
api.interceptors.request.use(
  (config) => {
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

// --- AUTH (KİMLİK DOĞRULAMA) ---

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
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

// --- ŞİFRE SIFIRLAMA İŞLEMLERİ ---

// 1. Adım: E-posta gönder
export const forgotPassword = async (email) => {
  // Backend hazırsa:
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;

  // Backend hazır değilse simülasyon (Üsttekini kapatıp bunu açabilirsin):
  // return new Promise((resolve) => setTimeout(resolve, 1000));
};

// 2. Adım: Yeni şifreyi kaydet (BU EKSİKTİ, ŞİMDİ EKLENDİ) 👇
export const resetPassword = async (token, newPassword) => {
  // Backend hazırsa:
  const response = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;

  // Backend hazır değilse simülasyon:
  // return new Promise((resolve) => setTimeout(resolve, 1000));
};

// --- PROFİL ---

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/auth/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    user.avatar = response.data.avatar;
    localStorage.setItem("user", JSON.stringify(user));
  }
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put("/auth/update-profile", userData);
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const localUser = JSON.parse(userStr);
    const updatedUser = { ...localUser, ...response.data };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/auth/delete-account");
  return response.data;
};

// --- ANALİZ VE DASHBOARD ---

export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
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
