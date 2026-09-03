import { Router } from "express";
import { db, persist } from "../db/index.js";
import { ok, notFound } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

// DIQQAT: HomeworkResults.jsx va HomeworkCheck.jsx frontendda ATAYLAB "/group/:id/..."
// (BIRLIK shaklda, "/groups/..." emas) manzilini chaqiradi. Shu sababli bu router
// server.js'da "/group" prefiksi bilan (ko'plik "/groups" emas) mount qilinadi.

const router = Router();

router.use(verifyToken);

// GET /group/:id/homework/:homeworkId/results?status=PENDING|REJECTED|ACCEPTED
// status bo'lmasa -> "Bajarilmagan" (hali topshirmagan o'quvchilar)
router.get("/:id/homework/:homeworkId/results", requireRole("ADMIN", "TEACHER"), (req, res) => {
  const groupId = Number(req.params.id);
  const homeworkId = Number(req.params.homeworkId);
  const status = req.query.status;

  const groupStudentIds = db.data.groupStudents
    .filter((gs) => gs.group_id === groupId)
    .map((gs) => gs.student_id);

  const answers = db.data.homeworkAnswers.filter((a) => a.homework_id === homeworkId);

  if (status) {
    const filtered = answers
      .filter((a) => a.status === status)
      .map((a) => {
        const student = db.data.students.find((s) => s.id === a.student_id);
        return {
          id: student?.id,
          full_name: student?.full_name,
          photo: student?.photo || null,
          created_at: a.submitted_at,
          answer_id: a.id,
        };
      });
    return ok(res, { students: filtered });
  }

  const answeredIds = new Set(answers.map((a) => a.student_id));
  const notDone = groupStudentIds
    .filter((sid) => !answeredIds.has(sid))
    .map((sid) => {
      const student = db.data.students.find((s) => s.id === sid);
      return { id: student?.id, full_name: student?.full_name, photo: student?.photo || null };
    });

  return ok(res, notDone);
});

// GET /group/:id/homework/:homeworkId/result/:studentId  (bitta o'quvchi javobi)
router.get("/:id/homework/:homeworkId/result/:studentId", requireRole("ADMIN", "TEACHER"), (req, res) => {
  const homeworkId = Number(req.params.homeworkId);
  const studentId = Number(req.params.studentId);

  const answer = db.data.homeworkAnswers.find(
    (a) => a.homework_id === homeworkId && a.student_id === studentId
  );
  if (!answer) return notFound(res, "O'quvchi javobi topilmadi");

  const student = db.data.students.find((s) => s.id === studentId);
  const homework = db.data.homeworks.find((h) => h.id === homeworkId);
  return ok(res, {
    ...answer,
    homework_title: homework?.title || "",
    student: { id: student?.id, full_name: student?.full_name, photo: student?.photo },
    students: { id: student?.id, full_name: student?.full_name, photo: student?.photo },
  });
});

// POST /group/:id/homework/:homeworkId/check  { grade, title (feedback), homework_answer_id }
router.post("/:id/homework/:homeworkId/check", requireRole("ADMIN", "TEACHER"), async (req, res) => {
  const { grade, title, homework_answer_id } = req.body;

  const answer = db.data.homeworkAnswers.find((a) => a.id === Number(homework_answer_id));
  if (!answer) return notFound(res, "O'quvchi javobi topilmadi");

  answer.grade = Number(grade);
  answer.feedback = title || "";
  answer.status = Number(grade) >= 60 ? "ACCEPTED" : "REJECTED";

  await persist();
  return ok(res, answer, "Baholandi");
});

export default router;
