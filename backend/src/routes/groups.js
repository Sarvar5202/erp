import { Router } from "express";
import { db, nextId, persist } from "../db/index.js";
import { ok, created, notFound, fail } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import {
  buildGroupSummary,
  buildGroupDetail,
  generateSchedule,
} from "../utils/groupHelpers.js";

const router = Router();

router.use(verifyToken);

// GET /groups/all  (ADMIN uchun barcha guruhlar ro'yxati)
router.get("/all", requireRole("ADMIN"), (req, res) => {
  const groups = db.data.groups.map(buildGroupSummary);
  return ok(res, groups);
});

// GET /groups  (ba'zi joylarda alias sifatida ishlatiladi)
router.get("/", requireRole("ADMIN"), (req, res) => {
  const groups = db.data.groups.map(buildGroupSummary);
  return ok(res, groups);
});

// POST /groups  (guruh yaratish)
router.post("/", requireRole("ADMIN"), async (req, res) => {
  const {
    name, description, course_id, room_id,
    start_date, week_day, start_time, max_student,
    teachers, students,
  } = req.body;

  if (!name || !course_id || !room_id) {
    return fail(res, "Guruh nomi, kursi va xonasi kiritilishi shart");
  }

  const group = {
    id: nextId("groups"),
    name,
    description: description || "",
    course_id: Number(course_id),
    room_id: Number(room_id),
    start_date: start_date || null,
    week_day: Array.isArray(week_day) ? week_day : [],
    start_time: start_time || "09:00",
    max_student: Number(max_student) || 20,
    status: "planned",
    created_at: new Date().toISOString(),
  };
  db.data.groups.push(group);

  (Array.isArray(teachers) ? teachers : []).forEach((teacherId) => {
    db.data.groupTeachers.push({ id: nextId("groupTeachers"), group_id: group.id, teacher_id: Number(teacherId) });
  });
  (Array.isArray(students) ? students : []).forEach((studentId) => {
    db.data.groupStudents.push({ id: nextId("groupStudents"), group_id: group.id, student_id: Number(studentId) });
  });

  if (db.data.groupTeachers.some((gt) => gt.group_id === group.id)) {
    group.status = "active";
  }

  await persist();
  return created(res, buildGroupSummary(group), "Guruh yaratildi");
});

// GET /groups/:id/schedules
router.get("/:id/schedules", (req, res) => {
  const group = db.data.groups.find((g) => g.id === Number(req.params.id));
  if (!group) return notFound(res, "Guruh topilmadi");
  const schedule = generateSchedule(group);
  // Frontend `res?.data?.[0]` deb massivning 0-elementini oladi
  return res.status(200).json([schedule]);
});

// GET /groups/:id/lesson?date=YYYY-MM-DD  (bitta kunlik dars + davomat)
router.get("/:id/lesson", (req, res) => {
  const group = db.data.groups.find((g) => g.id === Number(req.params.id));
  if (!group) return notFound(res, "Guruh topilmadi");

  const date = req.query.date;
  const lesson = db.data.lessons.find((l) => l.group_id === group.id && l.date === date) || null;

  const groupStudentIds = db.data.groupStudents
    .filter((gs) => gs.group_id === group.id)
    .map((gs) => gs.student_id);

  const attendance = groupStudentIds.map((studentId) => {
    const student = db.data.students.find((s) => s.id === studentId);
    const att = lesson
      ? db.data.attendances.find((a) => a.lesson_id === lesson.id && a.student_id === studentId)
      : null;
    return {
      student_id: studentId,
      full_name: student?.full_name || "",
      photo: student?.photo || null,
      isPresent: att ? att.isPresent : false,
    };
  });

  return ok(res, { lesson, attendance });
});

// POST /groups/:id/lesson  (dars mavzusi + davomatni saqlash)
router.post("/:id/lesson", requireRole("ADMIN", "TEACHER"), async (req, res) => {
  const group = db.data.groups.find((g) => g.id === Number(req.params.id));
  if (!group) return notFound(res, "Guruh topilmadi");

  const { topic, description, lesson_date, attendances } = req.body;
  if (!topic || !lesson_date) return fail(res, "Mavzu va sana kiritilishi shart");

  let lesson = db.data.lessons.find((l) => l.group_id === group.id && l.date === lesson_date);
  if (!lesson) {
    lesson = {
      id: nextId("lessons"),
      group_id: group.id,
      date: lesson_date,
      topic,
      description: description || "",
      created_at: new Date().toISOString(),
    };
    db.data.lessons.push(lesson);
  } else {
    lesson.topic = topic;
    lesson.description = description || "";
  }

  // Avvalgi davomatni tozalab, qaytadan yozamiz
  db.data.attendances = db.data.attendances.filter((a) => a.lesson_id !== lesson.id);
  const presentIds = new Set((attendances || []).map((a) => Number(a.student_id)));
  const groupStudentIds = db.data.groupStudents
    .filter((gs) => gs.group_id === group.id)
    .map((gs) => gs.student_id);

  groupStudentIds.forEach((studentId) => {
    db.data.attendances.push({
      id: nextId("attendances"),
      lesson_id: lesson.id,
      student_id: studentId,
      isPresent: presentIds.has(studentId),
    });
  });

  await persist();
  return ok(res, lesson, "Dars va davomat saqlandi");
});

// GET /groups/:groupId/lessons  (STUDENT uchun darslar ro'yxati, video sonlari bilan)
router.get("/:groupId/lessons", (req, res) => {
  const groupId = Number(req.params.groupId);
  const lessons = db.data.lessons
    .filter((l) => l.group_id === groupId)
    .map((l) => ({
      ...l,
      videoCount: db.data.videos.filter((v) => v.lesson_id === l.id).length,
    }));
  return ok(res, lessons);
});

// GET /groups/:groupId/lessons/:lessonId/videos
router.get("/:groupId/lessons/:lessonId/videos", (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const videos = db.data.videos.filter((v) => v.lesson_id === lessonId);
  return ok(res, videos);
});

// GET /groups/:id  (guruh detali) — parametrli marshrutlar oxirida bo'lishi kerak
router.get("/:id", (req, res) => {
  const group = db.data.groups.find((g) => g.id === Number(req.params.id));
  if (!group) return notFound(res, "Guruh topilmadi");
  return ok(res, buildGroupDetail(group));
});

export default router;
