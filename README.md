# โปรเจกต์ระบบบัญชีรายรับ-รายจ่าย (Account-Zoneless)

โปรเจกต์ส่วนตัวสำหรับพัฒนาระบบบัญชีรายรับ-รายจ่ายที่ทันสมัย สร้างขึ้นด้วย Angular และ Firebase โดยเน้นการใช้สถาปัตยกรรมแบบใหม่เพื่อประสิทธิภาพสูงสุด

---

## ✨ คุณสมบัติหลัก (Key Features)

* **การจัดการข้อมูล:** เพิ่ม, ลบ, แก้ไข รายการรายรับ-รายจ่าย
* **ระบบยืนยันตัวตน:** ล็อกอินด้วย Email/Password และ Google
* **การป้องกันสิทธิ์:** ใช้ Route Guard เพื่อจำกัดการเข้าถึงเฉพาะผู้ดูแลระบบ
* **หน้า CashList:** แสดงภาพรวมและสรุปผลทางบัญชี DEBIT/CREDIT
* **หน้า Blood** บันทึกข้อมูลความดันโลหิต และพิมพ์รายงาน
* **การออกแบบที่ตอบสนอง (Responsive Design):** ใช้งานได้ดีบนทุกขนาดหน้าจอ
* **โหมดมืด/สว่าง (Dark/Light Mode):** รองรับการสลับธีม
* **_thaiDatepicker** แสดงวัน เดือน ปี พ.ศ. (BE) ได้ถูกต้องสวยงาม
* **Mask and Number Directive** สำหรับ Input

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

# คู่มือการใช้งาน ThaiDatepickerComponent

`ThaiDatepickerComponent` คือ Standalone Component ที่ถูกสร้างขึ้นเพื่อใช้แทนที่ Datepicker มาตรฐาน โดยมีหน้าตาเป็นปฏิทินเต็มรูปแบบที่แสดงผลเป็นภาษาไทยและปีพุทธศักราช (พ.ศ.) ถูกออกแบบมาให้ทำงานร่วมกับ Angular Reactive Forms ได้อย่างสมบูรณ์แบบ

---

## ✨ คุณสมบัติเด่น

* **UI ปฏิทินเต็มรูปแบบ:** แสดงผลเป็นตารางวันที่, เดือน, และปีที่ใช้งานง่าย
* **ภาษาไทยและปี พ.ศ.:** แสดงชื่อเดือนเป็นภาษาไทยและปีเป็น พ.ศ. โดยอัตโนมัติ
* **Month & Year Picker:** สามารถคลิกที่ชื่อเดือนหรือปีเพื่อเปิดหน้าต่างเลือกได้อย่างรวดเร็ว
* **Positioning อัจฉริยะ:** ใช้ Angular CDK Overlay ในการแสดงผล Popup ทำให้มั่นใจได้ว่าจะลอยอยู่เหนือองค์ประกอบอื่นเสมอ
* **Parent-driven Closing:** รองรับการสั่งปิด Popup จาก Component ตัวแม่ เพื่อจัดการกับกรณีที่ซับซ้อน เช่น การใช้งานภายใน Modal อื่นๆ
* **Standalone:** พร้อมใช้งานได้ทันที แค่ import เข้าไปใน Component ที่ต้องการ

---

## 🚀 การติดตั้งและตั้งค่า

1. **ติดตั้ง Dependencies:** Component นี้จำเป็นต้องใช้ Angular CDK
   ```bash
   npm install @angular/cdk
   ```

2. **ตั้งค่า Animations:** เพื่อให้ CDK Overlay ทำงานได้อย่างราบรื่น ให้เพิ่ม `provideAnimationsAsync()` เข้าไปใน `app.config.ts`
   ```typescript
   // in app.config.ts
   import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

   export const appConfig: ApplicationConfig = {
     providers: [
       provideAnimationsAsync(),
       // ... providers อื่นๆ
     ]
   };
   ```

---

## 📋 วิธีการใช้งาน

### 1. การใช้งานพื้นฐานกับ Reactive Forms

นี่คือวิธีที่ง่ายและแนะนำที่สุดในการใช้งาน Component นี้

**ใน Parent Component (เช่น `my-form.ts`):**

```typescript
// 1. Import Component เข้ามา
import { ThaiDatepickerComponent } from './shared/components/_thai-datepicker.ts';

@Component({
  standalone: true,
  // 2. เพิ่มเข้าไปใน imports array
  imports: [ReactiveFormsModule, ThaiDatepickerComponent],
  template: `
    <form [formGroup]="myForm">
      <label>วันที่</label>
      <!-- 3. เรียกใช้งานใน Template -->
      <app-thai-datepicker formControlName="birthdate"></app-thai-datepicker>
    </form>
  `
})
export class MyFormComponent {
  myForm = new FormGroup({
    // 4. สร้าง FormControl ที่จะเก็บค่าเป็น Date object หรือ null
    birthdate: new FormControl<Date | null>(null)
  });
}
```

2. (ขั้นสูง) การจัดการ "คลิกข้างนอกเพื่อปิด" เมื่อใช้ใน Modal
   ในกรณีที่คุณนำ Datepicker ไปใช้ใน Modal ที่ซับซ้อน คุณสามารถใช้สถาปัตยกรรมแบบ "Parent-driven" เพื่อควบคุมการปิด Popup ได้

ใน Parent Component (เช่น print-dialog.ts):

```typescript

Template:

  <!-- 1. ส่ง signal [shouldClose] เข้าไป และรอรับ event (closed) กลับมา -->
  <app-thai - datepicker
    [shouldClose] = "shouldClose()"
  (closed) = "onPickerClosed()"
formControlName = "startDate" >
</app-thai-datepicker>

<!-- 2. สร้าง element ที่จะดักจับการคลิก -->
< div(click) = "onDialogContentClick()" >
...
</div>

```

TypeScript:

```typescript

export class PrintDialogComponent {
  shouldClose = signal(false);

  // 3. เมื่อมีการคลิกที่เนื้อหาของ Modal, ให้สั่งปิด Datepicker
  onDialogContentClick(): void {
    this.shouldClose.set(true);
  }

  // 4. เมื่อ Datepicker ปิดตัวเองเสร็จแล้ว, ให้รีเซ็ต "สวิตช์" กลับเป็น false
  onPickerClosed(): void {
    this.shouldClose.set(false);
  }
}
