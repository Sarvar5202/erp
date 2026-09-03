import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { stripPassword, stripPasswordList } from "../utils/serialize.js";
import { buildGroupSummary } from "../utils/groupHelpers.js";

const router = Router();

router.use(verifyToken);

// GET /teachers/my/profile  (TEACHER o'zining profilini ko'radi)
router.get("/my/profile", requireRole("TEACHER"), (req, res) => {
  const teacher = db.data.teachers.find((t) => t.id === req.user.id);
  if (!teacher) return notFound(res, "O'qituvchi topilmadi");
  const groupIds = db.data.groupTeachers.filter((gt) => gt.teacher_id === teacher.id).map((gt) => gt.group_id);
  const groups = db.data.groups.filter((g) => groupIds.includes(g.id)).map((g) => ({ id: g.id, name: g.name }));
  return ok(res, { ...stripPassword(teacher), groups });
});

// GET /teachers/my/groups  (TEACHER o'z guruhlarini ko'radi)
router.get("/my/groups", requireRole("TEACHER"), (req, res) => {
  const groupIds = db.data.groupTeachers
    .filter((gt) => gt.teacher_id === req.user.id)
    .map((gt) => gt.group_id);
  const groups = db.data.groups
    .filter((g) => groupIds.includes(g.id))
    .map(buildGroupSummary);
  return ok(res, groups);
});

// GET /teachers  (ADMIN)
router.get("/", requireRole("ADMIN"), (req, res) => {
  const teachers = db.data.teachers.map((t) => {
    const groupIds = db.data.groupTeachers.filter((gt) => gt.teacher_id === t.id).map((gt) => gt.group_id);
    const groups = db.data.groups.filter((g) => groupIds.includes(g.id)).map((g) => ({ id: g.id, name: g.name }));
    return { ...stripPassword(t), groups };
  });
  return ok(res, teachers);
});

// GET /teachers/:id
router.get("/:id", requireRole("ADMIN"), (req, res) => {
  const teacher = db.data.teachers.find((t) => t.id === Number(req.params.id));
  if (!teacher) return notFound(res, "O'qituvchi topilmadi");
  return ok(res, stripPassword(teacher));
});

// POST /teachers  (multipart: full_name, phone, email, address, password, photo, groups[])
router.post("/", requireRole("ADMIN"), upload.single("photo"), async (req, res) => {
  const { full_name, phone, email, address, password, groups } = req.body;

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

  const teacher = {
    id: nextId("teachers"),
    full_name,
    phone,
    email: email || "",
    address: address || "",
    photo: req.file ? req.file.filename : null,
    password: await bcrypt.hash(password, 10),
    role: "TEACHER",
    created_at: new Date().toISOString(),
  };
  db.data.teachers.push(teacher);

  // groups maydoni FormData orqali "1,2,3" yoki ["1","2"] ko'rinishda kelishi mumkin
  let groupIds = [];
  if (Array.isArray(groups)) groupIds = groups.map(Number);
  else if (typeof groups === "string" && groups.length) groupIds = groups.split(",").map(Number);

  groupIds.forEach((gid) => {
    if (db.data.groups.some((g) => g.id === gid)) {
      db.data.groupTeachers.push({ id: nextId("groupTeachers"), group_id: gid, teacher_id: teacher.id });
    }
  });

  await persist();
  return created(res, stripPassword(teacher), "O'qituvchi yaratildi");
});

// PATCH /teachers/:id
router.patch("/:id", requireRole("ADMIN"), upload.single("photo"), async (req, res) => {
  const teacher = db.data.teachers.find((t) => t.id === Number(req.params.id));
  if (!teacher) return notFound(res, "O'qituvchi topilmadi");

  const { full_name, phone, email, address } = req.body;
  if (full_name !== undefined) teacher.full_name = full_name;
  if (phone !== undefined) teacher.phone = phone;
  if (email !== undefined) teacher.email = email;
  if (address !== undefined) teacher.address = address;
  if (req.file) teacher.photo = req.file.filename;

  await persist();
  return ok(res, stripPassword(teacher), "O'qituvchi yangilandi");
});

// DELETE /teachers/:id
router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const idx = db.data.teachers.findIndex((t) => t.id === Number(req.params.id));
  if (idx === -1) return notFound(res, "O'qituvchi topilmadi");

  db.data.teachers.splice(idx, 1);
  db.data.groupTeachers = db.data.groupTeachers.filter((gt) => gt.teacher_id !== Number(req.params.id));
  await persist();
  return ok(res, null, "O'qituvchi o'chirildi");
});

export default router;
