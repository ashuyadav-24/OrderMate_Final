import { verifyToken } from "../config/jwt.js";
import User from "../models/user.models.js";

// 🛡️ Protect middleware — blocks requests with no/invalid token
// Add this before any route that needs the user to be logged in
// Example: router.get("/me", protect, getMe)

const protect = async (req, res, next) => {
  try {
    // 1️⃣ Check Authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided. Please log in." });
    }

    // 2️⃣ Extract token (strip the "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token — throws if expired or tampered
    const decoded = verifyToken(token);

    // 4️⃣ Find the user from DB using id stored inside token
    const user = await User.findById(decoded.id).select("-password"); // never expose password

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // 5️⃣ Attach user to req — all routes after this can use req.user
    req.user = user;
    next();

  } catch (error) {
    // Handles: TokenExpiredError, JsonWebTokenError
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

export default protect;
