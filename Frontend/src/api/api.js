import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8002/api",
  withCredentials: true,
  timeout: 10000,
});

// 🔥 Automatically attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});