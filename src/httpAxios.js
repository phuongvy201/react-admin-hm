import axios from "axios";

const httpAxios = axios.create({
  baseURL: "http://localhost/hmfulfill/public/api/",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

// Thêm interceptor để tự động gửi token trong header
httpAxios.interceptors.request.use(
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

export default httpAxios;
