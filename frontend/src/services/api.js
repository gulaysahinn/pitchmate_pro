import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// --- 🟢 TOKEN EKLEYİCİ (INTERCEPTOR) ---
// Her istekten önce çalışır ve güncel token'ı Authorization header'ına ekler
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

// --- 🔑 AUTH (KİMLİK DOĞRULAMA) ---

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await api.post("/auth/token", formData);

  // Token ve kullanıcı verisini sakla
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
    const userData = response.data.user || response.data;
    localStorage.setItem("user", JSON.stringify(userData));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// --- 📂 PROJE YÖNETİMİ ---

export const getProjects = async () => {
  const response = await api.get("/projects/");
  return response.data;
};

export const createProject = async (title, description) => {
  const response = await api.post("/projects/", { title, description });
  return response.data;
};

export const updateProject = async (projectId, title, description) => {
  const response = await api.put(`/projects/${projectId}`, {
    title,
    description,
  });
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

// --- 📊 ANALİZ VE VİDEO İŞLEMLERİ ---

export const uploadVideo = async (file, projectId) => {
  const formData = new FormData();
  formData.append("file", file);
  const url = projectId
    ? `/analysis/upload?project_id=${projectId}`
    : `/analysis/upload`;

  const response = await api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAnalysisHistory = async () => {
  const response = await api.get("/analysis/history");
  return response.data;
};

export const deleteAnalysis = async (id) => {
  const response = await api.delete(`/analysis/delete/${id}`);
  return response.data;
};

// --- 👤 PROFİL VE AYARLAR ---

export const updateProfile = async (data) => {
  // Backend'deki @router.put("/me") ve prefix="/auth" ile uyumlu
  const response = await api.put("/auth/me", data);
  return response.data;
};

export const changePassword = async (data) => {
  // Backend'deki @router.put("/password") ve prefix="/auth" ile uyumlu
  const response = await api.put("/auth/password", data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  // Backend'deki @router.post("/avatar") ve prefix="/auth" ile uyumlu
  const response = await api.post("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteAccount = async () => {
  // Backend'deki @router.delete("/me") ve prefix="/auth" ile uyumlu
  const response = await api.delete("/auth/me");
  return response.data;
};

// --- 📩 ŞİFRE SIFIRLAMA ---

export const forgotPassword = async (email) => {
  // ForgotPassword.jsx dosyasının beklediği export
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });
  return response.data;
};

// --- 🤖 CHAT & AI COACH ---

export const sendMessageToAI = async (message, context) => {
  const response = await api.post("/chat/", { message, context });
  return response.data;
};

export default api;
