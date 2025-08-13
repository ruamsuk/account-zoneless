import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FinancialService } from '../services/financial.service';
import { LoadingService } from '../services/loading.service';
import { MonthlySummary } from '../models/account.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { Transaction } from '../models/transection.model';
import { MonthlyDetailModal } from './monthly-detail-modal';
import { DateUtilityService } from '../services/date-utility.service';


@Component({
  selector: 'app-annual-report',
  imports: [
    NgClass,
    FormsModule,
    DecimalPipe,
    MonthlyDetailModal
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <h1 class="text-3xl font-thasadith font-bold text-gray-800 dark:text-gray-200 mb-6">รายงานสรุปประจำปี (Cash)</h1>

      <!-- Filter Controls -->
      <div class="mb-4 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800 max-w-4xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div>
            <label class="form-label">ปี (พ.ศ.)</label>
            <select class="form-input" [(ngModel)]="selectedYearBE">
              @for (year of yearRange; track $index) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>
          <div>
            <label class="form-label">รายละเอียด</label>
            <select class="form-input" [(ngModel)]="selectedDetail">
              <option [ngValue]="null">-- ทั้งหมด --</option>
              @for (detail of uniqueDetails(); track $index) {
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
            <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <p class="text-sm text-green-700 dark:text-green-300">รายรับรวมทั้งปี</p>
              <p
                class="text-2xl font-bold text-green-800 dark:text-green-200">{{ annualSummary().totalIncome | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-300">รายจ่ายรวมทั้งปี</p>
              <p
                class="text-2xl font-bold text-red-800 dark:text-red-200">{{ annualSummary().totalExpense | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 rounded-lg"
                 [ngClass]="annualSummary().balance >= 0 ? ['bg-blue-50 dark:bg-blue-900/50'] : ['bg-orange-50 dark:bg-orange-900/50']">
              <p class="text-sm"
                 [ngClass]="annualSummary().balance >= 0 ? ['text-blue-700 dark:text-blue-300'] : ['text-orange-700 dark:text-orange-300']">
                คงเหลือ (ดุล)</p>
              <p class="text-2xl font-bold"
                 [ngClass]="annualSummary().balance >= 0 ? ['text-blue-800 dark:text-blue-200'] : ['text-orange-800 dark:text-orange-200']">{{ annualSummary().balance | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Analysis Section -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-base">
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="font-semibold text-gray-700 dark:text-gray-200">รายรับสูงสุด</p>
              <p class="text-gray-600 dark:text-gray-400">{{ analysis().maxIncome.month }}
                ({{ analysis().maxIncome.amount | number:'1.2-2' }})</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="font-semibold text-gray-700 dark:text-gray-200">รายจ่ายสูงสุด</p>
              <p class="text-gray-600 dark:text-gray-400">{{ analysis().maxExpense.month }}
                ({{ analysis().maxExpense.amount | number:'1.2-2' }})</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="font-semibold text-gray-700 dark:text-gray-200">รายรับต่ำสุด</p>
              <p class="text-gray-600 dark:text-gray-400">{{ analysis().minIncome.month }}
                ({{ analysis().minIncome.amount | number:'1.2-2' }})</p>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p class="font-semibold text-gray-700 dark:text-gray-200">รายจ่ายต่ำสุด</p>
              <p class="text-gray-600 dark:text-gray-400">{{ analysis().minExpense.month }}
                ({{ analysis().minExpense.amount | number:'1.2-2' }})</p>
            </div>
          </div>

          <!-- Monthly Breakdown Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-100 dark:bg-gray-700">
              <tr class="text-left text-base font-semibold text-gray-600 dark:text-gray-300">
                <th class="p-3">เดือน</th>
                <th class="p-3 text-right">รายรับ</th>
                <th class="p-3 text-right">รายจ่าย</th>
                <th class="p-3 text-right">
                  คงเหลือ (ดุล)
                </th>
              </tr>
              </thead>
              <tbody>
                @for (summary of monthlyBreakdown(); track $index) {
                  <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      (click)="doDetail(summary)">
                    <td class="p-3 font-semibold dark:text-gray-200">{{ summary.month }}</td>
                    <td
                      class="p-3 text-right text-green-600 dark:text-green-400">{{ summary.income | number:'1.2-2' }}
                    </td>
                    <td class="p-3 text-right text-red-600 dark:text-red-500">{{ summary.expense | number:'1.2-2' }}
                    </td>
                    <td class="p-3 text-right font-semibold"
                        [ngClass]="summary.balance >= 0 ? ['text-blue-600 dark:text-blue-400'] : ['text-orange-600 dark:text-orange-500']">{{ summary.balance | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot class="bg-gray-100 dark:bg-gray-700">
              <tr class="border-b-2 ">
                <td class="p-3 font-semibold dark:text-gray-200">รวมทั้งปี</td>
                <td class="p-3 text-right font-bold text-green-700 dark:text-green-300">
                  {{ annualSummary().totalIncome | number:'1.2-2' }}
                </td>
                <td class="p-3 text-right font-bold text-red-700 dark:text-red-300">
                  {{ annualSummary().totalExpense | number:'1.2-2' }}
                </td>
                <td class="p-3 text-right font-bold"
                    [ngClass]="annualSummary().balance >= 0 ? ['text-blue-700 dark:text-blue-300'] : ['text-orange-700 dark:text-orange-300']">
                  {{ annualSummary().balance | number:'1.2-2' }}
                </td>
              </tfoot>
            </table>
          </div>
        </div>
      }
    </main>

    <!-- Detail Modal -->
    <app-monthly-detail-modal
      [isOpen]="isDetailModalOpen()"
      [monthName]="selectedMonthName()"
      [yearBE]="selectedYearForDetail()"
      [transactions]="selectedMonthTransactions()"
      (close)="closeDetailModal()">
    </app-monthly-detail-modal>
  `,
  styles: ``
})
export class CashAnnualReport implements OnInit {
  private financialService = inject(FinancialService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private dateUtilityService = inject(DateUtilityService);

// --- State Signal for Modal ---
  isDetailModalOpen = signal(false);
  selectedMonthTransactions = signal<Transaction[]>([]);
  selectedMonthName = signal('');
  selectedYearForDetail = signal(0);

  // --- Filter State ---
  selectedYearBE = signal(new Date().getFullYear() + 543);
  selectedDetail = signal<string | null>(null);

  // --- Data State ---
  monthlyBreakdown = signal<MonthlySummary[]>([]);
  uniqueDetails = signal<string[]>([]);

  // --- Static Data for Dropdown ---
  readonly months = this.dateUtilityService.getMonths();
  readonly yearRange: number[] = this.dateUtilityService.getYearRange(10);

  // --- Computed Signals for Summary & Analysis ---
  annualSummary = computed(() => {
    const breakdown = this.monthlyBreakdown();
    const totalIncome = breakdown.reduce((sum, m) => sum + parseFloat(String(m.income) || '0'), 0);
    const totalExpense = breakdown.reduce((sum, m) => sum + parseFloat(String(m.expense) || '0'), 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  });

  analysis = computed(() => {
    const breakdown = this.monthlyBreakdown();
    if (breakdown.length === 0) {
      return {
        maxIncome: {month: '-', amount: 0},
        maxExpense: {month: '-', amount: 0},
        minIncome: {month: '-', amount: 0},
        minExpense: {month: '-', amount: 0}
      };
    }

    // ใช้ parseFloat() เพื่อแปลงค่าก่อนเปรียบเทียบ
    const maxIncome = breakdown.reduce((max, m) =>
      parseFloat(String(m.income) || '0') > parseFloat(String(max.income) || '0') ? m : max, breakdown[0]
    );
    const maxExpense = breakdown.reduce((max, m) =>
      parseFloat(String(m.expense) || '0') > parseFloat(String(max.expense) || '0') ? m : max, breakdown[0]
    );
    const minIncome = breakdown.reduce((min, m) =>
      parseFloat(String(m.income) || '0') < parseFloat(String(min.income) || '0') ? m : min, breakdown[0]
    );
    const minExpense = breakdown.reduce((min, m) =>
      parseFloat(String(m.expense) || '0') < parseFloat(String(min.expense) || '0') ? m : min, breakdown[0]
    );
    /**/
    //const maxIncome = breakdown.reduce((max, m) => m.income > max.income ? m : max, breakdown[0]);
    //const maxExpense = breakdown.reduce((max, m) => m.expense > max.expense ? m : max, breakdown[0]);
    //const minIncome = breakdown.reduce((min, m) => m.income < min.income ? m : min, breakdown[0]);
    //const minExpense = breakdown.reduce((min, m) => m.expense < min.expense ? m : min, breakdown[0]);
    return {
      maxIncome: {month: maxIncome.month, amount: maxIncome.income},
      maxExpense: {month: maxExpense.month, amount: maxExpense.expense},
      minIncome: {month: minIncome.month, amount: minIncome.income},
      minExpense: {month: minExpense.month, amount: minExpense.expense}
    };
  });

  constructor() {
    // สร้างรายการปี พ.ศ. ย้อนหลัง 10 ปี
    const currentYearBE = new Date().getFullYear() + 543;
    for (let i = 0; i < 10; i++) {
      this.yearRange.push(currentYearBE - i);
    }
  }

  ngOnInit(): void {
    this.financialService.getUniqueDetails().then(details => {
      this.uniqueDetails.set(details);
    });
  }

  async generateReport(): Promise<void> {
    this.loadingService.show();
    this.monthlyBreakdown.set([]); // เคลียร์ข้อมูลเก่า
    try {
      const yearCE = this.selectedYearBE() - 543;

      // 1. ดึงช่วงวันที่ของทั้ง 12 เดือน
      const monthlyRanges = await this.financialService.getAnnualMonthlyRanges(yearCE);
      if (monthlyRanges.length === 0) return;

      // 2. สร้าง Promise array สำหรับดึงข้อมูลธุรกรรมของแต่ละเดือนพร้อมกัน
      const transactionPromises = monthlyRanges.map(range =>
        this.financialService.getTransactionsByFilter(range.datestart, range.dateend, this.selectedDetail())
      );

      // 3. รอให้ข้อมูลทั้งหมดมาถึง
      const monthlyTransactionsArray = await Promise.all(transactionPromises);

      // 4. ประมวลผลข้อมูล
      const breakdownResult = monthlyRanges.map((range, index) => {
        const transactions = monthlyTransactionsArray[index];
        const income = transactions
          .filter(t => t.isInCome)
          .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);

        const expense = transactions
          .filter(t => !t.isInCome)
          .reduce((sum, t) => sum + parseFloat(String(t.amount) || '0'), 0);
        return {
          month: range.month,
          income,
          expense,
          balance: income - expense
        };
      });

      this.monthlyBreakdown.set(breakdownResult);

    } catch (error) {
      this.monthlyBreakdown.set([]); // เคลียร์ข้อมูลหากเกิดข้อผิดพลาด
      console.error('Error generating annual report:', error);
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการดึงข้อมูล' + error, 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async doDetail(summary: MonthlySummary): Promise<void> {
    this.loadingService.show();
    try {
      const yearCE = this.selectedYearBE() - 543;
      // แปลงชื่อเดือนกลับเป็น index
      const monthIndex = this.months.findIndex(m => m.name === summary.month);

      if (monthIndex === -1) {
        // 1. จัดการ Error โดยตรง: แจ้งเตือน
        this.toastService.show('Error', 'ชื่อเดือนไม่ถูกต้อง', 'error');
        console.error('Invalid month name:', summary.month);
        // 2. หยุดการทำงานของฟังก์ชัน
        return;
      }

      const dateRange = await this.financialService.getAnnualMonthlyRanges(yearCE);
      const specificMonthRange = dateRange?.find(r => r.month === summary.month);

      if (!dateRange) {
        this.toastService.show('Info', 'ไม่พบข้อมูลในช่วงที่เลือก', 'info');
        console.log(`Date range not found for ${summary.month} ${yearCE + 543}`);
        return;
      }
      // ดึงข้อมูลธุรกรรม
      const transactions = await this.financialService.getTransactionsByFilter(
        specificMonthRange?.datestart || new Date(),
        specificMonthRange?.dateend || new Date(),
        this.selectedDetail()
      );

      // ตั้งค่า State สำหรับ Modal
      this.selectedMonthName.set(summary.month);
      this.selectedYearForDetail.set(this.selectedYearBE());
      this.selectedMonthTransactions.set(transactions);

      // เปิด Modal
      this.isDetailModalOpen.set(true);

    } catch (error) {
      console.error('Error fetching details:', error);
      // this.toastService.showError(...)
    } finally {
      this.loadingService.hide();
    }
  }

  // ++ 7. เพิ่มเมธอดสำหรับปิด Modal ++
  closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
  }
}
