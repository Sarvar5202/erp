import jwt from "jsonwebtoken";
import { fail } from "../utils/response.js";

export function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return fail(res, "Token topilmadi, avval tizimga kiring", 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, full_name }
    next();
  } catch (err) {
    return fail(res, "Token yaroqsiz yoki muddati tugagan", 401);
  }
}

// Bir nechta role'dan biriga ruxsat berish uchun: requireRole("ADMIN"), requireRole("ADMIN","TEACHER")
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, "Avtorizatsiyadan o'tilmagan", 401);
    if (!roles.includes(req.user.role)) {
      return fail(res, "Sizda bu amalni bajarish uchun ruxsat yo'q", 403);
    }
    next();
  };
}
