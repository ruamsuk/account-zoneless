import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { Transaction } from '../models/transection.model';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { FinancialService } from '../services/financial.service';
import { DateUtilityService } from '../services/date-utility.service';

@Component({
  selector: 'app-financial-report',
  imports: [
    ThaiDatePipe,
    DecimalPipe,
    NgClass,
    FormsModule
  ],
  template: `
    <main class="max-w-5xl mx-auto p-4 md:p-8">
      <div class="container mx-auto px-4 md:px-8">
        <h1 class="text-2xl md:text-3xl  font-thasadith font-bold text-gray-600  mb-6">
          รายงานรายรับ-รายจ่าย รายเดือน</h1>
      </div>

      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <!-- Month Selector -->
          <div>
            <label class="form-label">เดือน</label>
            <select class="form-input" [(ngModel)]="selectedMonth">
              @for (month of months; track month.value) {
                <option [value]="month.value">{{ month.name }}</option>
              }
            </select>
          </div>
          <!-- Year Selector -->
          <div>
            <label class="form-label">ปี (พ.ศ.)</label>
            <select class="form-input" [(ngModel)]="selectedYearBE">
              @for (year of yearRange; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>
          <!-- Detail Selector -->
          <div>
            <label class="form-label">รายละเอียด</label>
            <select class="form-input" [(ngModel)]="selectedDetail">
              <option [ngValue]="null">-- ทั้งหมด --</option>
              @for (detail of uniqueDetails(); track detail) {
                <option [value]="detail">{{ detail }}</option>
              }
            </select>
          </div>
          <!-- Search Button -->
          <div>
            <button (click)="search()" class="btn-primary w-full">ค้นหา</button>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      @if (transactions().length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <!-- Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
            <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <p class="text-sm text-green-700 dark:text-green-300">รายรับรวม</p>
              <p class="text-2xl font-bold text-green-800 dark:text-green-200">{{ totalIncome() | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-300">รายจ่ายรวม</p>
              <p class="text-2xl font-bold text-red-800 dark:text-red-200">{{ totalExpense() | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 rounded-lg"
                 [ngClass]="balance() >= 0 ? ['bg-blue-50 dark:bg-blue-900/50'] : ['bg-orange-50 dark:bg-orange-900/50']">
              <p class="text-sm"
                 [ngClass]="balance() >= 0 ? ['text-blue-700 dark:text-blue-300'] : ['text-orange-700 dark:text-orange-300']">
                คงเหลือ (สมดุล)</p>
              <p class="text-2xl font-bold"
                 [ngClass]="balance() >= 0 ? ['text-blue-800 dark:text-blue-200'] : ['text-orange-800 dark:text-orange-200']">
                {{ balance() | number:'1.2-2' }}
              </p>
            </div>
          </div>
          <!-- Transaction Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-100 dark:bg-gray-700">
              <tr class="text-left text-base font-semibold text-gray-600 dark:text-gray-300">
                <th>#</th>
                <th class="p-3">วันที่</th>
                <th class="p-3">รายละเอียด</th>
                <th class="p-3">หมายเหตุ</th>
                <th class="p-3 text-right">
                  จำนวนเงิน
              </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id; let i = $index) {
                  <tr class="border-b dark:text-gray-200 dark:border-gray-700 hover:bg-black/20 dark:hover:bg-black/50"
                      [ngClass]="tx.isInCome ? ['bg-green-50 dark:bg-green-900/30'] : ['']">
                    <td class="p-3 whitespace-nowrap">{{ i + 1 }}</td>
                    <td class="p-3 whitespace-nowrap"
                        [ngClass]="tx.isInCome ? ['text-green-600 dark:text-green-400'] : ['']">{{ tx.date | thaiDate }}
                    </td>
                    <td class="p-3 whitespace-nowrap"
                        [ngClass]="tx.isInCome ? ['text-green-600 dark:text-green-400'] : ['']">{{ tx.details }}
                    </td>
                    <td class="p-3 whitespace-nowrap"
                        [ngClass]="tx.isInCome ? ['text-green-600 dark:text-green-400'] : ['']">{{ tx.remark }}
                    </td>
                    <td class="p-3 whitespace-nowrap text-right"
                        [ngClass]="tx.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-400']">
                      {{ tx.amount | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      @if (!isFound()) {
        <p class="text-center text-xl text-gray-900">
          ไม่พบข้อมูลที่เลือก ลองเลือกใหม่
        </p>
      }

    </main>
  `,
  styles: ``
})
export class FinancialReport implements OnInit {
  private financialService = inject(FinancialService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private dateUtilityService = inject(DateUtilityService);

  // --- Filter State ---
  selectedMonth = signal(new Date().getMonth());
  selectedYearBE = signal(new Date().getFullYear() + 543);
  selectedDetail = signal<string | null>(null);

  // --- Data State ---
  transactions = signal<Transaction[]>([]);
  uniqueDetails = signal<string[]>([]);
  isFound = signal(true);

  // --- Data for Dropdowns ---
  readonly months = this.dateUtilityService.getMonths();
  readonly yearRange = this.dateUtilityService.getYearRange(10) as number[];

// --- Computed Signals for Summary ---
  totalIncome = computed(() =>
    this.transactions()
      .filter(t => t.isInCome) // ใช้ isInCome ที่เป็น boolean
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0)
  );
  totalExpense = computed(() =>
    this.transactions()
      .filter(t => !t.isInCome) // ใช้ !isInCome สำหรับรายจ่าย
      .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0)
  );
  balance = computed(() => this.totalIncome() - this.totalExpense());

  constructor() {
  }

  ngOnInit(): void {
    // โหลดรายการ details ที่ไม่ซ้ำกัน
    this.financialService.getUniqueDetails().then(details => {
      this.uniqueDetails.set(details);
    });
  }

  /**
   *  ค้นหาธุรกรรมตามเดือน, ปี และรายละเอียดที่เลือก
   *  - แปลงปี พ.ศ. เป็น ค.ศ. โดยลบ 543
   *  - เรียกใช้บริการเพื่อดึงข้อมูลธุรกรรม
   *  - แสดงผลลัพธ์ใน transactions
   *  - จัดการสถานะการโหลดด้วย LoadingService
   *  - จัดการข้อผิดพลาดโดยเคลียร์ผลลัพธ์
   *    ถ้าเกิดข้อผิดพลาด
   *    * @returns Promise<void>
   *    * @throws Error ถ้าเกิดข้อผิดพลาดในการดึงข้อมูล
   * */
  async search(): Promise<void> {
    this.loadingService.show();
    this.transactions.set([]); // เคลียร์ข้อมูลเก่าก่อน
    this.isFound.set(true);

    try {
      const yearCE = this.selectedYearBE() - 543;
      // 1. ไปดึงช่วงวันที่ที่ถูกต้องมาก่อน
      const dateRange = await this.financialService.getMonthlyDateRange(
        this.selectedMonth(),
        yearCE
      );

      if (!dateRange) {
        console.warn('ไม่พบช่วงวันที่สำหรับเดือนและปีที่เลือก');
        this.transactions.set([]);
        return;
      }
      // 3. นำช่วงวันที่ที่ได้ไปใช้ในการค้นหาธุรกรรม
      const results = await this.financialService.getTransactionsByFilter(
        dateRange.startDate,
        dateRange.endDate,
        this.selectedDetail()
      );

      this.transactions.set(results);
    } catch (error) {
      this.toastService.show('Error', 'Error fetching transactions:' + error, 'error');
      console.error('Error fetching transactions:', error);
      this.transactions.set([]); // เคลียร์ผลลัพธ์ถ้าเกิด error
    } finally {
      this.loadingService.hide();
      if (this.transactions().length == 0) this.isFound.set(false);
    }
  }
}
