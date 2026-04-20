import axios from "axios";

export const API = axios.create({
  baseURL: "https://ordermate-final-3.onrender.com/api",
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});