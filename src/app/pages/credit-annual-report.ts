import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MonthSummary } from '../models/credit.model';
import { CreditService } from '../services/credit.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CreditMonthlyDetailModal } from './credit-monthly-detail-modal';
import { DateUtilityService } from '../services/date-utility.service';

interface AnnualReportRow extends MonthSummary {
  month: string;
  balance: number;
}

@Component({
  selector: 'app-credit-annual-report',
  imports: [
    FormsModule,
    DecimalPipe,
    CreditMonthlyDetailModal
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <h1 class="hidden md:block text-3xl font-thasadith font-bold text-gray-800 dark:text-gray-200 mb-6">
        รายงานบัตรเครดิตประจำปี</h1>

      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800 max-w-4xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label class="form-label">ปี (พ.ศ.)</label>
            <select class="form-input" [(ngModel)]="selectedYearBE">
              @for (year of yearRange; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>
          <div>
            <label class="form-label">รายละเอียด</label>
            <select class="form-input" [(ngModel)]="selectedDetail">
              <option [ngValue]="null">-- ทั้งหมด --</option>
              @for (detail of uniqueDetails(); track detail) {
                <option [value]="detail">{{ detail }}</option>
              }
            </select>
          </div>
          <div>
            <button (click)="generateReport()" class="btn-primary w-full">สร้างรายงาน</button>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      @if (monthlyBreakdown().length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
          <!-- Annual Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
            <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-300">ยอดใช้จ่ายรวม</p>
              <p
                class="text-2xl font-bold text-red-800 dark:text-red-200">{{ annualSummary().totalExpense | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <p class="text-sm text-green-700 dark:text-green-300">Cashback รวม</p>
              <p
                class="text-2xl font-bold text-green-800 dark:text-green-200">{{ annualSummary().totalCashback | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">ยอดสุทธิ</p>
              <p
                class="text-2xl font-bold text-blue-800 dark:text-blue-200">{{ annualSummary().netExpense | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Monthly Breakdown Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="table-header">เดือน</th>
                <th class="table-header text-right">ยอดใช้จ่าย</th>
                <th class="table-header text-right">Cashback</th>
                <th class="table-header text-right">ยอดสุทธิ</th>
              </tr>
              </thead>
              <tbody>
                @for (summary of monthlyBreakdown(); track summary.month) {
                  <tr
                    class="text-gray-800 dark:text-gray-300 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    (click)="openDetailModal(summary)">
                    <td class="p-3 whitespace-nowrap font-semibold">{{ summary.month }}</td>
                    <td
                      class="p-3 whitespace-nowrap text-right text-red-600 dark:text-red-500">{{ summary.expense | number:'1.2-2' }}
                    </td>
                    <td
                      class="p-3 whitespace-nowrap text-right text-green-600 dark:text-green-400">{{ summary.cashback | number:'1.2-2' }}
                    </td>
                    <td
                      class="p-3 whitespace-nowrap text-right font-semibold text-blue-600 dark:text-blue-400">{{ summary.balance | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-100 dark:bg-gray-800">
              <tr class="border-b-2">
                <td class="p-3 font-semibold dark:text-gray-200">รวม</td>
                <td
                  class="p-3 text-right text-red-500 font-semibold">{{ annualSummary().totalExpense | number:'1.2-2' }}
                </td>
                <td
                  class="p-3 text-right text-green-500 font-semibold">{{ annualSummary().totalCashback | number:'1.2-2' }}
                </td>
                <td
                  class="p-3 text-right text-blue-600 font-semibold">{{ annualSummary().netExpense | number:'1.2-2' }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      }
    </main>

    <!-- Modal for Monthly Details -->
    <app-credit-monthly-detail-modal
      [isOpen]="isDetailModalOpen()"
      [monthName]="selectedMonthForDetail()?.month || ''"
      [yearBE]="selectedYearBE()"
      [transactions]="selectedMonthForDetail()?.transactions || []"
      (close)="closeDetailModal()">
    </app-credit-monthly-detail-modal>
  `,
  styles: ``
})
export class CreditAnnualReport implements OnInit {
  private creditService = inject(CreditService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private dateUtilityService = inject(DateUtilityService);
  private dateUtility = inject(DateUtilityService);

  // --- Filter State ---
  selectedYearBE = signal(new Date().getFullYear() + 543);
  selectedDetail = signal<string | null>(null);

  // --- Data State ---
  monthlyBreakdown = signal<AnnualReportRow[]>([]);
  uniqueDetails = signal<string[]>([]);

  // --- Modal State ---
  isDetailModalOpen = signal(false);
  selectedMonthForDetail = signal<AnnualReportRow | null>(null);

  readonly yearRange = this.dateUtilityService.getYearRange(10);

  // --- Computed Signals for Summary ---
  annualSummary = computed(() => {
    const breakdown = this.monthlyBreakdown();
    const totalExpense = breakdown
      .reduce((sum, m) => sum + parseFloat(String(m.expense) || '0'), 0);
    const totalCashback = breakdown
      .reduce((sum, m) => sum + parseFloat(String(m.cashback) || '0'), 0);
    return {
      totalExpense,
      totalCashback,
      netExpense: totalExpense - totalCashback
    };
  });

  constructor() {
  }

  ngOnInit(): void {
    this.creditService.getUniqueDetails().then(details => {
      this.uniqueDetails.set(details);
    });
  }

  async generateReport(): Promise<void> {
    this.loadingService.show();
    this.monthlyBreakdown.set([]);
    try {
      const yearCE = this.selectedYearBE() - 543;

      // 1. ดึงข้อมูลทั้งหมดของปีนั้นๆ มาในครั้งเดียว
      const allTransactionsForYear = await this.creditService.getTransactionsByBillingYear(yearCE);

      // (ทางเลือก) กรองตาม details ถ้ามีการเลือก
      let filteredTransactions = allTransactionsForYear;
      if (this.selectedDetail()) {
        filteredTransactions = allTransactionsForYear.filter(tx => tx.details.trim() === this.selectedDetail()!.trim());
      }

      // 2. จัดกลุ่มข้อมูลออกเป็น 12 เดือนในฝั่ง Client
      const breakdownResult: AnnualReportRow[] = [];
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthName = this.getMonthName(monthIndex);

        // 3. แปลงช่วงวันที่ของ "รอบบิล" ให้เป็นตัวเลขมิลลิวินาที
        const monthStartTime = new Date(yearCE, monthIndex - 1, 13).getTime();
        const monthEndTime = new Date(yearCE, monthIndex, 12, 23, 59, 59).getTime();

        // 4. กรองธุรกรรมโดยการเปรียบเทียบ "ตัวเลข"
        const transactionsForThisMonth = filteredTransactions.filter(tx => {
          // 1. แปลง Timestamp เป็น Date object ก่อน
          const txDate = (tx.date as any).toDate();
          // 2. จากนั้นค่อยเรียก .getTime()
          const txTime = txDate.getTime();
          return txTime >= monthStartTime && txTime <= monthEndTime;
        });

        // คำนวณยอดสรุป
        const expense = transactionsForThisMonth.filter(t => !t.isCashback).reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);
        const cashback = transactionsForThisMonth.filter(t => t.isCashback).reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);

        breakdownResult.push({
          month: monthName,
          expense,
          cashback,
          balance: expense - cashback,
          transactions: transactionsForThisMonth
        });
      }

      this.monthlyBreakdown.set(breakdownResult);
    } catch (error) {
      console.error('Error generating annual report:', error);
      this.toastService.show('Error', 'ไม่สามารถสร้างรายงานได้: ' + error, 'error');
      this.monthlyBreakdown.set([]);
      this.selectedMonthForDetail.set(null);
      this.isDetailModalOpen.set(false);
      return;
    } finally {
      this.loadingService.hide();
    }
  }

  openDetailModal(summary: AnnualReportRow): void {
    this.selectedMonthForDetail.set(summary);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
  }

  private getMonthName(monthIndex: number): string {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return months[monthIndex];
  }
}
