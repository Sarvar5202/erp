import { Navigate } from "react-router-dom";

/**
 * Ilgari faqat token borligi tekshirilardi, role tekshirilmasdi — bu degani
 * har qanday login qilgan foydalanuvchi (masalan STUDENT) URL'ga qo'lda
 * "/dashboard/students" yozib admin sahifasini ochib ko'rishi mumkin edi.
 * Bu component shu teshikni yopadi: ruxsat etilgan role'lar ro'yxatida
 * bo'lmasa, foydalanuvchini o'zining asosiy sahifasiga qaytaradi.
 *
 * ESLATMA: bu faqat UI-darajadagi himoya (foydalanuvchi tajribasi uchun).
 * Xavfsizlikning asosiy qismi har doim BACKEND'da bo'lishi shart — backend
 * har bir endpointda req.user.role'ni albatta tekshiradi (requireRole()).
 */
function defaultRouteForRole(role) {
  if (role === "TEACHER") return "/dashboard/groups";
  if (role === "STUDENT") return "/dashboard/my-groups";
  return "/dashboard";
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const role = localStorage.getItem("role");

  if (!allowedRoles || allowedRoles.includes(role)) {
    return children;
  }

  return <Navigate to={defaultRouteForRole(role)} replace />;
}
