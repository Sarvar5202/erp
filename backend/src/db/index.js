import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "database.json");

const defaultData = {
  admins: [],
  teachers: [],
  students: [],
  courses: [],
  rooms: [],
  groups: [],
  groupTeachers: [], // { id, group_id, teacher_id }
  groupStudents: [], // { id, group_id, student_id }
  lessons: [], // { id, group_id, date, topic, description, created_at }
  attendances: [], // { id, lesson_id, student_id, isPresent }
  homeworks: [], // { id, lesson_id, group_id, title, file, created_at }
  homeworkAnswers: [], // { id, homework_id, student_id, file, text, status: PENDING|ACCEPTED|REJECTED, grade, feedback, submitted_at }
  videos: [], // { id, group_id, lesson_id, video_url, originalname, created_at }
  counters: {},
};

const adapter = new JSONFile(file);
export const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);
  // Ensure all keys exist even if file was partially written previously
  for (const key of Object.keys(defaultData)) {
    if (db.data[key] === undefined) db.data[key] = defaultData[key];
  }
  await db.write();
  return db;
}

export function nextId(collectionName) {
  db.data.counters[collectionName] = (db.data.counters[collectionName] || 0) + 1;
  return db.data.counters[collectionName];
}

export async function persist() {
  await db.write();
}
