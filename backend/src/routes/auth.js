import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { ok, fail } from "../utils/response.js";

const router = Router();

function findUserByPhone(phone) {
  const admin = db.data.admins.find((a) => a.phone === phone);
  if (admin) return { user: admin, role: "ADMIN" };

  const teacher = db.data.teachers.find((t) => t.phone === phone);
  if (teacher) return { user: teacher, role: "TEACHER" };

  const student = db.data.students.find((s) => s.phone === phone);
  if (student) return { user: student, role: "STUDENT" };

  return null;
}

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return fail(res, "Login (telefon) va parolni kiriting", 400);
  }

  const found = findUserByPhone(phone.trim());
  if (!found) {
    return fail(res, "Login yoki parol noto'g'ri", 401);
  }

  const { user, role } = found;
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return fail(res, "Login yoki parol noto'g'ri", 401);
  }

  const accessToken = jwt.sign(
    { id: user.id, role, full_name: user.full_name, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.status(200).json({
    success: true,
    accessToken,
    role,
    message: "Muvaffaqiyatli kirdingiz",
    user: { id: user.id, full_name: user.full_name, phone: user.phone, photo: user.photo || null },
  });
});

import { verifyToken } from "../middleware/auth.js";
import { stripPassword } from "../utils/serialize.js";

router.get("/me", verifyToken, (req, res) => {
  let user = null;
  if (req.user.role === "ADMIN") {
    user = db.data.admins.find((a) => a.id === req.user.id);
  } else if (req.user.role === "TEACHER") {
    user = db.data.teachers.find((t) => t.id === req.user.id);
  } else if (req.user.role === "STUDENT") {
    user = db.data.students.find((s) => s.id === req.user.id);
  }

  if (!user) return fail(res, "Foydalanuvchi topilmadi", 404);
  return ok(res, { ...stripPassword(user), role: req.user.role });
});

export default router;
