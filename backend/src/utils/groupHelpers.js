import { db } from "../db/index.js";
import { stripPassword } from "./serialize.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAME_TO_JS_INDEX = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

export function getGroupTeachers(groupId) {
  const links = db.data.groupTeachers.filter((gt) => gt.group_id === groupId);
  return links
    .map((l) => db.data.teachers.find((t) => t.id === l.teacher_id))
    .filter(Boolean)
    .map(stripPassword);
}

export function getGroupStudents(groupId) {
  const links = db.data.groupStudents.filter((gs) => gs.group_id === groupId);
  return links
    .map((l) => db.data.students.find((s) => s.id === l.student_id))
    .filter(Boolean)
    .map(stripPassword);
}

export function buildGroupSummary(group) {
  const course = db.data.courses.find((c) => c.id === group.course_id) || null;
  const room = db.data.rooms.find((r) => r.id === group.room_id) || null;
  const teachers = getGroupTeachers(group.id);
  const students = getGroupStudents(group.id);

  return {
    ...group,
    course,
    room,
    teachers,
    students,
    // Frontend GroupPage.jsx ba'zi joylarda Prisma-uslubidagi nested shaklni kutadi:
    // group.groupTeachers[].teacher.full_name
    groupTeachers: teachers.map((t) => ({ teacher: t })),
    groupStudents: students.map((s) => ({ student: s })),
    teacher_count: teachers.length,
    student_count: students.length,
  };
}

export function buildGroupDetail(group) {
  const summary = buildGroupSummary(group);
  const ages = summary.students
    .map((s) => s.birth_date && new Date().getFullYear() - new Date(s.birth_date).getFullYear())
    .filter((a) => typeof a === "number" && !Number.isNaN(a));
  const averageAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  return {
    ...summary,
    room_capacity: summary.room?.capacity || 0,
    averageAge,
  };
}

// week_day/start_date/duration_month asosida oylik jadval generatsiya qiladi.
// Natija: { "1": { isActive, days: [{day, month, isCompleted}] }, "2": {...}, ... }
export function homeworkStats(homework) {
  const answers = db.data.homeworkAnswers.filter((a) => a.homework_id === homework.id);
  const groupStudentCount = db.data.groupStudents.filter((gs) => gs.group_id === homework.group_id).length;
  return {
    homeworkPending: answers.filter((a) => a.status === "PENDING").length,
    homeworkReject: answers.filter((a) => a.status === "REJECTED").length,
    homeworkAccept: answers.filter((a) => a.status === "ACCEPTED").length,
    existStudentsIngroup: groupStudentCount,
  };
}

export function generateSchedule(group) {
  const durationMonth = db.data.courses.find((c) => c.id === group.course_id)?.duration_month || 3;
  const weekDays = (group.week_day || []).map((d) => DAY_NAME_TO_JS_INDEX[d]).filter((d) => d !== undefined);

  if (!group.start_date || weekDays.length === 0) {
    return {};
  }

  const start = new Date(group.start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lessonDates = [];
  const cursor = new Date(start);
  const hardStop = new Date(start);
  hardStop.setMonth(hardStop.getMonth() + durationMonth);

  while (cursor < hardStop) {
    if (weekDays.includes(cursor.getDay())) {
      lessonDates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const schedule = {};
  lessonDates.forEach((date) => {
    // start_date'dan boshlab nechinchi oy ekanini hisoblash (1-based)
    const monthDiff =
      (date.getFullYear() - start.getFullYear()) * 12 + (date.getMonth() - start.getMonth()) + 1;
    const key = String(monthDiff);
    if (!schedule[key]) {
      schedule[key] = { isActive: false, days: [] };
    }
    const dateStr = date.toISOString().slice(0, 10);
    const lesson = db.data.lessons.find((l) => l.group_id === group.id && l.date === dateStr);
    schedule[key].days.push({
      day: date.getDate(),
      month: MONTH_NAMES[date.getMonth()],
      isCompleted: Boolean(lesson),
    });
    if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth()) {
      schedule[key].isActive = true;
    }
  });

  return schedule;
}
