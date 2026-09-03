import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${nanoid(8)}${ext}`;
    cb(null, safeName);
  },
});

// Faqat xavfsiz fayl turlariga ruxsat (rasm, video, hujjat)
const allowedExt = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".mp4", ".mov", ".webm",
  ".pdf", ".doc", ".docx", ".zip", ".rar", ".ppt", ".pptx", ".xlsx",
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Ruxsat etilmagan fayl turi: ${ext}`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB (video uchun)
});
