import { Router } from "express";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

// GET /rooms
router.get("/", (req, res) => {
  return ok(res, db.data.rooms);
});

// GET /rooms/one/:id
router.get("/one/:id", (req, res) => {
  const room = db.data.rooms.find((r) => r.id === Number(req.params.id));
  if (!room) return notFound(res, "Xona topilmadi");
  return ok(res, room);
});

// POST /rooms
router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { name, capacity } = req.body;
  if (!name || !capacity) return fail(res, "Xona nomi va sig'imi kiritilishi shart");

  const room = {
    id: nextId("rooms"),
    name,
    capacity: Number(capacity),
    created_at: new Date().toISOString(),
  };
  db.data.rooms.push(room);
  await persist();
  return created(res, room, "Xona yaratildi");
});

// PATCH /rooms/:id
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const room = db.data.rooms.find((r) => r.id === Number(req.params.id));
  if (!room) return notFound(res, "Xona topilmadi");

  const { name, capacity } = req.body;
  if (name !== undefined) room.name = name;
  if (capacity !== undefined) room.capacity = Number(capacity);

  await persist();
  return ok(res, room, "Xona yangilandi");
});

// DELETE /rooms/:id
router.delete("/:id", requireRole("ADMIN"), async (req, res) => {
  const idx = db.data.rooms.findIndex((r) => r.id === Number(req.params.id));
  if (idx === -1) return notFound(res, "Xona topilmadi");

  db.data.rooms.splice(idx, 1);
  await persist();
  return ok(res, null, "Xona o'chirildi");
});

export default router;
