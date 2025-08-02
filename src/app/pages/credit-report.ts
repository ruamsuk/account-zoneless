import { Component, computed, inject, signal } from '@angular/core';
import { CreditService } from '../services/credit.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { CreditData } from '../models/credit.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-report',
  imports: [
    NgClass,
    DecimalPipe,
    ThaiDatePipe,
    FormsModule
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <h1 class="text-3xl font-thasadith font-bold text-gray-800 dark:text-gray-200 mb-6 lg:text-center sm:ml-8">
        รายงานใช้จ่ายบัตรเครดิต</h1>

      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800 max-w-4xl mx-auto">

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label class="form-label">เดือน</label>
            <select class="form-input" [(ngModel)]="selectedMonth">
              @for (month of months; track month.value) {
                <option [value]="month.value">{{ month.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="form-label">ปี (พ.ศ.)</label>
            <select class="form-input" [(ngModel)]="selectedYearBE">
              @for (year of yearRange; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>
          <div>
            <button (click)="generateReport()" class="btn-primary w-full">แสดงรายงาน</button>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      @if (transactions()) {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
          @if (transactions()!.length > 0) {
            <!-- Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
              <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <p class="text-base text-red-700 dark:text-red-300">ยอดใช้จ่ายรวม</p>
                <p class="text-2xl font-bold text-red-800 dark:text-red-200">{{ totalExpense() | number:'1.2-2' }}</p>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <p class="text-base text-green-700 dark:text-green-300">Cashback/ส่วนลด</p>
                <p
                  class="text-2xl font-bold text-green-800 dark:text-green-200">{{ totalCashback() | number:'1.2-2' }}</p>
              </div>
              <div class="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <p class="text-base text-blue-700 dark:text-blue-300">ยอดสุทธิ</p>
                <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">{{ netExpense() | number:'1.2-2' }}</p>
              </div>
            </div>
            <!-- Transaction Table -->
            <div class="overflow-x-auto max-w-4xl mx-auto">
              <table class="min-w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="table-header">วันที่</th>
                  <th class="table-header">รายละเอียด</th>
                  <th class="table-header text-right">จำนวนเงิน</th>
                </tr>
                </thead>
                <tbody>
                  @for (tx of transactions(); track tx.id) {
                    <tr class="border-b dark:border-gray-700"
                        [ngClass]="tx.isCashback ? ['bg-green-50 dark:bg-green-900/20'] : ['']">
                      <td class="p-3 text-base text-gray-700 dark:text-gray-300">{{ tx.date | thaiDate }}</td>
                      <td class="p-3 text-base text-gray-700 dark:text-gray-300">{{ tx.details }}</td>
                      <td class="p-3 text-right text-base"
                          [ngClass]="tx.isCashback ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                        {{ tx.isCashback ? '+' : '-' }} {{ tx.amount | number:'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-center text-gray-500 dark:text-gray-400 py-8">
              ไม่พบข้อมูลการใช้จ่ายบัตรเครดิตในเดือนที่เลือก</p>
          }
        </div>
      }
    </main>
  `,
  styles: ``
})
export class CreditReport {
  private creditService = inject(CreditService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  // --- Filter State ---
  selectedMonth = signal(new Date().getMonth());
  selectedYearBE = signal(new Date().getFullYear() + 543);

  // --- Data State ---
  transactions = signal<CreditData[] | null>(null); // null = ยังไม่ได้ค้นหา

  // --- Data for Dropdowns ---
  readonly months = [
    {value: 0, name: 'มกราคม'}, {value: 1, name: 'กุมภาพันธ์'},
    {value: 2, name: 'มีนาคม'}, {value: 3, name: 'เมษายน'},
    {value: 4, name: 'พฤษภาคม'}, {value: 5, name: 'มิถุนายน'},
    {value: 6, name: 'กรกฎาคม'}, {value: 7, name: 'สิงหาคม'},
    {value: 8, name: 'กันยายน'}, {value: 9, name: 'ตุลาคม'},
    {value: 10, name: 'พฤศจิกายน'}, {value: 11, name: 'ธันวาคม'}
  ];
  readonly yearRange: number[] = [];

  // --- Computed Signals for Summary ---
  totalExpense = computed(() =>
    (this.transactions() ?? [])
      .filter(t => !t.isCashback)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  totalCashback = computed(() =>
    (this.transactions() ?? [])
      .filter(t => t.isCashback)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  netExpense = computed(() => this.totalExpense() - this.totalCashback());

  constructor() {
    const currentYearBE = new Date().getFullYear() + 543;
    for (let i = 0; i < 10; i++) {
      this.yearRange.push(currentYearBE - i);
    }
  }

  async generateReport(): Promise<void> {
    this.loadingService.show();
    this.transactions.set([]); // Reset transactions before fetching

    try {
      const yearCE = this.selectedYearBE() - 543;
      const results = await this.creditService.getTransactionsByMonth(
        this.selectedMonth(),
        yearCE
      );
      this.transactions.set(results);
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      this.toastService.show('Error', 'ไม่สามารถดึงข้อมูลธุรกรรมบัตรเครดิตได้', 'error');
      this.transactions.set([]);
    } finally {
      this.loadingService.hide();
    }
  }
}
