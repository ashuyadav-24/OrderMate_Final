import { io } from "socket.io-client";

const URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:8002";

export const socket = io(URL, {
  auth: (cb) =>
    cb({
      token: localStorage.getItem("token"),
    }),
  autoConnect: true,
});