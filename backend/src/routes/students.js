import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { stripPassword } from "../utils/serialize.js";
import { buildGroupSummary } from "../utils/groupHelpers.js";

const router = Router();

router.use(verifyToken);

// GET /students/my/groups  (STUDENT o'z guruhlarini ko'radi)
router.get("/my/groups", requireRole("STUDENT"), (req, res) => {
  const groupIds = db.data.groupStudents
    .filter((gs) => gs.student_id === req.user.id)
    .map((gs) => gs.group_id);
  const groups = db.data.groups
    .filter((g) => groupIds.includes(g.id))
    .map(buildGroupSummary);
  return ok(res, groups);
});

// GET /students/my/profile
router.get("/my/profile", requireRole("STUDENT"), (req, res) => {
  const student = db.data.students.find((s) => s.id === req.user.id);
  if (!student) return notFound(res, "O'quvchi topilmadi");
  const groupIds = db.data.groupStudents.filter((gs) => gs.student_id === student.id).map((gs) => gs.group_id);
  const groups = db.data.groups.filter((g) => groupIds.includes(g.id)).map((g) => ({ id: g.id, name: g.name }));
  return ok(res, { ...stripPassword(student), groups });
});

// GET /students  (ADMIN, TEACHER)
router.get("/", requireRole("ADMIN", "TEACHER"), (req, res) => {
  const students = db.data.students.map((s) => {
    const groupIds = db.data.groupStudents.filter((gs) => gs.student_id === s.id).map((gs) => gs.group_id);
    const groups = db.data.groups.filter((g) => groupIds.includes(g.id)).map((g) => ({ id: g.id, name: g.name }));
    return { ...stripPassword(s), groups };
  });
  return ok(res, students);
});

// GET /students/:id
router.get("/:id", requireRole("ADMIN", "TEACHER"), (req, res) => {
  const student = db.data.students.find((s) => s.id === Number(req.params.id));
  if (!student) return notFound(res, "O'quvchi topilmadi");
  return ok(res, stripPassword(student));
});

// POST /students  (multipart: full_name, phone, email, address, birth_date, password, photo, groups[])
router.post("/", requireRole("ADMIN"), upload.single("photo"), async (req, res) => {
  const { full_name, phone, email, address, birth_date, password, groups } = req.body;

  if (!full_name || !phone || !password) {
    return fail(res, "Ism, telefon va parol kiritilishi shart");
  }

  const phoneExists =
    db.data.teachers.some((t) => t.phone === phone) ||
    db.data.students.some((s) => s.phone === phone) ||
    db.data.admins.some((a) => a.phone === phone);
  if (phoneExists) {
    return fail(res, "Bu telefon raqami allaqachon ro'yxatdan o'tgan");
  }

  const student = {
    id: nextId("students"),
    full_name,
    phone,
    email: email || "",
    address: address || "",
    birth_date: birth_date || null,
    photo: req.file ? req.file.filename : null,
    password: await bcrypt.hash(password, 10),
    role: "STUDENT",
    created_at: new Date().toISOString(),
  };
  db.data.students.push(student);

  let groupIds = [];
  if (Array.isArray(groups)) groupIds = groups.map(Number);
  else if (typeof groups === "string" && groups.length) groupIds = groups.split(",").map(Number);

  groupIds.forEach((gid) => {
    if (db.data.groups.some((g) => g.id === gid)) {
      db.data.groupStudents.push({ id: nextId("groupStudents"), group_id: gid, student_id: student.id });
    }
  });

  await persist();
  return created(res, stripPassword(student), "O'quvchi yaratildi");
});

// PATCH /students/:id
router.patch("/:id", requireRole("ADMIN"), upload.single("photo"), async (req, res) => {
  const student = db.data.students.find((s) => s.id === Number(req.params.id));
  if (!student) return notFound(res, "O'quvchi topilmadi");

  const { full_name, phone, email, address, birth_date } = req.body;
  if (full_name !== undefined) student.full_name = full_name;
  if (phone !== undefined) student.phone = phone;
  if (email !== undefined) student.email = email;
  if (address !== undefined) student.address = address;
  if (birth_date !== undefined) student.birth_date = birth_date;
  if (req.file) student.photo = req.file.filename;

  await persist();
  return ok(res, stripPassword(student), "O'quvchi yangilandi");
});

// DELETE /students/:id
router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const idx = db.data.students.findIndex((s) => s.id === Number(req.params.id));
  if (idx === -1) return notFound(res, "O'quvchi topilmadi");

  db.data.students.splice(idx, 1);
  db.data.groupStudents = db.data.groupStudents.filter((gs) => gs.student_id !== Number(req.params.id));
  await persist();
  return ok(res, null, "O'quvchi o'chirildi");
});

export default router;
