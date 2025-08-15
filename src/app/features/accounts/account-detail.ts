import { Component, input, output } from '@angular/core';
import { Account } from '../../models/account.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';

@Component({
  selector: 'app-account-detail',
  imports: [
    NgClass,
    DecimalPipe,
    ThaiDatePipe
  ],
  template: `
    @if (account()) {
      <div class="space-y-4">
        <div>
          <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">วันที่</h4>
          <p class="text-lg text-gray-800 dark:text-gray-200">{{ account()?.date | thaiDate }}</p>
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">รายละเอียด</h4>
          <p class="text-lg text-gray-800 dark:text-gray-200">{{ account()?.details }}</p>
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">จำนวนเงิน/บาท</h4>
          <p class="text-2xl font-bold" [ngClass]="account()?.isInCome ? ['text-green-600'] : ['text-red-600']">
            {{ account()?.isInCome ? '+' : '-' }} {{ account()?.amount | number:'1.2-2' }}
          </p>
        </div>
        @if (account()?.remark) {
          <div>
            <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">หมายเหตุ</h4>
            <p class="text-lg text-gray-800 dark:text-gray-200">{{ account()?.remark }}</p>
          </div>
        }
        <div>
          <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">วันที่บันทึก</h4>
          <p class="text-lg text-gray-800 dark:text-gray-200">{{ account()?.create | thaiDate: 'mediumdt' }}</p>
        </div>
        <div>
          <h4 class="text-lg font-medium text-gray-500 dark:text-gray-400">วันที่แก้ไข</h4>
          <p class="text-lg text-gray-800 dark:text-gray-200">{{ account()?.modify | thaiDate: 'mediumdt' }}</p>
        </div>
      </div>
      <div class="mt-6 text-right border-t dark:border-gray-700 pt-4">
        <button (click)="close.emit()" class="btn-secondary">ปิด</button>
      </div>
    }
  `,
  styles: ``
})
export class AccountDetail {
  account = input<Account | null>(null);
  close = output<void>();
}
