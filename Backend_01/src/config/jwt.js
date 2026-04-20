import jwt from "jsonwebtoken";

// ✅ Generate a JWT token
// We only store userId inside — keep tokens small and safe
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },          // payload — stored inside the token
    process.env.JWT_SECRET,  // secret from your .env
    { expiresIn: "7d" }      // token expires in 7 days
  );
};

// ✅ Verify a token — throws an error if invalid or expired
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
