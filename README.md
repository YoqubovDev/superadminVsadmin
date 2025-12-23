# Admin Panel Tizimi

Bu loyiha Super Admin va Admin panellarini boshqarish uchun yaratilgan web ilova.

## 📋 Tarkib

- `index.html` - Kirish sahifasi (Admin yoki Super Admin tanlash)
- `superadmin.html` - Super Admin paneli
- `admin.html` - Admin paneli
- `app.js` - Asosiy JavaScript fayli (ixtiyoriy)

## 🚀 Qanday Ishlatish

### 1. Kirish

1. `index.html` faylini brauzerda oching
2. Ikki tugmadan birini tanlang:
   - **Admin** - Admin paneliga kirish
   - **Super Admin** - Super Admin paneliga kirish

### 2. Super Admin Panel

Super Admin panelida quyidagi funksiyalar mavjud:

#### Dashboard
- **KPI Cards:**
  - Umumiy investitsiya
  - Startuperlar soni
  - Investorlar soni
  - Loyihalar soni
  - Kutilayotgan yechimlar

- **Chartlar:**
  - Umumiy investitsiya diagrammasi (Line Chart)
  - Investitsiya taqsimoti (Doughnut Chart)
  - TOP-5 Loyihalar (Bar Chart)

#### Adminlar Boshqaruvi
- **Yangi admin yaratish:**
  - "Yangi admin" tugmasini bosing
  - Ism, Telefon, Parol, O'quv markaz nomi, Viloyat, Tuman, Tugash vaqti va Statusni kiriting
  - "Yaratish" tugmasini bosing

- **Admin tahrirlash:**
  - Jadvaldagi admin qatorida "Tahrirlash" tugmasini bosing
  - Ma'lumotlarni o'zgartiring
  - "Saqlash" tugmasini bosing

- **Admin o'chirish:**
  - Jadvaldagi admin qatorida "O'chirish" tugmasini bosing
  - Tasdiqlash xabari paydo bo'ladi

#### Studentlar Boshqaruvi
- **Yangi student yaratish:**
  - "Yangi student" tugmasini bosing
  - Ism, Telefon, Parol, Admin nomi (dropdown), Ro'yxatdan o'tgan sana va Statusni kiriting
  - Faqat aktiv adminlar dropdown'da ko'rsatiladi
  - "Yaratish" tugmasini bosing

- **Student tahrirlash:**
  - Jadvaldagi student qatorida "Tahrirlash" tugmasini bosing
  - Ma'lumotlarni o'zgartiring
  - O'zgarishlar soni avtomatik yangilanadi va foizga aylantiriladi
  - "Saqlash" tugmasini bosing

- **Student o'chirish:**
  - Jadvaldagi student qatorida "O'chirish" tugmasini bosing
  - Tasdiqlash xabari paydo bo'ladi

#### Profil Sozlamalari
- Sidebar'dagi profil qismiga (ism yoki avatar) bosing
- Quyidagi ma'lumotlarni yangilashingiz mumkin:
  - Ism
  - Telefon
  - Parol (Eski va Yangi parol)

#### Avtomatik Funksiyalar
- **Tugash vaqti kuzatish:**
  - Agar adminning tugash vaqti o'tib ketsa, admin va uning studentlari avtomatik bloklanadi
  - Agar Super Admin tugash vaqtini kelajakga o'zgartirsa, admin va studentlar avtomatik aktivlashtiriladi

- **Admin bloklash:**
  - Agar admin bloklanga bo'lsa, uning barcha studentlari ham bloklanadi
  - Bloklangan adminlar student yaratishda dropdown'da ko'rsatilmaydi

### 3. Admin Panel

Admin panelida quyidagi funksiyalar mavjud:

#### Dashboard
- **KPI Cards:**
  - Umumiy pul miqdori
  - Studentlar soni

- **Chartlar:**
  - Umumiy pull diagrammasi (Line Chart)
  - Toshkent Shaxar va viloyatlar bo'yicha taqsimoti (Doughnut Chart)
  - TOP-5 o'quv markazlari (Bar Chart)

#### Studentlar Boshqaruvi
- **Yangi student yaratish:**
  - "Yangi student" tugmasini bosing
  - Ism, Telefon, Parol, Admin nomi (faqat o'zi ko'rsatiladi), Ro'yxatdan o'tgan sana va Statusni kiriting
  - "Yaratish" tugmasini bosing

- **Student tahrirlash:**
  - Jadvaldagi student qatorida "Tahrirlash" tugmasini bosing
  - Ma'lumotlarni o'zgartiring
  - O'zgarishlar soni avtomatik yangilanadi va foizga aylantiriladi
  - "Saqlash" tugmasini bosing

- **Student o'chirish:**
  - Jadvaldagi student qatorida "O'chirish" tugmasini bosing
  - Tasdiqlash xabari paydo bo'ladi

#### Profil Sozlamalari
- Sidebar'dagi profil qismiga (ism yoki avatar) bosing
- Quyidagi ma'lumotlarni yangilashingiz mumkin:
  - Ism
  - Telefon
  - Parol (Eski va Yangi parol)

#### Cheklovlar
- Adminlar yaratish mumkin emas (faqat Super Admin yarata oladi)
- Student yaratishda faqat o'sha adminning o'zi ko'rsatiladi

## 🎨 O'zgarishlar Foizi

Har bir student uchun o'zgarishlar foizi kuzatiladi:

- **60% dan past** - Qizil rang
- **70% dan 88% gacha** - Sariq rang
- **88% dan 100% gacha** - Yashil rang

O'zgarishlar foizi student ma'lumotlari har safar tahrirlanganda avtomatik yangilanadi.

## 🔐 Xavfsizlik

- Super Admin barcha ma'lumotlarni ko'ra oladi (adminlar va studentlar)
- Admin faqat o'ziga biriktirilgan studentlarni ko'ra oladi
- Admin panelida adminlar jadvali ko'rsatilmaydi

## 📊 Chartlar

Barcha chartlar zamonaviy animatsiyalar bilan ishlaydi:

- **Line Chart:** Gradient fon, smooth animatsiya, hover effektlari
- **Doughnut Chart:** Rotatsiya animatsiyasi, hover offset effekti
- **Bar Chart:** Ketma-ket animatsiya, gradient ranglar

## 🛠️ Texnologiyalar

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (Vanilla JS)
- Chart.js (Grafiklar uchun)
- Font Awesome (Ikonkalar uchun)

## 📝 Eslatmalar

- Barcha ma'lumotlar brauzerda saqlanadi (localStorage emas, faqat DOM)
- Saytni yangilaganda ma'lumotlar saqlanib qoladi (HTML ichida)
- Backend integratsiyasi uchun API endpoint'larni qo'shishingiz kerak



## 📞 Yordam

Agar muammo bo'lsa yoki savol bo'lsa, loyiha muallifiga murojaat qiling.

---

**Muallif:** Yoqubov Shehroz  
**Versiya:** 1.0.0  
**Sana:** 2025/12/23

