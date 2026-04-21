import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/connection/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import requestRoutes from "./src/routes/request.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import socketHandler from "./src/socket/socketHandler.js";

dotenv.config();

const app = express();

// ✅ Wrap express with http — socket.io needs this
const httpServer = createServer(app);

// ✅ Create socket.io instance
// ✅ Allow all Vercel preview URLs + production URL
const allowedOrigins = [
  "https://order-mate-final.vercel.app",
  /https:\/\/order-mate-final.*\.vercel\.app/,  // covers preview deployments
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// ✅ Global so controllers can emit events directly
global.io = io;

// ✅ Register all socket events
socketHandler(io);

// ── Middlewares ───────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain for this project + localhost
    if (
      origin.includes("order-mate-final") ||
      origin.includes("localhost")
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// ── Database ──────────────────────────────────
connectDB();

// ── REST Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/chat", chatRoutes);

// ── Test ──────────────────────────────────────
app.get("/", (req, res) => res.send("Server HomePage"));

// ✅ Use httpServer.listen — NOT app.listen
const PORT = process.env.PORT || 8002;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at port: ${PORT}`);
});
