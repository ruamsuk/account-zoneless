import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { CreditData } from '../../models/credit.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';

@Component({
  selector: 'app-credit-monthly-detail-modal',
  imports: [
    NgClass,
    DecimalPipe,
    ThaiDatePipe
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col dark:bg-gray-800">
          <h2 class="text-xl md:text-2xl font-thasadith font-semibold text-gray-700 dark:text-gray-200 mb-6">
            รายละเอียดเดือน {{ monthName() }} พ.ศ. {{ yearBE() }}
          </h2>

          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
            <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-300">ยอดใช้จ่ายรวม</p>
              <p class="text-2xl font-bold text-red-800 dark:text-red-200">{{ totalExpense() | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <p class="text-sm text-green-700 dark:text-green-300">Cashback/ส่วนลด</p>
              <p
                class="text-2xl font-bold text-green-800 dark:text-green-200">{{ totalCashback() | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">ยอดสุทธิ</p>
              <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">{{ netExpense() | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Transaction Table -->
          <div class="flex-1 overflow-y-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th class="table-header text-left">วันที่</th>
                <th class="table-header text-left">รายละเอียด</th>
                <th class="table-header text-right">จำนวนเงิน</th>
              </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr class="border-b dark:border-gray-700"
                      [ngClass]="tx.isCashback ? ['bg-green-50 dark:bg-green-900/20'] : ['bg-red-50 dark:bg-red-900/20']">
                    <td
                      class="p-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ tx.date | thaiDate:'short' }}
                    </td>
                    <td class="p-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ tx.details }}</td>
                    <td class="p-3 whitespace-nowrap text-right text-sm"
                        [ngClass]="tx.isCashback ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                      {{ tx.isCashback ? '+' : '-' }} {{ tx.amount | number:'1.2-2' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Action Button -->
          <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
            <button type="button" (click)="onClose()" class="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class CreditMonthlyDetailModal {
// --- Inputs & Outputs ---
  isOpen = input<boolean>(false);
  monthName = input<string>('');
  yearBE = input<number>(0);
  transactions = input<CreditData[]>([]);
  @Output() close = new EventEmitter<void>();

  // --- Computed Signals for Summary ---
  totalExpense = computed(() =>
    this.transactions()
      .filter(t => !t.isCashback)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  totalCashback = computed(() =>
    this.transactions()
      .filter(t => t.isCashback)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  netExpense = computed(() => this.totalExpense() - this.totalCashback());

  onClose(): void {
    this.close.emit();
  }
}
