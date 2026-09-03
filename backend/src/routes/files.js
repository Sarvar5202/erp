import { Router } from "express";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(verifyToken);

// POST /files/group/:groupId/upload?lessonId=  (video yuklash, multipart field: "file")
router.post(
  "/group/:groupId/upload",
  requireRole("ADMIN", "TEACHER"),
  upload.single("file"),
  async (req, res) => {
    const groupId = Number(req.params.groupId);
    const lessonId = Number(req.query.lessonId);

    if (!req.file) return fail(res, "Fayl yuklanmadi");

    const video = {
      id: nextId("videos"),
      group_id: groupId,
      lesson_id: lessonId || null,
      video_url: req.file.filename,
      originalname: req.file.originalname,
      size_mb: Number((req.file.size / (1024 * 1024)).toFixed(2)),
      created_at: new Date().toISOString(),
    };
    db.data.videos.push(video);
    await persist();
    return created(res, video, "Video yuklandi");
  }
);

// GET /files/:id   (id = GURUH ID — GroupCoursework.jsx shu guruhning barcha videolarini so'raydi)
router.get("/:id", (req, res) => {
  const groupId = Number(req.params.id);
  const videos = db.data.videos
    .filter((v) => v.group_id === groupId)
    .map((v) => {
      const lesson = db.data.lessons.find((l) => l.id === v.lesson_id) || null;
      return { ...v, lesson };
    });
  return ok(res, videos);
});

// DELETE /files/:videoId
router.delete("/:videoId", requireRole("ADMIN", "TEACHER"), async (req, res) => {
  const videoId = Number(req.params.videoId);
  const idx = db.data.videos.findIndex((v) => v.id === videoId);
  if (idx === -1) return notFound(res, "Video topilmadi");

  db.data.videos.splice(idx, 1);
  await persist();
  return ok(res, null, "Video o'chirildi");
});

export default router;
