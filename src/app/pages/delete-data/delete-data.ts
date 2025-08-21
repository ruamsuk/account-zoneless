import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Services ---
import { DeleteDataService } from '../../services/delete-data.service';
import { DateUtilityService } from '../../services/date-utility.service';
import { DialogService } from '../../shared/services/dialog';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';


interface CollectionOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-delete-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="container mx-auto p-4 md:p-8 flex justify-center">
      <div class="w-full max-w-2xl">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 class="text-3xl font-thasadith font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
            ลบข้อมูลรายปี
          </h1>

          <!-- 1. เลือก Collection -->
          <div class="mb-6">
            <label class="form-label">เลือก Collection ที่ต้องการลบ:</label>
            <div class="space-y-2 mt-2">
              @for (col of availableCollections(); track col.key) {
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [id]="col.key"
                    [value]="col.key"
                    [checked]="selectedCollections().includes(col.key)"
                    (change)="onCollectionChange(col.key, $event)"
                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                  <label [for]="col.key" class="ml-3 block text-base text-gray-700 dark:text-gray-300">
                    {{ col.label }}
                  </label>
                </div>
              }
            </div>
          </div>

          <!-- 2. เลือกปี -->
          <div class="mb-6">
            <label for="year-select" class="form-label">เลือกปี (พ.ศ.) ที่จะลบข้อมูล:</label>
            <select id="year-select" [(ngModel)]="selectedYear" class="form-input mt-2">
              <option [ngValue]="null" disabled>-- เลือกปี --</option>
              @for (year of availableYears; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>

          <!-- 3. ปุ่มยืนยันการลบ -->
          <div class="mt-8">
            <button
              (click)="confirmDelete()"
              [disabled]="selectedCollections().length === 0 || !selectedYear"
              class="btn-danger w-full">
              ดำเนินการลบข้อมูลที่เลือก
            </button>
          </div>

          <!-- Warning Message -->
          <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 dark:border-red-600 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor"
                     aria-hidden="true">
                  <path fill-rule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                        clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700 dark:text-red-200">
                  <strong>คำเตือน:</strong> การกระทำนี้ไม่สามารถย้อนกลับได้ โปรดตรวจสอบให้แน่ใจก่อนดำเนินการ
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  `
})
export class DeleteData implements OnInit {
  private deleteDataService = inject(DeleteDataService);
  private dateUtilityService = inject(DateUtilityService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);

  // --- State ---
  availableCollections = signal<CollectionOption[]>([]);
  availableYears: number[] = [];
  selectedCollections = signal<string[]>([]);
  selectedYear: number | null = null;

  ngOnInit() {
    this.deleteDataService.getAvailableCollections().then(data => this.availableCollections.set(data));
    this.availableYears = this.dateUtilityService.getYearRange(10);
  }

  onCollectionChange(collectionKey: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedCollections.update(current => {
      if (isChecked) {
        return [...current, collectionKey];
      } else {
        return current.filter(key => key !== collectionKey);
      }
    });
  }

  async confirmDelete() {
    if (this.selectedCollections().length === 0 || !this.selectedYear) {
      return;
    }

    const collectionLabels = this.selectedCollections()
      .map(key => this.availableCollections().find(c => c.key === key)?.label)
      .join(', ');

    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบข้อมูลถาวร',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมดของปี <strong>${this.selectedYear}</strong> จาก Collection: <br><strong>${collectionLabels}</strong>?`
    });

    if (confirmed) {
      await this.executeDelete();
    }
  }

  private async executeDelete() {
    this.loadingService.show();
    try {
      const yearToDeleteCE = this.selectedYear! - 543;

      // สร้าง Promise array โดยเรียกใช้เมธอดที่ถูกต้องสำหรับแต่ละ collection
      const deletePromises = this.selectedCollections().map(collectionKey => {
        switch (collectionKey) {
          case 'accounts':
            return this.deleteDataService.deleteAccountsByYear(yearToDeleteCE);
          case 'credit':
            return this.deleteDataService.deleteCreditByYear(yearToDeleteCE);
          case 'bloodPressureRecords':
            return this.deleteDataService.deleteBloodPressureByYear(yearToDeleteCE);
          case 'monthly':
            return this.deleteDataService.deleteMonthlyByYear(yearToDeleteCE);
          default:
            // คืนค่า Promise ที่ resolve ทันทีสำหรับ collection ที่ไม่รู้จัก
            return Promise.resolve();
        }
      });

      await Promise.all(deletePromises);

      this.toastService.show('Success', `ลบข้อมูลปี ${this.selectedYear} สำเร็จ`, 'success');
      this.selectedCollections.set([]);
      this.selectedYear = null;
    } catch (error) {
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }
}
