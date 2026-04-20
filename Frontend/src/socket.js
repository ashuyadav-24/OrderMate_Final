import { io } from "socket.io-client";

const URL = "https://ordermate-final-3.onrender.com";

export const socket = io(URL, {
  auth: (cb) =>
    cb({
      token: localStorage.getItem("token"),
    }),
  autoConnect: true,
});