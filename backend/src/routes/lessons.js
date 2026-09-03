import { Router } from "express";
import { db } from "../db/index.js";
import { ok } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

// GET /lessons/my/group/:id  (TEACHER homework yaratishda mavzu tanlash uchun)
router.get("/my/group/:id", requireRole("ADMIN", "TEACHER"), (req, res) => {
  const groupId = Number(req.params.id);
  const lessons = db.data.lessons.filter((l) => l.group_id === groupId);
  return ok(res, lessons);
});

export default router;
