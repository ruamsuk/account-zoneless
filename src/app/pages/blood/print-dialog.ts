import { Component, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BloodService } from '../../services/blood.service';
import { BloodPressure } from '../../models/blood-pressure.model';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-print-dialog',
  imports: [
    ReactiveFormsModule,
    ThaiDatepicker,
    ThaiDatePipe,
    NgClass
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="dialog-container bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-4xl mx-auto max-h-[90vh] flex flex-col dark:bg-gray-800">

          <!-- ส่วนหัวของ Modal (จะไม่ถูกพิมพ์) -->
          <div class="print-hide">
            <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">พิมพ์รายงานความดันโลหิต</h2>
            <form [formGroup]="dateRangeForm" (ngSubmit)="generateReport()"
                  class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
              <div>
                <label class="form-label">วันเริ่มต้น</label>
                <app-thai-datepicker formControlName="startDate"></app-thai-datepicker>
              </div>
              <div>
                <label class="form-label">วันสิ้นสุด</label>
                <app-thai-datepicker formControlName="endDate"></app-thai-datepicker>
              </div>
              <button type="submit" [disabled]="dateRangeForm.invalid" class="btn-primary">แสดงตัวอย่าง</button>
            </form>
          </div>

          <!-- ส่วนแสดงผลรายงาน (ที่จะถูกพิมพ์) -->
          <div #printArea class="printable-area flex-1 overflow-y-auto dark:border-gray-700 pt-4">
            @if (reportData()) {
              <h3 class="text-xl font-bold text-center dark:text-gray-300 mb-4">รายงานความดันโลหิต</h3>
              <p class="text-center mb-4 dark:text-gray-300">
                ช่วงวันที่: {{ dateRangeForm.value.startDate | thaiDate:'fullMonth' }}
                - {{ dateRangeForm.value.endDate | thaiDate:'fullMonth' }}</p>
              <table class="min-w-full text-base border-collapse">
                <thead class="bg-gray-50 dark:bg-gray-700/50">
                <!-- Complex Header -->
                <tr class="first:border-t">
                  <th rowspan="3" class="table-header w-[25%]">Date</th>
                </tr>
                <tr>
                  <th colspan="2" class="table-header text-center border-x dark:border-gray-600">
                    <div class="">Morning</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-normal">(Before medicine)</div>
                  </th>
                  <th colspan="2" class="table-header text-center  dark:border-gray-600">
                    <div class="">Evening</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-normal">(After medicine)</div>
                  </th>
                </tr>
                <tr>
                  <th class="table-header text-center border-l dark:border-gray-600 w-[18.75%]">BP1</th>
                  <th class="table-header text-center border-r dark:border-gray-600 w-[18.75%]">BP2</th>
                  <th class="table-header text-center w-[18.75%]">BP1</th>
                  <th class="table-header text-center dark:border-gray-600 w-[18.75%]">BP2</th>
                </tr>
                </thead>
                <tbody>
                  @for (item of reportData(); track $index) {
                    <tr class="border-t last:border-b dark:border-gray-700 dark:text-gray-300">
                      <td class="table-cell font-semibold">{{ item.date | thaiDate }}</td>
                      <td class="table-cell border-l dark:border-gray-600">
                        <div [ngClass]="isBloodPressureHigh(item.morning.bp1) ? 'high-bp' : 'normal-bp'">
                          {{ formatReading(item.morning.bp1) }}
                        </div>
                      </td>
                      <td class="table-cell">
                        <div [ngClass]="isBloodPressureHigh(item.morning.bp2) ? 'high-bp' : 'normal-bp'">
                          {{ formatReading(item.morning.bp2) }}
                        </div>
                      </td>
                      <td class="table-cell border-l dark:border-gray-600">
                        <div [ngClass]="isBloodPressureHigh(item.evening.bp1) ? 'high-bp' : 'normal-bp'">
                          {{ formatReading(item.evening.bp1) }}
                        </div>
                      </td>
                      <td class="table-cell">
                        <div [ngClass]="isBloodPressureHigh(item.evening.bp2) ? 'high-bp' : 'normal-bp'">
                          {{ formatReading(item.evening.bp2) }}
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="text-center text-gray-500 dark:text-gray-400 py-8">กรุณาเลือกช่วงวันที่แล้วกด "แสดงตัวอย่าง"</p>
            }
          </div>

          <!-- ส่วนท้ายของ Modal (จะไม่ถูกพิมพ์) -->
          <div class="print-hide flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
            <button type="button" (click)="onClose()" class="btn-secondary">Close</button>
            <button type="button" (click)="printReport()" [disabled]="!reportData()"
                    class="btn-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd"
                      d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.74.14 1.095.282.355.143.66.348.905.602a4.004 4.004 0 0 1 1.595 5.565A4.004 4.004 0 0 1 15.25 19h-3.5a.75.75 0 0 1 0-1.5h3.5a2.5 2.5 0 1 0 0-5h-10a2.5 2.5 0 1 0 0 5h3.5a.75.75 0 0 1 0 1.5h-3.5A4.004 4.004 0 0 1 2 12.75a4.004 4.004 0 0 1 1.595-5.565c.244-.254.55-.459.905-.602.355-.142.718-.236 1.095-.282V2.75ZM6.5 4.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM15 7.75a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 1.5 0v3.5Z"
                      clip-rule="evenodd"/>
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class PrintDialog {
  private fb = inject(FormBuilder);
  private bpService = inject(BloodService);

  isOpen = input<boolean>(false);
  @Output() close = new EventEmitter<void>();

  dateRangeForm: FormGroup;
  reportData = signal<BloodPressure[] | null>(null);

  constructor() {
    this.dateRangeForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });
  }

  async generateReport(): Promise<void> {
    if (this.dateRangeForm.invalid) return;
    const {startDate, endDate} = this.dateRangeForm.value;
    const data = await this.bpService.getTransactionsByDateRange(startDate, endDate);
    this.reportData.set(data);
  }

  printReport(): void {
    window.print();
  }

  onClose(): void {
    this.reportData.set(null); // เคลียร์ข้อมูลเมื่อปิด
    this.close.emit();
  }

  formatReading(reading: string | undefined | null): string {
    return reading || '-';
  }

  isBloodPressureHigh(reading: string | undefined | null): boolean {
    if (!reading) return false;
    const parts = reading.split(/[\/P\s]+/);
    if (parts.length < 2) return false;
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1], 10);
    return sys > 130 || dia > 80;
  }
}
