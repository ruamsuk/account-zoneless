import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Account } from '../../models/account.model';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { tap } from 'rxjs';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginationService } from '../../services/pagination.service';

@Component({
  selector: 'app-date-range-report',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    NgClass,
    ThaiDatePipe,
    ThaiDatepicker
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="container mx-auto px-4 md:px-8">
        <h1 class="text-2xl md:text-3xl font-thasadith font-bold text-white text-shadow mb-6">รายงานตามช่วงเวลา
          (Debit)</h1>
      </div>

      <!-- Filter Controls -->
      <div class="flex items-center justify-center">
        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()"
              class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center z-40">
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

      <!-- Result Display -->
      @if (accounts()) {
        <div class="p-4 sm:p-6 lg:p-8 z-0">
          <div class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-1 max-w-5xl mx-auto">

            <!-- Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
              <div class="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <p class="text-sm text-green-700 dark:text-green-300">รายรับรวม</p>
                <p
                  class="text-2xl font-bold text-green-800 dark:text-green-200">{{ summary().totalIncome | number:'1.2-2' }}</p>
              </div>
              <div class="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <p class="text-sm text-red-700 dark:text-red-300">รายจ่ายรวม</p>
                <p
                  class="text-2xl font-bold text-red-800 dark:text-red-200">{{ summary().totalExpense | number:'1.2-2' }}</p>
              </div>
              <div class="p-4 rounded-lg"
                   [ngClass]="summary().balance >= 0 ? ['bg-blue-50 dark:bg-blue-900/50'] : ['bg-orange-50 dark:bg-orange-900/50']">
                <p class="text-sm"
                   [ngClass]="summary().balance >= 0 ? ['text-blue-700 dark:text-blue-300'] : ['text-orange-700 dark:text-orange-300']">
                  คงเหลือ (สมดุล)</p>
                <p class="text-2xl font-bold"
                   [ngClass]="summary().balance >= 0 ? ['text-blue-800 dark:text-blue-200'] : ['text-orange-800 dark:text-orange-200']">
                  {{ summary().balance | number:'1.2-2' }}
                </p>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                <tr
                  class="border-b-2 border-gray-400 font-thasadith text-lg text-amber-800 dark:text-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-black/50">
                  <th class="p-3 text-left">#</th>
                  <th class="p-3 text-left font-semibold whitespace-nowrap">วันที่</th>
                  <th class="p-3 text-left font-semibold whitespace-nowrap">รายการ</th>
                  <th class="p-3 text-right font-semibold whitespace-nowrap">จำนวนเงิน</th>
                  <th class="pl-5 text-left font-semibold whitespace-nowrap">หมายเหตุ</th>
                  <th class="p-3 text-left font-semibold whitespace-nowrap">ประเภท</th>
                </tr>
                </thead>
                <tbody>
                  @for (acc of paginator.paginatedItems(); track acc.id; let i = $index) {
                    <tr
                      class="border-b dark:border-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/50"
                      [ngClass]="acc.isInCome ? ['bg-green-100/50 dark:bg-green-900/30'] : []">
                      <td class="p-3">{{ (paginator.currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
                      <td class="p-3 whitespace-nowrap"
                          [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.date | thaiDate }}
                      </td>
                      <td class="p-3 whitespace-nowrap"
                          [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.details }}
                      </td>

                      <td class="p-3 whitespace-nowrap text-right font-medium"
                          [ngClass]="acc.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-400']">
                        {{ acc.isInCome ? '+' : '-' }} {{ acc.amount | number:'1.2-2' }}
                      </td>
                      <td class="pl-5 whitespace-nowrap"
                          [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.remark }}
                      </td>
                      <td class="p-3 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
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

              <!-- Pagination control -->
              @if (paginator.totalPages() > 1) {
                <div class="mt-8 flex justify-center items-center gap-4">
                  <button (click)="paginator.previousPage()" [disabled]="paginator.currentPage() === 1"
                          class="btn-paginator">Previous
                  </button>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Page {{ paginator.currentPage() }}
                    of {{ paginator.totalPages() }}</span>
                  <button (click)="paginator.nextPage()" [disabled]="paginator.currentPage() === paginator.totalPages()"
                          class="btn-paginator">Next
                  </button>
                </div>
              }
            </div>
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
  private destroyRef = inject(DestroyRef);
  private paginationService = inject(PaginationService);

  // --- Pagination State ---
  transactions = signal<Account[]>([]);
  itemsPerPage = signal(15); // กำหนดจำนวนรายการต่อหน้า
  paginator = this.paginationService.createPaginator(this.transactions, this.itemsPerPage);

  reportForm: FormGroup;
  accounts = signal<Account[] | undefined>(undefined);

  summary = computed(() => {
    const data = this.accounts() ?? [];
    const totalIncome = data.filter(a => a.isInCome).reduce((sum, a) => sum + parseFloat(String(a.amount) || '0'), 0);
    const totalExpense = data.filter(a => !a.isInCome).reduce((sum, a) => sum + parseFloat(String(a.amount) || '0'), 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  });

  constructor() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // ฟังก์ชันช่วยแปลง Date เป็น 'YYYY-MM-DD' โดยไม่สน Timezone
    const toLocalISOString = (date: Date): string => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    this.reportForm = this.fb.group({
      startDate: [toLocalISOString(firstDayOfMonth)],
      endDate: [toLocalISOString(today)]
    });
  }

  onSubmit() {
    // 1. ตรวจสอบความถูกต้องของฟอร์มก่อน
    if (this.reportForm.invalid) {
      this.toastService.show('Warning', 'กรุณาเลือกวันที่ให้ครบถ้วน', 'warning');
      return;
    }
    // 2. ดึงค่า string จากฟอร์ม
    const {startDate, endDate} = this.reportForm.value;
// 3. ตรวจสอบว่าค่าที่ได้ไม่ใช่ค่าว่าง
    if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
      this.toastService.show('Error', 'รูปแบบวันที่ไม่ถูกต้อง', 'error');
      return;
    }

    this.loadingService.show();

    this.accountService.getAccountsByDateRange(startDate, endDate)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.loadingService.hide();
        }),
      )
      .subscribe({
        next: (accounts) => {
          // จัดการกรณีสำเร็จที่นี่ที่เดียว
          this.accounts.set(accounts);
          this.transactions.set(accounts);
        },
        complete: () => {
          // อาจจะมีการทำงานเพิ่มเติมเมื่อเสร็จสิ้น
          // this.toastService.show('Success', 'ดึงข้อมูลเรียบร้อยแล้ว', 'success');
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
