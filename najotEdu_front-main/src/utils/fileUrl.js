// Yuklangan fayllar (rasm, video, hujjat) uchun yagona URL generatori.
// Ilgari loyihada bu joy-joyida qattiq yozilgan edi (http://localhost:3000/files/...,
// ba'zan hatto /files/files/... kabi xato bilan) — endi hammasi shu joydan boshqariladi.
// Backend URL'ni o'zgartirish kerak bo'lsa, faqat .env'dagi VITE_API_BASE_URL'ni o'zgartiring.

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
// ".../api/v1" qismini olib tashlab, faqat server root'ini olamiz (fayllar /files ostida turadi)
export const SERVER_ROOT = RAW_BASE.replace(/\/api\/v1\/?$/, "");

export function getFileUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename; // allaqachon to'liq URL bo'lsa
  return `${SERVER_ROOT}/files/${filename}`;
}
