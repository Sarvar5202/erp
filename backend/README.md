# NajotEdu CRM — Backend

`najotEdu_front-main` frontendi uchun **to'liq ishlaydigan** backend. Express + lowdb (JSON fayl bazasi — o'rnatish uchun hech qanday tashqi baza, Docker yoki native kompilyatsiya kerak emas).

## ✅ Nimalar bor

- **JWT autentifikatsiya**, 3 xil role: `ADMIN` (super admin), `TEACHER`, `STUDENT`
- Frontend kutayotgan **aynan shu** endpointlar va `{ success, data, message }` javob formati
- Rasm/video/hujjat yuklash (multer), statik fayl xizmati
- Har bir panel uchun ma'lumotlar: Super Admin (o'qituvchilar, o'quvchilar, guruhlar, kurslar, xonalar), Teacher (o'z guruhlari, dars, davomat, uyga vazifa berish/tekshirish), Student (o'z guruhlari, darslar, videolar, uyga vazifa)
- Tayyor **demo ma'lumotlar** (seed) — darhol sinab ko'rish uchun

## 🚀 Ishga tushirish

```bash
cd backend
npm install
npm run seed     # demo ma'lumotlar bilan bazani to'ldiradi (FAQAT BIR MARTA)
npm start        # server http://localhost:3000 da ishga tushadi
```

Development uchun (fayl o'zgarganda avtomatik qayta yuklash):
```bash
npm run dev
```

## 🔑 Tayyor login ma'lumotlari (seed'dan keyin)

| Rol | Telefon | Parol |
|---|---|---|
| **SUPER ADMIN** | `+998901234567` | `admin123` |
| **TEACHER** (Jasur Rahimov) | `+998901111111` | `teacher123` |
| **TEACHER** (Malika Yusupova) | `+998902222222` | `teacher123` |
| **STUDENT** (Aziz Karimov) | `+998903333330` | `student123` |

Frontenddagi Login sahifasiga shu telefon+parol bilan kirsangiz bo'ldi.

## ⚙️ Konfiguratsiya (.env)

```
PORT=3000
JWT_SECRET=...           # productionda albatta o'zgartiring!
JWT_EXPIRES_IN=7d
```

## 📁 Loyiha tuzilishi

```
backend/
  server.js              # asosiy entry point
  src/
    db/
      index.js            # lowdb (JSON) sozlamasi
      seed.js              # demo ma'lumotlar
      database.json        # (avtomatik yaratiladi, git'ga tushmaydi)
    middleware/
      auth.js              # JWT tekshirish + role tekshirish
      upload.js             # multer (fayl yuklash) sozlamasi
    routes/
      auth.js, teachers.js, students.js, courses.js, rooms.js,
      groups.js, lessons.js, homework.js, groupHomework.js, files.js, dashboard.js
    utils/
      response.js           # { success, data, message } helper
      serialize.js          # parolni javobdan olib tashlash
      groupHelpers.js        # guruh/jadval hisoblash logikasi
  uploads/                 # yuklangan fayllar shu yerda saqlanadi
```

## 🔌 Barcha endpointlar (frontend bilan tekshirilgan)

Barchasi `http://localhost:3000/api/v1` prefiksi bilan, `Authorization: Bearer <token>` header talab qiladi (login'dan tashqari).

### Auth
- `POST /auth/login` — `{ phone, password }`

### O'qituvchilar (ADMIN)
- `GET /teachers` — ro'yxat
- `POST /teachers` — multipart (full_name, phone, email, address, password, photo, groups)
- `GET /teachers/my/profile` — (TEACHER) o'z profili
- `GET /teachers/my/groups` — (TEACHER) o'z guruhlari
- `PATCH /teachers/:id`, `DELETE /teachers/:id`

### O'quvchilar
- `GET /students` (ADMIN, TEACHER)
- `POST /students` — multipart (full_name, phone, email, address, birth_date, password, photo, groups)
- `GET /students/my/groups` — (STUDENT)
- `PATCH /students/:id`, `DELETE /students/:id`

### Kurslar / Xonalar (ADMIN CRUD)
- `GET/POST /courses`, `PATCH/DELETE /courses/:id`
- `GET /rooms`, `GET /rooms/one/:id`, `POST /rooms`, `PATCH/DELETE /rooms/:id`

### Guruhlar
- `GET /groups/all`, `GET /groups`, `POST /groups`
- `GET /groups/:id` — to'liq detali (o'rtacha yosh, xona sig'imi va h.k.)
- `GET /groups/:id/schedules` — oylik dars jadvali
- `GET /groups/:id/lesson?date=YYYY-MM-DD` — bitta kunlik dars + davomat
- `POST /groups/:id/lesson` — dars mavzusi va davomatni saqlash
- `GET /groups/:groupId/lessons` — (STUDENT) darslar ro'yxati
- `GET /groups/:groupId/lessons/:lessonId/videos`

### Darslar
- `GET /lessons/my/group/:id` — homework yaratishda mavzu tanlash uchun

### Uyga vazifalar
- `POST /homework` — multipart (lesson_id, group_id, title, file)
- `GET /homework/:id` — id = GURUH ID, shu guruhning barcha vazifalari + statistika
- `POST /homework/:homeworkId/submit` — (STUDENT) vazifani topshirish
- `GET /group/:id/homework/:homeworkId/results?status=PENDING|ACCEPTED|REJECTED`
- `GET /group/:id/homework/:homeworkId/result/:studentId`
- `POST /group/:id/homework/:homeworkId/check` — baholash

> ⚠️ **Diqqat:** oxirgi 3 ta endpoint ATAYLAB `/group/...` (BIRLIK) bilan boshlanadi — frontendning `HomeworkResults.jsx` va `HomeworkCheck.jsx` fayllari aynan shunday yozilgan (ko'plik `/groups/` bilan chalkashmaydi, chunki bular butunlay boshqa router).

### Fayllar
- `POST /files/group/:groupId/upload?lessonId=` — video yuklash
- `GET /files/:id` — id = GURUH ID, guruhning barcha videolari
- Static: `GET /files/<filename>` — yuklangan har qanday fayl shu yerdan ochiladi

### Dashboard
- `GET /dashboard/stats` — (ADMIN) bosh sahifa statistikasi

## 🧪 Tezkor tekshirish

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+998901234567","password":"admin123"}'
```

## ⚠️ Muhim eslatmalar (production uchun)

1. **`JWT_SECRET`ni albatta o'zgartiring** productionga chiqarishdan oldin.
2. Bu backend **lowdb (JSON fayl)** ishlatadi — kichik/o'rta hajmdagi ma'lumot va demo/MVP uchun juda mos, lekin **katta hajmdagi real ERP** uchun (minglab yozuv, ko'p bir vaqtdagi foydalanuvchi) PostgreSQL/MySQL + Prisma yoki Sequelize'ga o'tish tavsiya etiladi — schema deyarli tayyor, faqat data-layer almashtiriladi (`src/db/index.js` va uni ishlatadigan joylar).
3. `cors()` hozircha barcha originlarga ochiq — productionda faqat frontend domenini ruxsat bering: `cors({ origin: "https://sizning-domeningiz.uz" })`.
4. Fayllar diskda (`uploads/`) saqlanadi — productionda S3/Cloud Storage'ga o'tish tavsiya etiladi.
5. `npm run seed` faqat baza bo'sh bo'lganda ishlaydi (xavfsizlik uchun) — qayta seed qilish uchun `src/db/database.json`ni o'chiring.
