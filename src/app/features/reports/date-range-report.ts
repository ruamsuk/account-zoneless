import { Component, computed, inject, signal } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Account } from '../../models/account.model';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { tap } from 'rxjs';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';

@Component({
  selector: 'app-date-range-report',
  imports: [
    ThaiDatepicker,
    ReactiveFormsModule,
    DecimalPipe,
    NgClass,
    ThaiDatePipe
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <h1 class="text-3xl font-thasadith font-bold text-white text-shadow mb-6">รายงานตามช่วงเวลา</h1>
      <div class="flex items-center justify-center z-50">
        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()"
              class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
          <div>
            <label for="startDate" class="form-label">วันที่เริ่มต้น</label>
            <app-thai-datepicker id="startDate" formControlName="startDate"></app-thai-datepicker>
          </div>
          <div>
            <label for="endDate" class="form-label">วันที่สิ้นสุด</label>
            <app-thai-datepicker id="endDate" formControlName="endDate"></app-thai-datepicker>
          </div>
          <button type="submit" class="btn-primary mt-auto">ดูรายงาน</button>
        </form>
      </div>
      @if (accounts()) {
        <div
          class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center z-0">
          <div>
            <h3 class="text-lg font-semibold text-green-700 dark:text-green-400">รายรับรวม</h3>
            <p
              class="text-2xl font-bold text-green-600 dark:text-green-300">{{ summary().totalIncome | number:'1.2-2' }}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-red-700 dark:text-red-400">รายจ่ายรวม</h3>
            <p
              class="text-2xl font-bold text-red-600 dark:text-red-300">{{ summary().totalExpense | number:'1.2-2' }}</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-400">คงเหลือ</h3>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-300">{{ summary().balance | number:'1.2-2' }}</p>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-8 z-0">
          <h2 class="text-2xl font-thasadith font-semibold text-green-700 dark:text-gray-200 mb-4">รายละเอียดข้อมูล</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
              <tr
                class="border-b-2 border-gray-400 font-thasadith text-lg text-amber-800 dark:text-gray-300 dark:border-gray-600">
                <th class="p-3 text-left font-semibold">วันที่</th>
                <th class="p-3 text-left font-semibold">รายการ</th>
                <th class="p-3 text-right font-semibold">จำนวนเงิน</th>
                <th class="pl-5 text-left font-semibold">หมายเหตุ</th>
                <th class="p-3 text-left font-semibold">ประเภท</th>
              </tr>
              </thead>
              <tbody>
                @for (acc of accounts(); track acc.id) {
                  <tr class="border-b dark:border-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/50"
                      [ngClass]="acc.isInCome ? ['bg-green-100/50 dark:bg-green-900/30'] : []">

                    <td class="p-3">{{ acc.date | thaiDate }}</td>
                    <td class="p-3">{{ acc.details }}</td>

                    <td class="p-3 text-right font-medium"
                        [ngClass]="acc.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-400']">
                      {{ acc.isInCome ? '+' : '-' }} {{ acc.amount | number:'1.2-2' }}
                    </td>
                    <td class="pl-5">{{ acc.remark }}</td>
                    <td class="p-3 font-medium text-green-600 dark:text-green-400">
                      @if (acc.isInCome) {
                        <span>รายรับ</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class DateRangeReport {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  reportForm: FormGroup;
  accounts = signal<Account[] | undefined>(undefined);

  summary = computed(() => {
    const data = this.accounts() ?? [];
    const totalIncome = data.filter(a => a.isInCome).reduce((sum, a) => sum + a.amount, 0);
    const totalExpense = data.filter(a => !a.isInCome).reduce((sum, a) => sum + a.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  });

  constructor() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.reportForm = this.fb.group({
      startDate: [firstDayOfMonth.toISOString().substring(0, 10)],
      endDate: [today.toISOString().substring(0, 10)]
    });
  }

  onSubmit() {
    if (this.reportForm.invalid) return;

    this.loadingService.show();

    const {startDate, endDate} = this.reportForm.value;

    if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
      this.toastService.show('Error', 'รูปแบบวันที่ไม่ถูกต้อง', 'error');
      return;
    }

    this.accountService.getAccountsByDateRange(startDate, endDate)
      .pipe(
        tap(() => {
          this.loadingService.hide();
        }),
      )
      .subscribe({
        next: (accounts) => {
          // จัดการกรณีสำเร็จที่นี่ที่เดียว
          this.accounts.set(accounts);
        },
        complete: () => {
          // อาจจะมีการทำงานเพิ่มเติมเมื่อเสร็จสิ้น
          this.toastService.show('Success', 'ดึงข้อมูลเรียบร้อยแล้ว', 'success');
        },
        error: (err) => {
          // จัดการกรณีล้มเหลวที่นี่ที่เดียว
          console.error('Error fetching accounts:', err);
          this.toastService.show('Error', 'ไม่สามารถดึงข้อมูลได้', 'error');
          this.accounts.set([]); // อาจจะเคลียร์ข้อมูลเก่าในตาราง
        }
      });
  }

}
