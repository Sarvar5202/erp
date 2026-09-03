import { Router } from "express";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

// GET /courses
router.get("/", (req, res) => {
  return ok(res, db.data.courses);
});

// GET /courses/:id
router.get("/:id", (req, res) => {
  const course = db.data.courses.find((c) => c.id === Number(req.params.id));
  if (!course) return notFound(res, "Kurs topilmadi");
  return ok(res, course);
});

// POST /courses
router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { name, description, price, duration_hours, duration_month } = req.body;
  if (!name) return fail(res, "Kurs nomi kiritilishi shart");

  const course = {
    id: nextId("courses"),
    name,
    description: description || "",
    price: Number(price) || 0,
    duration_hours: Number(duration_hours) || 0,
    duration_month: Number(duration_month) || 0,
    created_at: new Date().toISOString(),
  };
  db.data.courses.push(course);
  await persist();
  return created(res, course, "Kurs yaratildi");
});

// PATCH /courses/:id
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const course = db.data.courses.find((c) => c.id === Number(req.params.id));
  if (!course) return notFound(res, "Kurs topilmadi");

  Object.assign(course, req.body);
  await persist();
  return ok(res, course, "Kurs yangilandi");
});

// DELETE /courses/:id
router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const idx = db.data.courses.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return notFound(res, "Kurs topilmadi");

  db.data.courses.splice(idx, 1);
  await persist();
  return ok(res, null, "Kurs o'chirildi");
});

export default router;
