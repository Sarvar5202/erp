import { Router } from "express";
import { db } from "../db/index.js";
import { ok } from "../utils/response.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

// GET /dashboard/stats  (ADMIN bosh sahifasi uchun umumiy statistika)
router.get("/stats", requireRole("ADMIN"), (req, res) => {
  const activeStudentsCount = db.data.students.length;
  const groupsCount = db.data.groups.length;
  const activeGroupsCount = db.data.groups.filter((g) => g.status === "active").length;
  const plannedGroupsCount = db.data.groups.filter((g) => g.status === "planned").length;
  const teachersCount = db.data.teachers.length;
  const coursesCount = db.data.courses.length;

  return ok(res, {
    activeStudents: activeStudentsCount,
    groups: groupsCount,
    activeGroups: activeGroupsCount,
    plannedGroups: plannedGroupsCount,
    teachers: teachersCount,
    courses: coursesCount,
    // To'lovlar/moliya moduli hali loyihada yo'q, shu sabab 0 qaytariladi
    monthlyPayments: 0,
    debtors: 0,
    frozen: 0,
    archived: 0,
  });
});

export default router;
