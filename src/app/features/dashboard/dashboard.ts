import { Component, computed, EventEmitter, inject, Output, Signal, signal } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { LoadingService } from '../../services/loading.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgClass,
    DecimalPipe,
    ThaiDatePipe
  ],
  template: `
    <!--<div class="flex flex-col items-center justify-center text-center pt-24 md:pt-32">
      <h1 class="text-5xl md:text-6xl text-white font-bold font-serif text-shadow-lg">
        Welcome to Your Site
      </h1>
      <p class="mt-4 text-white/90 text-lg md:text-xl font-sans text-shadow">
        A comprehensive solution for all your accounting needs.
      </p>
    </div>-->

    <div class="p-4 sm:p-6 lg:p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold text-white text-shadow">Dashboard</h1>
        <button (click)="requestOpenModal.emit()" class="btn-primary inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 mr-2">
            <path fill-rule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                  clip-rule="evenodd"/>
          </svg>
          เพิ่มรายการ
        </button>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center text-center">
      <h1 class="text-4xl md:text-5xl text-white font-bold font-serif text-shadow-lg">
        Welcome to Your Site
      </h1>
      <p class="mt-4 text-white/90 text-lg md:text-xl font-sans text-shadow">
        A comprehensive solution for all your accounting needs.
      </p>
    </div>

    <div class="p-4 sm:p-6 lg:p-8">
      <div class="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-8 max-w-6xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">รายการล่าสุด</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
            <tr class="border-b-2 border-gray-400 dark:border-gray-600 dark:text-gray-200">
              <th class="p-3 text-left text-lg font-semibold">วันที่</th>
              <th class="p-3 text-left text-lg font-semibold">รายการ</th>
              <th class="p-3 text-right text-lg font-semibold">จำนวนเงิน</th>
              <th class="p-3 text-left text-lg font-semibold">ประเภท</th>
              <th class="p-3 text-center text-lg font-semibold">Actions</th>
            </tr>
            </thead>
            <tbody>
              @for (acc of paginateAccounts(); track acc.id) {
                <tr class="border-b dark:border-gray-700 hover:bg-white/50 dark:hover:bg-black/50 dark:text-gray-200">
                  <td class="p-3" [ngClass]="acc.isInCome ? ['text-green-400'] : ['']">{{ acc.date | thaiDate }}</td>
                  <td class="p-3" [ngClass]="acc.isInCome ? ['text-green-400'] : ['']">{{ acc.details }}</td>
                  <td class="p-3 text-right font-medium"
                      [ngClass]="acc.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                    {{ acc.isInCome ? '+' : '-' }} {{ acc.amount | number:'1.2-2' }}
                  </td>

                  <td class="p-3 font-medium text-green-600 dark:text-green-400">
                    @if (acc.isInCome) {
                      <span>รายรับ</span>
                    }
                  </td>

                  <td class="p-3">
                    <div class="flex items-center justify-center gap-2">
                      <button title="ดูรายละเอียด" class="btn-icon text-sky-500">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button (click)="onEdit(acc)" title="แก้ไข" class="btn-icon text-amber-400">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/>
                        </svg>
                      </button>
                      <button title="ลบ" class="btn-icon text-red-500">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <div class="bg-white p-8 rounded-xl shadow-lg text-center dark:bg-gray-800">
                  <p class="w-full text-gray-500 dark:text-gray-400">ไม่พบข้อมูลบัญชี</p>
                </div>
              }
            </tbody>
          </table>
          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-6 flex items-center justify-between">
              <button (click)="firstPage()" [disabled]="currentPage() === 1"
                      class="btn-secondary" title="หน้าแรก">«
              </button>
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                      class="btn-secondary" title="หน้าก่อนหน้า">‹
              </button>
              <span class="text-gray-700 dark:text-gray-300">
                หน้า {{ currentPage() }} ของ {{ totalPages() }}
              </span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-secondary" title="หน้าถัดไป">›
              </button>
              <button (click)="lastPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-secondary" title="หน้าสุดท้าย">»
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class Dashboard {
  @Output() requestOpenModal = new EventEmitter<void>();
  @Output() requestEditModal = new EventEmitter<Account>();

  currentPage = signal(1);
  itemsPerPage = signal(9);

  private accountService = inject(AccountService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);

  accounts = this.getAccounts();

  onEdit(account: Account): void {
    this.requestEditModal.emit(account); // <-- เปลี่ยนจากเรียก openModal() โดยตรง
  }

  /**
   *  1. Get all accounts from the account service
   *  2. Use toSignal to convert the observable to signal
   *  3. Show loading while fetching data
   *  4. Hide loading after data is fetched
   *  5. Handle errors and show a toast message
   *  6. Return an initial value of an empty array
   *  * @returns {Signal<Account[]>} - A signal containing the list of accounts
   * */
  private getAccounts(): Signal<Account[]> {
    this.loadingService.show(); // 👈 1. เปิด loading ก่อน

    return toSignal(
      (this.accountService.getAccounts() as Observable<Account[]>)
        .pipe(
          tap(() => {
            this.loadingService.hide();
          }),
          catchError((err: any) => {
            this.toastService.show('Error', 'Error loading accounts' + err.message, 'error');
            this.loadingService.hide(); // 👈 4. ปิด loading เมื่อเกิดข้อผิดพลาด
            console.error(err);
            return throwError(() => err);
          })
        ),
      {
        initialValue: [],
      }
    );
  }

  /**
   *  1. Paginate accounts based on the current page and items per page
   *  2. Calculate start index based on current page
   *  3. Return a slice of accounts for the current page
   * */
  paginateAccounts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.accounts().slice(startIndex, startIndex + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.accounts().length / this.itemsPerPage()));

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  // ++ เพิ่มเมธอดใหม่สำหรับ Paginator ++
  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages());
  }

}
