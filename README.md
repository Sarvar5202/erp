# NajotEdu CRM — To'liq loyiha (Frontend + Backend)

Bu arxivda **ikkita papka** bor:

```
najotEdu_front-main/   <- Frontend (React + Vite) — TUZATILGAN versiya
backend/                <- Backend (Node.js + Express) — YANGI, siz uchun yozildi
```

## 🚀 Ishga tushirish (ikkalasini ham)

### 1) Backend
```bash
cd backend
npm install
npm run seed      # demo ma'lumotlar (super admin, teacher, student, guruhlar...)
npm start         # http://localhost:3000
```

### 2) Frontend (boshqa terminalda)
```bash
cd najotEdu_front-main
npm install
npm run dev        # http://localhost:5173 (yoki Vite ko'rsatgan port)
```

Brauzerda frontend manzilini oching va quyidagi login bilan kiring:

| Rol | Telefon | Parol |
|---|---|---|
| Super Admin | `+998901234567` | `admin123` |
| Teacher | `+998901111111` | `teacher123` |
| Student | `+998903333330` | `student123` |

To'liq login ro'yxati va API hujjatlari uchun `backend/README.md`ga qarang.

---

## 🔧 Frontendda nima tuzatildi

Avvalgi tahlilimda topilgan barcha muammolar frontend kodida to'g'ridan-to'g'ri tuzatildi:

1. **`.env` orqali backend manzili** — `src/api/axios.js` va `src/pages/Login.jsx` endi `VITE_API_BASE_URL`dan foydalanadi (avval qattiq yozilgan edi, 8 ta faylda takrorlangan edi).
2. **Fayl (rasm/video) URL'lari markazlashtirildi** — yangi `src/utils/fileUrl.js` helper yaratildi va 7 ta komponentda ishlatildi. Avval ikki xil noto'g'ri format bor edi (`/files/...` va xato `/files/files/...`) — endi hammasi bitta to'g'ri formatda.
3. **`Login.jsx`** endi alohida `axios` o'rniga umumiy `axiosClient`dan foydalanadi (avval backend manzili 2 joyda alohida-alohida yozilgan edi).
4. **Haqiqiy bug tuzatildi** — `StudentPage.jsx`dagi `handleCreateStudent` funksiyasida `groups: selectedGroups.map(group => { id:group.id; name:group.name })` — bu JS "label" sintaksisi edi (object emas!), natijada har doim `undefined` qaytarardi. Endi to'g'ri: `group => ({ id: group.id, name: group.name })`.
5. **Route himoyasi qo'shildi** — yangi `src/components/ProtectedRoute.jsx`. Avval faqat token borligi tekshirilardi (role tekshirilmasdi), ya'ni STUDENT sifatida kirgan foydalanuvchi URL'ga qo'lda `/dashboard/students` yozib admin sahifasini ochishi mumkin edi. Endi har bir sahifa o'ziga tegishli role'lar bilan himoyalangan (`Layout.jsx`).
6. **`DashboardHome.jsx`** — avval 100% statik mock data edi (ism, raqamlar qattiq yozilgan), backend ulansa ham hech narsa o'zgarmasdi. Endi haqiqiy `/dashboard/stats` endpointidan va JWT tokendagi ismdan foydalanadi.

> Route nomuvofiqligi (`HomeworkCheck.jsx`dagi `/group/...` birlik shaklda) frontendda o'zgartirilmadi — buning o'rniga **backend shu formatga moslab yozildi** (`/group` prefiksi bilan alohida router), chunki bu izchillikni buzmasdan ishlaydigan yechim.

## 🏗️ Backend haqida qisqacha

- Node.js + Express + **lowdb** (JSON fayl bazasi — hech qanday tashqi DB, Docker yoki native build kerak emas, `npm install` qilgach darhol ishlaydi)
- JWT autentifikatsiya, 3 role: `ADMIN`, `TEACHER`, `STUDENT`
- Frontend kutgan **aynan shu** endpointlar va `{success, data, message}` javob formati — men frontendning har bir `axiosClient.get/post(...)` chaqiruvini birma-bir o'qib, shunga moslab yozdim
- To'liq test qilindi: login (3 rol), guruh yaratish, dars+davomat, uyga vazifa berish/tekshirish, fayl/rasm/video yuklash — barchasi ishlayapti

To'liq endpoint ro'yxati, muhim eslatmalar va production tavsiyalari uchun **`backend/README.md`** faylini o'qing — u yerda nima uchun ba'zi endpointlar "g'alati" nomlangani (masalan `/group/` birlik shaklda) ham tushuntirilgan.

## ⚠️ Halol eslatma

Bu loyihada hech qanday rasmiy backend hujjat (Swagger/OpenAPI) yoki asl backend repo yo'q edi — men butun API shartnomasini **faqat frontend kodini o'qib** (har bir komponentning `axiosClient` chaqiruvini, kutilayotgan javob strukturasini) qayta tikladim. Asosiy oqimlar (login, CRUD, guruh, dars, davomat, uyga vazifa, fayl yuklash) men tomonimdan to'liq test qilindi va ishlaydi. Ammo loyiha juda katta va ba'zi nozik holatlar (masalan juda o'ziga xos jadval/kalendar formatlari) bo'lishi mumkin — shuning uchun productionga chiqarishdan oldin har bir sahifani real ma'lumot bilan birma-bir sinab ko'rishni tavsiya qilaman. Agar biror joyda nomuvofiqlik topsangiz, aynan qaysi sahifa/amal ekanini ayting — tezda tuzataman.
