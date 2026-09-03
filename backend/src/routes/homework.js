import { Router } from "express";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { homeworkStats } from "../utils/groupHelpers.js";

const router = Router();

router.use(verifyToken);

// POST /homework  (multipart: lesson_id, group_id, title, file)
router.post("/", requireRole("ADMIN", "TEACHER"), upload.single("file"), async (req, res) => {
  const { lesson_id, group_id, title } = req.body;
  if (!lesson_id || !group_id || !title) {
    return fail(res, "Mavzu, guruh va izoh (title) kiritilishi shart");
  }

  const homework = {
    id: nextId("homeworks"),
    lesson_id: Number(lesson_id),
    group_id: Number(group_id),
    title,
    file: req.file ? req.file.filename : null,
    created_at: new Date().toISOString(),
  };
  db.data.homeworks.push(homework);
  await persist();
  return created(res, homework, "Uyga vazifa e'lon qilindi");
});

// GET /homework/:id   (id = GURUH ID — shu guruhning barcha uyga vazifalari, statistika bilan)
router.get("/:id", (req, res) => {
  const groupId = Number(req.params.id);
  const homeworks = db.data.homeworks.filter((h) => h.group_id === groupId);

  const data = homeworks.map((hw) => {
    const lesson = db.data.lessons.find((l) => l.id === hw.lesson_id);
    const myAnswer = req.user?.role === "STUDENT"
      ? db.data.homeworkAnswers.find((a) => Number(a.homework_id) === Number(hw.id) && Number(a.student_id) === Number(req.user.id)) || null
      : null;

    return {
      id: hw.id,
      topic: lesson?.topic || hw.title,
      title: hw.title,
      file: hw.file || null,
      created_at: hw.created_at,
      homework: [hw], // frontend: homeworkInfo.homework[0].id / created_at
      myAnswer,
      ...homeworkStats(hw),
    };
  });

  return ok(res, data);
});

// POST /homework/:homeworkId/submit  (STUDENT — vazifani topshirish, multipart: file, text)
router.post("/:homeworkId/submit", requireRole("STUDENT"), upload.single("file"), async (req, res) => {
  const homeworkId = Number(req.params.homeworkId);
  const homework = db.data.homeworks.find((h) => h.id === homeworkId);
  if (!homework) return notFound(res, "Uyga vazifa topilmadi");

  let answer = db.data.homeworkAnswers.find(
    (a) => a.homework_id === homeworkId && a.student_id === req.user.id
  );

  if (answer) {
    answer.file = req.file ? req.file.filename : answer.file;
    answer.text = req.body.text ?? answer.text;
    answer.status = "PENDING";
    answer.submitted_at = new Date().toISOString();
  } else {
    answer = {
      id: nextId("homeworkAnswers"),
      homework_id: homeworkId,
      student_id: req.user.id,
      file: req.file ? req.file.filename : null,
      text: req.body.text || "",
      status: "PENDING",
      grade: null,
      feedback: null,
      submitted_at: new Date().toISOString(),
    };
    db.data.homeworkAnswers.push(answer);
  }

  await persist();
  return ok(res, answer, "Uyga vazifa topshirildi");
});

export default router;
