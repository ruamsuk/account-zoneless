import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { Transaction } from '../../models/transection.model';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-monthly-detail-modal',
  imports: [
    ThaiDatePipe,
    DecimalPipe,
    NgClass
  ],
  template: `
    @if (isOpen()) {
      <div (click)="onClose()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col dark:bg-gray-800">
          <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
            รายละเอียดเดือน {{ monthName() }} พ.ศ. {{ yearBE() }}
          </h2>

          <!-- Summary Cards -->
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
                คงเหลือ
              </p>
              <p class="text-2xl font-bold"
                 [ngClass]="balance() >= 0 ? ['text-blue-800 dark:text-blue-200'] : ['text-orange-800 dark:text-orange-200']">
                {{ balance() | number:'1.2-2' }}
              </p>
            </div>
          </div>

          <!-- Transaction Table -->
          <div class="flex-1 overflow-y-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th class="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">วันที่</th>
                <th class="p-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">รายละเอียด</th>
                <th class="p-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">จำนวนเงิน</th>
              </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr class="border-b dark:border-gray-700">
                    <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ tx.date | thaiDate }}</td>
                    <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ tx.details }}</td>
                    <td class="p-3 text-right text-sm"
                        [ngClass]="tx.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                      {{ tx.amount | number:'1.2-2' }}
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
export class MonthlyDetailModal {
  isOpen = input<boolean>(false);
  monthName = input<string>('');
  yearBE = input<number>(0);
  transactions = input<Transaction[]>([]);
  @Output() close = new EventEmitter<void>();

  // --- Computed Signals for Summary ---
  totalIncome = computed(() =>
    this.transactions()
      .filter(t => t.isInCome)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  totalExpense = computed(() =>
    this.transactions()
      .filter(t => !t.isInCome)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  balance = computed(() => this.totalIncome() - this.totalExpense());

  onClose(): void {
    this.close.emit();
  }
}
