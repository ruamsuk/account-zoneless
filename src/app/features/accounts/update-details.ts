import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreditService } from '../../services/credit.service';
import { DialogService } from '../../shared/services/dialog';
import { LoadingService } from '../../services/loading.service';
import { ProgressModal } from '../../pages/accounts/progress-modal';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-update-details-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ProgressModal],
  template: `
    <app-progress-modal [status]="status()"></app-progress-modal>
    <main class="max-w-4xl mx-auto p-4 md:p-8">
      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          <!-- Field Selector -->
          <div>
            <label class="form-label">คำที่จะเปลี่ยน</label>
            <input type="text" class="form-input border-gray-300" [(ngModel)]="selectedField">
          </div>
          <!-- Detail Selector -->
          <div>
            <label class="form-label">คำใหม่</label>
            <input type="text" class="form-input border-gray-300" [(ngModel)]="selectedDetails">
          </div>
          <!-- Execute Button -->
          <div>
            <button class="btn-primary w-full" (click)="startUpdate()">ปรับเปลี่ยน</button>
          </div>
        </div>
      </div>
    </main>
  `
})
export class UpdateDetails {
  private dialogService = inject(DialogService);
  private loadingService = inject(LoadingService);
  private toast = inject(ToastService);
  creditService = inject(CreditService);
  // Input signals (read-only)
  // open = input<boolean>(true);
  status = signal<{ processed: number; total: number } | null>(null);
  title = input<string>('กำลังดำเนินการอัปเดต');

  selectedField = signal<string | null>(null);
  selectedDetails = signal<string | null>(null);
  // 1. เพิ่ม signal สำหรับเก็บสถานะ
  // progressStatus = signal<{ processed: number; total: number } | null>(null);

  async startUpdate() {
    const field = this.selectedField();
    const details = this.selectedDetails();

    if (!this.selectedField || !this.selectedDetails) {
      this.toast.show('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

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

}
