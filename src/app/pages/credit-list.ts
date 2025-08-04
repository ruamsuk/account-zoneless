import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../services/toast.service';
import { DialogService } from '../shared/services/dialog';
import { LoadingService } from '../services/loading.service';
import { CreditService } from '../services/credit.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreditData } from '../models/credit.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { ThaiDatepicker } from '../shared/components/thai-datepicker';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { NumberFormatDirective } from '../shared/directives/number-format';

@Component({
  selector: 'app-credit-list',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    DecimalPipe,
    ThaiDatePipe,
    ThaiDatepicker,
    NumberFormatDirective
  ],
  template: `
    <div class="max-w-5xl p-4 sm:p-6 lg:p-8 mx-auto">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl md:text-3xl font-serif font-bold text-white text-shadow-lg">Credit List</h1>
        <button (click)="openModal(null)" class="btn-primary">+ เพิ่มรายการ</button>
      </div>
    </div>
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="bg-white/70 dark:bg-black/60 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h2
            class="hidden md:inline-block text-2xl font-semibold font-thasadith text-gray-800 dark:text-gray-200 mb-4">
            รายการล่าสุด
          </h2>
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
          @if (paginatedTransactions().length > 0) {
            <!-- Transaction Table -->
            <table class="min-w-full">
              <thead>
              <tr
                class="border-b-2 border-gray-400 font-semibold text-amber-800 dark:text-gray-300 text-lg dark:border-gray-600 ">
                <th class="p-3 text-left w-2.5">#</th>
                <th class="p-3 text-left">วันที่</th>
                <th class="p-3 text-left">รายละเอียด</th>
                <th class="p-3 text-right">จำนวนเงิน</th>
                <th class="p-3 text-center">Actions</th>
              </tr>
              </thead>
              <tbody>
                @for (tx of paginatedTransactions(); track tx.id; let i = $index) {
                  <tr
                    class="text-base text-gray-800 dark:text-gray-300 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    [ngClass]="tx.isCashback ? ['bg-green-100/50 dark:bg-green-900/30'] : []">
                    <td class="p-3 whitespace-nowrap text-left">{{ (currentPage() - 1) * itemsPerPage() + i + 1 }}</td>
                    <td class="p-3 whitespace-nowrap">{{ tx.date | thaiDate }}</td>
                    <td class="p-3 whitespace-nowrap">{{ tx.details }}</td>
                    <td class="p-3 whitespace-nowrap text-right"
                        [ngClass]="tx.isCashback ? ['text-green-600'] : ['text-red-600']">
                      {{ tx.isCashback ? '+' : '-' }} {{ tx.amount | number:'1.2-2' }}
                    </td>
                    <td class="p-3 whitespace-nowrap text-center">
                      <button (click)="onViewDetails(tx)" title="ดูรายละเอียด" class="btn-icon text-sky-500">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button (click)="openModal(tx)" class="btn-icon mx-2 text-green-600" title="แก้ไข">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path
                            d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                        </svg>
                      </button>
                      <button (click)="onDelete(tx)" class="btn-icon text-red-600" title="ลบ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd"
                                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.33l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm3.44 0a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                clip-rule="evenodd"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Pagination Controls -->
            @if (totalPages() > 1) {
              <div class="mt-6 flex items-center justify-center gap-2">
                <button (click)="firstPage()" [disabled]="currentPage() === 1"
                        class="btn-paginator" title="หน้าแรก">«
                </button>
                <button (click)="previousPage()" [disabled]="currentPage() === 1"
                        class="btn-paginator" title="หน้าก่อนหน้า">‹
                </button>
                <span class="text-gray-600 dark:text-gray-300">
                หน้า {{ currentPage() }} ของ {{ totalPages() }}
              </span>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                        class="btn-paginator" title="หน้าถัดไป">›
                </button>
                <button (click)="lastPage()" [disabled]="currentPage() === totalPages()"
                        class="btn-paginator" title="หน้าสุดท้าย">»
                </button>
              </div>
            }
          } @else {
            <div class="text-center text-red-500 dark:text-red-400">
              <p class="text-lg">ไม่พบรายการธุรกรรมที่ตรงกับคำค้นหา</p>
            </div>
          }
          <!-- Add/Edit Modal -->
          @if (isModalOpen()) {
            <div (click)="closeModal()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
              <div (click)="$event.stopPropagation()"
                   class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-lg mx-auto dark:bg-gray-800">

                @if (modalMode() === 'view' && selectedTransaction()) {
                  <!-- +++ VIEW MODE +++ -->
                  <div>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">รายละเอียดรายการ</h2>
                    <div class="space-y-4 text-gray-700 dark:text-gray-300">
                      <p><strong>วันที่:</strong> {{ selectedTransaction()!.date | thaiDate:'fullMonth' }}</p>
                      <p><strong>รายละเอียด:</strong> {{ selectedTransaction()!.details }}</p>
                      <p><strong>จำนวนเงิน:</strong>
                        <span [ngClass]="selectedTransaction()!.isCashback ? ['text-green-600'] : ['text-red-600']">
                    {{ selectedTransaction()!.isCashback ? '+' : '-' }} {{ selectedTransaction()!.amount | number:'1.2-2' }}
                  </span>
                      </p>
                      <p>
                        <strong>ประเภท:</strong> {{ selectedTransaction()!.isCashback ? 'Cashback / ส่วนลด' : 'รายจ่าย' }}
                      </p>
                      <p><strong>หมายเหตุ:</strong> {{ selectedTransaction()!.remark || '-' }}</p>
                      <p class="text-base text-gray-400 pt-4 border-t dark:border-gray-600">
                        <strong>บันทึกเมื่อ:</strong> {{ selectedTransaction()!.created | thaiDate:'mediumt' }}</p>
                      @if (selectedTransaction()!.modify) {
                        <p class="text-base text-gray-400">
                          <strong>แก้ไขล่าสุด:</strong> {{ selectedTransaction()!.modify | thaiDate:'mediumt' }}</p>
                      }
                    </div>
                    <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                      <button type="button" (click)="closeModal()" class="btn-secondary">Close</button>
                      <button type="button" (click)="switchToEditMode()" class="btn-primary">Edit</button>
                    </div>
                  </div>
                } @else {
                  <!-- +++ FORM MODE (Add/Edit) +++ -->
                  <div>
                    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
                      {{ isEditing() ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่' }}
                    </h2>
                    <form [formGroup]="creditForm" (ngSubmit)="onSubmit()">
                      <div class="mb-4">
                        <label class="form-label">วันที่</label>
                        <app-thai-datepicker formControlName="date"></app-thai-datepicker>
                      </div>
                      <div class="mb-4">
                        <label class="form-label">รายละเอียด</label>
                        <input type="text" formControlName="details" class="form-input">
                      </div>
                      <div class="mb-4">
                        <label class="form-label">จำนวนเงิน</label>
                        <input
                          type="text"
                          inputmode="decimal"
                          formControlName="amount" class="form-input"
                          appNumberFormat>
                      </div>
                      <div class="mb-4">
                        <label class="form-label">หมายเหตุ</label>
                        <input type="text" formControlName="remark" class="form-input">
                      </div>
                      <div class="flex items-center mb-6">
                        <input type="checkbox" id="isCashback" formControlName="isCashback"
                               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        <label for="isCashback" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">เป็น
                          Cashback / ส่วนลด</label>
                      </div>
                      <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                        <button type="button" (click)="closeModal()" class="btn-secondary">Cancel</button>
                        <button type="submit" [disabled]="creditForm.invalid" class="btn-primary">
                          {{ isEditing() ? 'Update' : 'Save' }}
                        </button>
                      </div>
                    </form>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class CreditList {
  private creditService = inject(CreditService);
  private loadingService = inject(LoadingService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // --- Data & State ---
  transactions: Signal<CreditData[]>;
  currentPage = signal(1);
  itemsPerPage = signal(10);
  searchTerm = signal('');

  // --- Modal State ---
  isModalOpen = signal(false);
  selectedTransaction = signal<CreditData | null>(null);
  modalMode = signal<'view' | 'form'>('form');
  isEditing = computed(() => !!this.selectedTransaction());
  creditForm!: FormGroup;

  /**
   *  1. Get all credit from the credit service
   *  2. Use toSignal to convert the observable to signal
   *  3. Show loading while fetching data
   *  4. Hide loading after data is fetched
   *  5. Handle errors and show a toast message
   *  6. Return an initial value of an empty array
   *  * @returns {Signal<CreditData[]>} - A signal containing
   *    the list of credit transactions
   * */
  private getCreditData(): Signal<CreditData[]> {
    this.loadingService.show();

    return toSignal(
      (this.creditService.getAllTransactions() as Observable<CreditData[]>)
        .pipe(
          tap(() => {
            this.loadingService.hide();
          }),
          catchError((err: any) => {
            this.toastService.show('Error', 'Error loading credit' + err.message, 'error');
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


  constructor() {
    this.transactions = this.getCreditData();
    this.initializeForm();
  }

  initializeForm(data: CreditData | null = null): void {
    const dateValue = data?.date || new Date();

    this.creditForm = this.fb.group({
      date: [dateValue, Validators.required], // <-- formControl จะได้รับข้อมูลที่ถูกต้อง
      details: [data?.details || '', Validators.required],
      amount: [data?.amount || 0, [Validators.required, Validators.min(0.01)]],
      isCashback: [data?.isCashback || false],
      remark: [data?.remark || '']
    });
  }

// --- Computed for Display ---
  /**
   * ฟิลเตอร์รายการธุรกรรมตามคำค้นหา
   * @returns รายการธุรกรรมที่ตรงกับคำค้นหา
   *  ถ้าไม่มีคำค้นหาจะคืนค่าทั้งหมด
   */
  filteredTransactions = computed(() => {
    const searchTerm = this.searchTerm().toLowerCase();
    return this.transactions().filter(tx =>
      tx.details.toLowerCase().includes(searchTerm) ||
      (tx.remark ?? '').toLowerCase().includes(searchTerm)
    );
  });

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.itemsPerPage()));

  openModal(data: CreditData | null): void {
    this.selectedTransaction.set(data);

    this.initializeForm(data);
    this.modalMode.set('form');
    this.isModalOpen.set(true);
  }

  onViewDetails(data: CreditData) {
    this.selectedTransaction.set(data);
    this.modalMode.set('view'); // <-- กำหนดเป็นโหมด "ดู"
    this.isModalOpen.set(true);
  }

  switchToEditMode(): void {
    if (!this.selectedTransaction()) return;
    this.initializeForm(this.selectedTransaction());
    this.modalMode.set('form');
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.creditForm.invalid) return;

    this.loadingService.show();

    const formValue = this.creditForm.value;

    try {
      if (this.isEditing() && this.selectedTransaction()) {
        const updatedData = {...this.selectedTransaction()!, ...formValue};
        await this.creditService.updateTransaction(updatedData);
        this.toastService.show('Success', 'อัปเดตรายการสำเร็จ', 'success');
      } else {
        await this.creditService.addTransaction(formValue);
        this.toastService.show('Success', 'เพิ่มรายการสำเร็จ', 'success');
      }
      this.closeModal();
    } catch (error) {
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      console.error('Error saving credit transaction:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  async onDelete(transaction: CreditData): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการ: <strong>${transaction.details}</strong>?`
    });
    if (confirmed && transaction.id) {
      this.loadingService.show();
      try {
        await this.creditService.deleteTransaction(transaction.id);
        this.toastService.show('Success', 'ลบรายการสำเร็จ', 'success');
      } catch (error) {
        this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
        console.error('Error deleting credit transaction:', error);
      } finally {
        this.loadingService.hide();
      }
    }
  }

  paginatedTransactions() {
    const list = this.filteredTransactions();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return list.slice(startIndex, startIndex + this.itemsPerPage());
  }

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
