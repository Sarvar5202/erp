import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { initDb } from "./src/db/index.js";
import { uploadsDir } from "./src/middleware/upload.js";

import authRoutes from "./src/routes/auth.js";
import teachersRoutes from "./src/routes/teachers.js";
import studentsRoutes from "./src/routes/students.js";
import coursesRoutes from "./src/routes/courses.js";
import roomsRoutes from "./src/routes/rooms.js";
import groupsRoutes from "./src/routes/groups.js";
import lessonsRoutes from "./src/routes/lessons.js";
import homeworkRoutes from "./src/routes/homework.js";
import groupHomeworkRoutes from "./src/routes/groupHomework.js";
import filesRoutes from "./src/routes/files.js";
import dashboardRoutes from "./src/routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await initDb();

const app = express();

app.use(cors()); // Frontend har xil originda ishlashi mumkin (dev/prod), shuning uchun ochiq
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Yuklangan fayllar (rasm, video, hujjat) shu yerdan statik xizmat qiladi.
// Frontend: http://<HOST>/files/<filename>
app.use("/files", express.static(uploadsDir));

const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/teachers`, teachersRoutes);
app.use(`${API_PREFIX}/students`, studentsRoutes);
app.use(`${API_PREFIX}/courses`, coursesRoutes);
app.use(`${API_PREFIX}/rooms`, roomsRoutes);
app.use(`${API_PREFIX}/groups`, groupsRoutes);
app.use(`${API_PREFIX}/lessons`, lessonsRoutes);
app.use(`${API_PREFIX}/homework`, homeworkRoutes);
app.use(`${API_PREFIX}/group`, groupHomeworkRoutes); // BIRLIK — frontend shunday chaqiradi
app.use(`${API_PREFIX}/files`, filesRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({ success: true, message: "Server ishlayapti", time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.method} ${req.originalUrl}` });
});

// Global error handler (masalan multer xatolari: fayl hajmi/turi)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Serverda kutilmagan xatolik yuz berdi",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NajotEdu backend ${PORT}-portda ishga tushdi`);
  console.log(`   API bazasi: http://localhost:${PORT}${API_PREFIX}`);
});
