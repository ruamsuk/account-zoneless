import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreditService } from '../../services/credit.service';
import { DialogService } from '../../shared/services/dialog';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-update-details-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <main class="max-w-4xl mx-auto p-4 md:p-8">
      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <!-- Field Selector -->
          <div>
            <label class="form-label">Old</label>
            <input type="text" class="form-input border-gray-300" [(ngModel)]="selectedField">
          </div>
          <!-- Detail Selector -->
          <div>
            <label class="form-label">New</label>
            <input type="text" class="form-input border-gray-300" [(ngModel)]="selectedDetails">
          </div>
          <!-- Search Button -->
          <div>
            <button class="btn-primary w-full" (click)="startUpdate()">ปรับเปลี่ยน</button>
          </div>
        </div>
      </div>

      @if (status()) {
        <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ title() }}
            </h3>
            <div class="mt-4">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                กำลังประมวลผล... {{ status()?.processed | number }} / {{ status()?.total | number }} รายการ
              </p>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div class="bg-blue-600 h-2.5 rounded-full"
                     [style.width.%]="creditService.progress()">
                </div>
              </div>
              @if (status()?.processed === status()?.total) {
                <p class="text-sm text-green-500 mt-2">ดำเนินการเสร็จสิ้น!</p>
              }
            </div>
          </div>
        </div>
      }
    </main>
  `
})
export class UpdateDetails {
  private dialogService = inject(DialogService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  creditService = inject(CreditService);
  // Input signals (read-only)
  // open = input<boolean>(true);
  status = signal<{ processed: number; total: number } | null>(null);
  title = input<string>('กำลังดำเนินการอัปเดต');

  selectedField = signal<string | null>(null);
  selectedDetails = signal<string | null>(null);
  // 1. เพิ่ม signal สำหรับเก็บสถานะ
  progressStatus = signal<{ processed: number; total: number } | null>(null);

  async startUpdate() {
    const field = this.selectedField();
    const details = this.selectedDetails();

    console.log('Field:', field);
    console.log('Details:', details);
    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการเปลี่ยนแปลง',
      message: `ต้องการเปลี่ยน: <strong>${field} เป็น ${details}</strong>?`
    });
    if (confirmed) {
      this.loadingService.show();
      try {
        await this.creditService.updateCreditDetailsWithProgress(field, details, 2000);
      } catch (error) {
        console.error('Error updating details:', error);
      }
    }
    this.loadingService.hide();
  }

  // Internal state (writable)
  // internalOpen = signal(this.open());

  // progress = computed(() => {
  //   const s = this.status();
  //   if (!s || s.total === 0) return 0;
  //   return (s.processed / s.total) * 100;
  // });

  // constructor() {
  //   // sync ค่า open จาก parent → internalOpen
  //   effect(() => {
  //     // this.internalOpen.set(this.open());
  //   });
  //
  //   // auto-close เมื่อ progress ครบ
  //   effect(() => {
  //     const s = this.status();
  //     if (s && s.processed === s.total && s.total > 0) {
  //       queueMicrotask(() => {  // ใช้ API ทันสมัยกว่า setTimeout
  //         // this.internalOpen.set(false);
  //       });
  //     }
  //   });
  // }
}
