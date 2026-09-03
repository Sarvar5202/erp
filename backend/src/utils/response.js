// Barcha javoblar FRONTEND kutayotgan { success, data, message } formatida bo'lishi shart.
// Frontend har joyda `if (res.data.success)` deb tekshiradi — shu format buzilsa UI jim qoladi.

export function ok(res, data, message = "OK", status = 200) {
  return res.status(status).json({ success: true, data, message });
}

export function created(res, data, message = "Yaratildi") {
  return res.status(201).json({ success: true, data, message });
}

export function fail(res, message = "Xatolik yuz berdi", status = 400, extra = {}) {
  return res.status(status).json({ success: false, message, ...extra });
}

export function notFound(res, message = "Topilmadi") {
  return fail(res, message, 404);
}
