# โปรเจกต์ระบบบัญชีรายรับ-รายจ่าย (Account-Zoneless)

โปรเจกต์ส่วนตัวสำหรับพัฒนาระบบบัญชีรายรับ-รายจ่ายที่ทันสมัย สร้างขึ้นด้วย Angular และ Firebase โดยเน้นการใช้สถาปัตยกรรมแบบใหม่เพื่อประสิทธิภาพสูงสุด

---

## ✨ คุณสมบัติหลัก (Key Features)

* **การจัดการข้อมูล:** เพิ่ม, ลบ, แก้ไข รายการรายรับ-รายจ่าย
* **ระบบยืนยันตัวตน:** ล็อกอินด้วย Email/Password และ Google
* **การป้องกันสิทธิ์:** ใช้ Route Guard เพื่อจำกัดการเข้าถึงเฉพาะผู้ดูแลระบบ
* **หน้า Dashboard:** แสดงภาพรวมและสรุปผลทางบัญชี
* **การออกแบบที่ตอบสนอง (Responsive Design):** ใช้งานได้ดีบนทุกขนาดหน้าจอ
* **โหมดมืด/สว่าง (Dark/Light Mode):** รองรับการสลับธีม

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:**
  * [Angular](https://angular.io/) (v20+)
  * Standalone Components
  * Zoneless Change Detection
  * [Tailwind CSS](https://tailwindcss.com/) (v4+)
* **Backend & Database:**
  * [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication)
* **State Management:**
  * Angular Signals

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Setup & Run)

1. **Clone the repository:**
   ```bash
   git clone [Your-Repository-URL]
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**

* สร้างไฟล์ `environment.ts` ในโฟลเดอร์ `src/environments/`
* ใส่ Firebase config ของคุณในไฟล์นั้น

4. **Run the application:**
   ```bash
   ng serve
   ```
