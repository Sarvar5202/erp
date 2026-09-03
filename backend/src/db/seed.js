import bcrypt from "bcryptjs";
import { initDb, db, nextId, persist } from "./index.js";

async function seed() {
  await initDb();

  const alreadySeeded = db.data.admins.length > 0;
  if (alreadySeeded) {
    console.log("Baza allaqachon to'ldirilgan. Qayta seed qilish uchun database.json faylini o'chiring.");
    process.exit(0);
  }

  const hash = (p) => bcrypt.hashSync(p, 10);

  // ---- SUPER ADMIN ----
  db.data.admins.push({
    id: nextId("admins"),
    full_name: "Abduxoshim Sultonqulov",
    phone: "+998901234567",
    password: hash("admin123"),
    role: "ADMIN",
    created_at: new Date().toISOString(),
  });

  // ---- ROOMS ----
  const rooms = [
    { name: "101-xona", capacity: 15 },
    { name: "202-xona", capacity: 20 },
    { name: "Frontend Lab", capacity: 12 },
  ].map((r) => ({ id: nextId("rooms"), ...r, created_at: new Date().toISOString() }));
  db.data.rooms.push(...rooms);

  // ---- COURSES ----
  const courses = [
    { name: "Frontend (React)", description: "React, JS, HTML/CSS asoslari", price: 700000, duration_hours: 3, duration_month: 5 },
    { name: "Backend (Node.js)", description: "Node.js, Express, PostgreSQL", price: 800000, duration_hours: 3, duration_month: 6 },
    { name: "Python asoslari", description: "Python dasturlash tili", price: 600000, duration_hours: 2, duration_month: 4 },
  ].map((c) => ({ id: nextId("courses"), ...c, created_at: new Date().toISOString() }));
  db.data.courses.push(...courses);

  // ---- TEACHERS ----
  const teachers = [
    { full_name: "Jasur Rahimov", phone: "+998901111111", email: "jasur@najotedu.uz" },
    { full_name: "Malika Yusupova", phone: "+998902222222", email: "malika@najotedu.uz" },
  ].map((t) => ({
    id: nextId("teachers"),
    ...t,
    address: "Toshkent",
    photo: null,
    password: hash("teacher123"),
    role: "TEACHER",
    created_at: new Date().toISOString(),
  }));
  db.data.teachers.push(...teachers);

  // ---- STUDENTS ----
  const studentNames = [
    "Aziz Karimov", "Dilnoza Tosheva", "Sardor Aliyev", "Nodira Yoldosheva",
    "Bekzod Nazarov", "Madina Qodirova",
  ];
  const students = studentNames.map((full_name, i) => ({
    id: nextId("students"),
    full_name,
    phone: `+99890333${String(3330 + i).slice(-4)}`,
    email: `student${i + 1}@najotedu.uz`,
    address: "Toshkent",
    birth_date: "2003-01-01",
    photo: null,
    password: hash("student123"),
    role: "STUDENT",
    created_at: new Date().toISOString(),
  }));
  db.data.students.push(...students);

  // ---- GROUPS ----
  const group1 = {
    id: nextId("groups"),
    name: "Frontend-24",
    description: "React asosida frontend guruhi",
    course_id: courses[0].id,
    room_id: rooms[0].id,
    start_date: "2026-06-01",
    week_day: ["MONDAY", "WEDNESDAY", "FRIDAY"],
    start_time: "09:00",
    max_student: 20,
    status: "active",
    created_at: new Date().toISOString(),
  };
  const group2 = {
    id: nextId("groups"),
    name: "Backend-12",
    description: "Node.js backend guruhi",
    course_id: courses[1].id,
    room_id: rooms[1].id,
    start_date: "2026-07-01",
    week_day: ["TUESDAY", "THURSDAY", "SATURDAY"],
    start_time: "14:00",
    max_student: 15,
    status: "planned",
    created_at: new Date().toISOString(),
  };
  db.data.groups.push(group1, group2);

  db.data.groupTeachers.push(
    { id: nextId("groupTeachers"), group_id: group1.id, teacher_id: teachers[0].id },
    { id: nextId("groupTeachers"), group_id: group2.id, teacher_id: teachers[1].id }
  );

  students.slice(0, 4).forEach((s) => {
    db.data.groupStudents.push({ id: nextId("groupStudents"), group_id: group1.id, student_id: s.id });
  });
  students.slice(4).forEach((s) => {
    db.data.groupStudents.push({ id: nextId("groupStudents"), group_id: group2.id, student_id: s.id });
  });

  // ---- SAMPLE LESSON + ATTENDANCE + HOMEWORK ----
  const lesson1 = {
    id: nextId("lessons"),
    group_id: group1.id,
    date: "2026-06-01",
    topic: "React asoslari: komponentlar",
    description: "JSX, props, state tushunchalari",
    created_at: new Date().toISOString(),
  };
  db.data.lessons.push(lesson1);

  db.data.groupStudents
    .filter((gs) => gs.group_id === group1.id)
    .forEach((gs) => {
      db.data.attendances.push({
        id: nextId("attendances"),
        lesson_id: lesson1.id,
        student_id: gs.student_id,
        isPresent: true,
      });
    });

  const homework1 = {
    id: nextId("homeworks"),
    lesson_id: lesson1.id,
    group_id: group1.id,
    title: "1-3 komponentlarni yarating",
    file: null,
    created_at: new Date().toISOString(),
  };
  db.data.homeworks.push(homework1);

  const firstStudentInGroup1 = db.data.groupStudents.find((gs) => gs.group_id === group1.id).student_id;
  db.data.homeworkAnswers.push({
    id: nextId("homeworkAnswers"),
    homework_id: homework1.id,
    student_id: firstStudentInGroup1,
    file: null,
    text: "Vazifa bajarildi, link: github.com/example/repo",
    status: "PENDING",
    grade: null,
    feedback: null,
    submitted_at: new Date().toISOString(),
  });

  await persist();

  console.log("✅ Baza muvaffaqiyatli to'ldirildi (seed).");
  console.log("");
  console.log("=== LOGIN MA'LUMOTLARI ===");
  console.log("SUPER ADMIN  -> phone: +998901234567  |  password: admin123");
  console.log("TEACHER      -> phone: +998901111111  |  password: teacher123  (Jasur Rahimov)");
  console.log("TEACHER      -> phone: +998902222222  |  password: teacher123  (Malika Yusupova)");
  console.log("STUDENT      -> phone: +998903333330  |  password: student123  (Aziz Karimov)");
  console.log("===========================");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed xatolik:", e);
  process.exit(1);
});
