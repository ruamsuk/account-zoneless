import { Component, computed, inject, Signal, signal } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { LoadingService } from '../../services/loading.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Account } from '../../models/account.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '../../shared/services/dialog';
import { AuthService } from '../../services/auth.service';
import { AccountModal } from './account-modal';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

@Component({
  selector: 'app-cash-list',
  imports: [
    NgClass,
    ThaiDatePipe,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    AccountModal,
    CustomTooltipDirective
  ],
  providers: [DatePipe],
  template: `
    <div class="max-w-5xl p-4 sm:p-6 lg:p-8 mx-auto">
      <div class="flex justify-between items-center">
        <h1 class="text-4xl font-serif font-bold text-white text-shadow-lg">Dashboard</h1>
        @if (authService.currentUser()?.role == 'admin' || authService.currentUser()?.role == 'manager') {
          <button (click)="openAddModal()"
                  class="btn-primary sm:btn-primary-sm  inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 md:mr-2">
              <path fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                    clip-rule="evenodd"/>
            </svg>
            <span class="hidden sm:block">
            เพิ่มรายการ
          </span>
          </button>
        }
      </div>
    </div>

    <div class="p-4 sm:p-6 lg:p-8">
      <div class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-5xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2
            class="hidden md:inline-block text-2xl font-semibold font-thasadith text-gray-800 dark:text-gray-200 mb-4">
            รายการล่าสุด</h2>
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="w-5 h-5 text-gray-700 dark:text-gray-200">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                </svg>
              </div>
              <input type="text"
                     id="search"
                     placeholder="Search ..."
                     class="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 pl-10 dark:bg-gray-500 dark:border-gray-600 dark:text-white"
                     [(ngModel)]="searchTerm">

              @if (searchTerm()) {
                <button (click)="clearSearch()"
                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        title="Clear search">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                       stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
            <tr
              class="border-b-2 border-gray-400 font-semibold text-amber-800 dark:text-gray-300 text-lg dark:border-gray-600 ">
              <th class="p-3 text-left">วันที่</th>
              <th class="p-3 text-left">รายการ</th>
              <th class="p-3 text-right">จำนวนเงิน</th>
              <th class="pl-10 text-left">หมายเหตุ</th>
              <th class="p-3 text-left">ประเภท</th>
              <th class="p-3 text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
              @for (acc of paginateAccounts(); track acc.id) {
                <tr
                  class="border-b text-black dark:border-gray-700 hover:bg-white/50 dark:hover:bg-black/50 dark:text-gray-200"
                  [ngClass]="acc.isInCome ? ['bg-green-100/50 dark:bg-green-900/30'] : []">
                  <td class="p-3 whitespace-nowrap"
                      [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.date | thaiDate }}
                  </td>
                  <td class="p-3 whitespace-nowrap" [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.details }}</td>
                  <td class="p-3 whitespace-nowrap text-right font-medium"
                      [ngClass]="acc.isInCome ? ['text-green-600 dark:text-green-400'] : ['text-red-600 dark:text-red-500']">
                    {{ acc.isInCome ? '+' : '-' }} {{ acc.amount | number:'1.2-2' }}
                  </td>
                  <td class="pl-10 whitespace-nowrap text-left"
                      [ngClass]="{'text-green-500' : acc.isInCome}">{{ acc.remark }}
                  </td>

                  <td class="p-3 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
                    @if (acc.isInCome) {
                      <span>รายรับ</span>
                    }
                  </td>

                  <td class="p-3">
                    <div class="flex items-center justify-center gap-2">
                      @if (authService.currentUser()?.role !== 'user') {
                        <button (click)="openDetailModal(acc)" customTooltip="ดูรายละเอียด"
                                class="btn-icon text-sky-500">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      }
                      @if (authService.currentUser()?.role == 'admin' || authService.currentUser()?.role == 'manager') {
                        <button (click)="openEditModal(acc)" customTooltip="แก้ไข" class="btn-icon text-amber-400">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/>
                          </svg>
                        </button>
                        <button (click)="onDelete(acc)" customTooltip="ลบ" class="btn-icon text-red-500">
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd"
                                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                                clip-rule="evenodd"/>
                        </svg>
                      }
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
            <div class="mt-6 flex items-center justify-center gap-2">
              <button (click)="firstPage()" [disabled]="currentPage() === 1"
                      class="btn-paginator" customTooltip="หน้าแรก">«
              </button>
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                      class="btn-paginator" customTooltip="หน้าก่อนหน้า">‹
              </button>
              <span class="text-gray-600 dark:text-gray-300">
                หน้า {{ currentPage() }} ของ {{ totalPages() }}
              </span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-paginator" customTooltip="หน้าถัดไป">›
              </button>
              <button (click)="lastPage()" [disabled]="currentPage() === totalPages()"
                      class="btn-paginator" customTooltip="หน้าสุดท้าย">»
              </button>
            </div>
          }
        </div>
      </div>
    </div>


    <app-account-modal
      [isOpen]="isModalOpen()"
      [accountToEdit]="selectedAccount()"
      [initialMode]="modalMode()"
      (close)="closeModal()"
      (save)="onSave($event)">
    </app-account-modal>
  `,
  styles: ``
})
export class CashList {
  public authService = inject(AuthService);
  private accountService = inject(AccountService);
  private loadingService = inject(LoadingService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private datePipe = inject(DatePipe);

  currentPage = signal(1);
  itemsPerPage = signal(9);
  searchTerm = signal('');

  // --- Data & State ---
  accounts = this.getAccounts();

  // --- Modal State ---
  isModalOpen = signal(false);
  selectedAccount = signal<Account | null>(null);
  modalMode = signal<'view' | 'form'>('form');


  // --- UI Action Methods ---
  openDetailModal(account: Account): void {
    this.selectedAccount.set(account);
    this.modalMode.set('view');
    this.isModalOpen.set(true);
  }

  openAddModal(): void {
    this.selectedAccount.set(null);
    this.modalMode.set('form');
    this.isModalOpen.set(true);
  }

  openEditModal(account: Account): void {
    this.selectedAccount.set(account);
    this.modalMode.set('form');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedAccount.set(null);
  }

  /**
   *  1. Filter accounts based on search term
   *  2. Convert search term to lowercase for case-insensitive search
   *  3. Check if account details or remark includes the search term
   *  4. Return filtered accounts
   *  5. Use computed to automatically update when accounts or searchTerm change
   * */
  filteredAccounts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.accounts().filter(account => {
      return account.details.toLowerCase().includes(term) ||
        (account.remark ?? '').toLowerCase().includes(term);
    });
  });

  async onSave(dataToSave: any): Promise<void> {
    this.loadingService.show();
    try {
      if (this.selectedAccount()) {
        const updatedAccount = {...this.selectedAccount()!, ...dataToSave};
        await this.accountService.updateAccount(updatedAccount);
        this.toastService.show('Success', 'อัปเดตรายการสำเร็จ', 'success');
      } else {
        await this.accountService.addAccount(dataToSave);
        this.toastService.show('Success', 'เพิ่มรายการสำเร็จ', 'success');
      }
      this.closeModal();
    } catch (error) {
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการบันทึก' + error, 'error');
      console.error('Error saving account:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  /**
   *  1. Open a confirmation dialog before deleting an account
   *  2. Format the date using DatePipe
   *  3. Show a toast message on success or error
   *  4. Use loading service to show/hide the loading state
   * */
  async onDelete(account: Account): Promise<void> {
    let jsDate: Date | undefined;

    // ตรวจสอบให้แน่ใจว่า account.date มีอยู่และมีเมธอด .toDate
    if (account.date && typeof (account.date as any).toDate === 'function') {
      jsDate = (account.date as any).toDate();
    } else {
      // ในกรณีที่มันเป็น Date object อยู่แล้ว (เผื่อไว้)
      jsDate = account.date;
    }

    // ใช้ jsDate ที่แปลงแล้วส่งให้ DatePipe
    const formattedDate = this.datePipe.transform(jsDate, 'd MMM yyyy', '', 'th') || '';

    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบข้อมูล',
      message: `<p class="text-base">ลบ <strong>${formattedDate} ${account.details || ''}</strong>?</p>`
    });

    if (confirmed && account.id) {
      this.loadingService.show();
      try {
        await this.accountService.deleteAccount(account.id);
        this.toastService.show('Success', 'ลบข้อมูลบัญชีสำเร็จ', 'success');
      } catch (err: any) {
        console.error('Error deleting member:', err);
        this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบข้อมูลบัญชี: ' + err.message, 'error');
      } finally {
        this.loadingService.hide();
      }
    }
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
   *  2. Calculate start index based on the current page
   *  3. Return a slice of accounts for the current page
   * */
  paginateAccounts = computed(() => {
    const list = this.filteredAccounts();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return list.slice(startIndex, startIndex + this.itemsPerPage());
  });

  totalPages = computed(() => Math.ceil(this.filteredAccounts().length / this.itemsPerPage()));

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

  // --- Helper & Utility Methods ---
  clearSearch(): void {
    this.searchTerm.set('');
  }

}
