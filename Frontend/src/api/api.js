import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8002/api",
});

// 🔥 Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});