import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BloodService } from '../../services/blood.service';
import { LoadingService } from '../../services/loading.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '../../shared/services/dialog';
import { ToastService } from '../../services/toast.service';
import { BloodPressure } from '../../models/blood-pressure.model';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';
import { DateUtilityService } from '../../services/date-utility.service';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { NgClass } from '@angular/common';
import { BloodAddEditModal } from './blood-add-edit-modal';

@Component({
  selector: 'app-blood-year',
  imports: [
    CustomTooltipDirective,
    ReactiveFormsModule,
    FormsModule,
    ThaiDatePipe,
    NgClass,
    BloodAddEditModal
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <h1 class="text-3xl font-thasadith font-bold text-gray-800 dark:text-gray-200 mb-6">Blood Year List</h1>

      <!-- Filter Controls -->
      <div class="mb-6 p-4 bg-white rounded-xl shadow-md dark:bg-gray-800">
        <div class="grid grid-cols-1 sm:grid-cols-2  gap-4 items-end justify-around">

          <!-- Year Selector -->
          <div>
            <label class="form-label">ปี (พ.ศ.)</label>
            <select class="form-input w-full" [(ngModel)]="selectedYearBE">
              @for (year of yearRange; track year) {
                <option [value]="year">{{ year }}</option>
              }
            </select>
          </div>
          <!-- Search Button -->
          <div>
            <button (click)="search()" class="btn-primary w-full">ค้นหา</button>
          </div>
        </div>
      </div>

      <!-- Table Display -->
      @if (transactions()) {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div class="overflow-x-auto m-2">
            <table class="min-w-full text-base border-collapse">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
              <!-- Complex Header -->
              <tr class="first:border-t-2">
                <th rowspan="3" class="table-header w-[25%]">Date</th>
              </tr>
              <tr>
                <th colspan="2" class="table-header text-center border-x border-b dark:border-gray-600">
                  <div class="text-center text-green-600 dark:text-green-400">Morning</div>
                  <div class="text-center text-xs text-gray-500 dark:text-gray-400 font-normal">(Before medicine)</div>
                </th>
                <th colspan="2" class="table-header text-center border-r border-b dark:border-gray-600">
                  <div class="text-center text-yellow-600 dark:text-yellow-400">Evening</div>
                  <div class="text-center text-xs text-gray-500 dark:text-gray-400 font-normal">(After medicine)</div>
                </th>
                <th rowspan="2"
                    class="text-lg align-middle font-medium text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 w-[15%]">
                  Action
                </th>
              </tr>
              <tr>
                <th class="table-header text-center border-x dark:border-gray-600 w-[15%]">BP1</th>
                <th class="table-header text-center border-r dark:border-gray-600 w-[15%]">BP2</th>
                <th class="table-header text-center border-r w-[15%]">BP1</th>
                <th class="table-header text-center border-r dark:border-gray-600 w-[15%]">BP2</th>
              </tr>
              </thead>
              <tbody>
                @for (item of paginatedTransactions(); track $index) {
                  <tr
                    class="border-t first:border-t-2 last:border-b-2 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-gray-300">
                    <td class="table-cell font-semibold">{{ item.date | thaiDate }}</td>
                    <td class="table-cell border-x dark:border-gray-600">
                      <div [ngClass]="{'text-red-500': isBloodPressureHigh(item.morning.bp1)}">
                        {{ formatReading(item.morning.bp1) }}
                      </div>
                    </td>
                    <td class="table-cell">
                      <div [ngClass]="{'text-red-500': isBloodPressureHigh(item.morning.bp2)}">
                        {{ formatReading(item.morning.bp2) }}
                      </div>
                    </td>
                    <td class="table-cell border-x dark:border-gray-600">
                      <div [ngClass]="{'text-red-500': isBloodPressureHigh(item.evening.bp1)}">
                        {{ formatReading(item.evening.bp1) }}
                      </div>
                    </td>
                    <td class="table-cell">
                      <div [ngClass]="{'text-red-500': isBloodPressureHigh(item.evening.bp2)}">
                        {{ formatReading(item.evening.bp2) }}
                      </div>
                    </td>
                    <td class="table-cell text-center border-l dark:border-gray-600">
                      @if (authService.currentUser()?.role === 'admin' || authService.currentUser()?.role === 'manager') {
                        <button (click)="openModal(item)" class="btn-icon mr-3" customTooltip="แก้ไข">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                               class="w-5 h-5 text-green-400">
                            <path
                              d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                          </svg>
                        </button>
                        <button (click)="onDelete(item)" class="btn-icon-danger" customTooltip="ลบ">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                               class="w-5 h-5 text-red-500">
                            <path fill-rule="evenodd"
                                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.33l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm3.44 0a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                  clip-rule="evenodd"/>
                          </svg>
                        </button>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd"
                                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                                clip-rule="evenodd"/>
                        </svg>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Paginator Control -->
            @if (totalPages() > 1) {
              <div class="flex justify-center -mt-2 mb-4">
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
              </div>
            }
          </div>
        </div>
      }

    </main>

    <app-blood-add-edit-modal
      [isOpen]="isModalOpen()"
      [itemToEdit]="selectedItem()"
      (close)="closeModal()"
      (save)="onSave($event)">
    </app-blood-add-edit-modal>
  `,
  styles: ``
})
export class BloodYear {
  public authService = inject(AuthService);
  private bpService = inject(BloodService);
  private loadingService = inject(LoadingService);
  private fb = inject(FormBuilder);
  private dateUtilityService = inject(DateUtilityService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  // --- State Signals for Modal and Form Data ---
  isModalOpen = signal(false);
  transactions = signal<BloodPressure[] | null>(null);
  selectedItem = signal<BloodPressure | null>(null);
  selectedYearBE = signal(new Date().getFullYear() + 543);
  dateYearForm: FormGroup;

  // --- Pagination State ---
  currentPage = signal(1);
  itemsPerPage = signal(10);

  /** Data for Year Dropdown */
  readonly yearRange = this.dateUtilityService.getYearRange(10) as number[];

  // --- Computed Properties ---
  paginatedTransactions = computed(() => {
    const items = this.transactions() ?? [];
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    return items.slice(startIndex, startIndex + perPage);
  });
  totalPages = computed(() => Math.ceil((this.transactions() ?? []).length / this.itemsPerPage()));

  constructor() {
    this.dateYearForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    });
  }


  /** Pagination Methods */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages());
  }

  async search(): Promise<void> {
    this.loadingService.show();

    try {
      const yearCE = this.selectedYearBE() - 543;
      const result = await this.bpService.getBloodByYear(yearCE);
      this.transactions.set(result);
    } catch (e) {
      console.error(e);
      this.toastService.show('Error', 'ไม่สามารถดึงข้อมูลได้: ' + e, 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async onSave(dataToSave: any): Promise<void> {
    this.loadingService.show();
    try {
      if (this.selectedItem()) { // Edit Mode
        const updatedData = {...this.selectedItem()!, ...dataToSave};

        await this.bpService.update(updatedData);
        this.toastService.show('Success', 'อัปเดตข้อมูลสำเร็จ', 'success');
      }
      // หน้านี้ไม่มีปุ่ม Add จึงไม่ต้องมี else
      this.closeModal();
    } catch (error) {
      console.error('Error saving data:', error);
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async onDelete(item: BloodPressure): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของวันที่ <strong>${(item.date as any).toDate().toLocaleDateString('th-TH')}</strong>?`
    });
    if (confirmed && item.id) {
      this.loadingService.show();
      try {
        await this.bpService.delete(item.id);
        this.toastService.show('Success', 'ลบข้อมูลสำเร็จ', 'success');
      } catch (error) {
        this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
      } finally {
        this.loadingService.hide();
      }
    }
  }

  openModal(data: BloodPressure | null): void {
    this.selectedItem.set(data);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // --- Helper Methods (คัดลอกจาก blood-list.ts) ---
  formatReading(reading: string | undefined | null): string {
    return reading || '-';
  }

  isBloodPressureHigh(reading: string | undefined | null): boolean {
    if (!reading) return false;
    const parts = reading.split(/[\/P\s]+/);
    if (parts.length < 2) return false;
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1], 10);
    return sys > 130 || dia > 80;
  }

}
