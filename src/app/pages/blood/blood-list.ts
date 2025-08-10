import { Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { BloodService } from '../../services/blood.service';
import { LoadingService } from '../../services/loading.service';
import { DialogService } from '../../shared/services/dialog';
import { ToastService } from '../../services/toast.service';
import { BloodPressure } from '../../models/blood-pressure.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { NgClass } from '@angular/common';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { BloodAddEditModal } from './blood-add-edit-modal';
import { PrintDialog } from './print-dialog';

@Component({
  selector: 'app-blood-list',
  imports: [
    NgClass,
    ThaiDatePipe,
    BloodAddEditModal,
    PrintDialog
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8">
      <div class="flex justify-end md:justify-between items-center mb-6">
        <h1
          class="hidden md:block text-3xl text-gray-100 text-shadow-lg font-semibold font-serif  dark:text-gray-200 underline underline-offset-4">
          Blood Pressure Tracker</h1>
        <div class="flex items-end md:items-center gap-2 ">
          <button (click)="openModal(null)" class="btn-primary">+ เพิ่มบันทึก</button>
        </div>
      </div>

      <!-- Table Display -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="p-3">
          <button (click)="openPrintModal()" class="inline-flex btn-primary" title="พิมพ์รายงาน">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd"
                    d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.74.14 1.095.282.355.143.66.348.905.602a4.004 4.004 0 0 1 1.595 5.565A4.004 4.004 0 0 1 15.25 19h-3.5a.75.75 0 0 1 0-1.5h3.5a2.5 2.5 0 1 0 0-5h-10a2.5 2.5 0 1 0 0 5h3.5a.75.75 0 0 1 0 1.5h-3.5A4.004 4.004 0 0 1 2 12.75a4.004 4.004 0 0 1 1.595-5.565c.244-.254.55-.459.905-.602.355-.142.718-.236 1.095-.282V2.75Z"
                    clip-rule="evenodd"/>
            </svg>
            <span class="pl-2">พิมพ์</span>
          </button>
        </div>
        <div class="overflow-x-auto p-3">
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
              <th rowspan="2" class="text-lg align-middle font-medium text-gray-800 dark:text-gray-300 w-[15%]">
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
              @for (item of paginatedItems(); track item.id) {
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
                    <button (click)="openModal(item)" class="btn-icon mr-3" title="แก้ไข">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                           class="w-5 h-5 text-green-400">
                        <path
                          d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                      </svg>
                    </button>
                    <button (click)="onDelete(item)" class="btn-icon-danger" title="ลบ">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                           class="w-5 h-5 text-red-500">
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
          <div class="flex justify-center -mt-2 mb-4">
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
          </div>
        </div>
      </div>
    </main>

    <app-blood-add-edit-modal
      [isOpen]="isModalOpen()"
      [itemToEdit]="selectedItem()"
      (close)="closeModal()"
      (save)="onSave($event)">
    </app-blood-add-edit-modal>

    <app-print-dialog
      [isOpen]="isPrintModalOpen()"
      (close)="isPrintModalOpen.set(false)">
    </app-print-dialog>
  `,
  styles: ``
})
export class BloodList {
  private bloodService = inject(BloodService);
  private loadingService = inject(LoadingService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  allItems: Signal<BloodPressure[]>;

// --- Modal State ---
  isModalOpen = signal(false);
  selectedItem = signal<BloodPressure | null>(null);
  isPrintModalOpen = signal(false);

  // --- Computed for Display ---
  paginatedItems = computed(() => {
    const items = this.allItems() ?? [];
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    return items.slice(startIndex, startIndex + perPage);
  });
  totalPages = computed(() => Math.ceil((this.allItems() ?? []).length / this.itemsPerPage()));

  /**
   *  Fetches blood pressure data from the service and returns it as a Signal.
   *  This method handles loading state and error handling.
   *  It uses `toSignal` to convert the Observable into a Signal for reactive updates.
   *  The initial value is set to an empty array to avoid undefined states.
   *  The `tap` operator is used to hide the loading indicator after data is fetched.
   *  If an error occurs, it shows a toast notification and logs the error to the console.
   *  The method returns a Signal of an array of BloodPressure objects.
   *  @returns {Signal<BloodPressure[]>} - A Signal containing the fetched blood pressure data.
   *  @throws {Error} - Throws an error if the data fetching fails.
   * */
  private getBloodData(): Signal<BloodPressure[]> {
    this.loadingService.show();

    return toSignal(
      (this.bloodService.getAll() as Observable<BloodPressure[]>)
        .pipe(
          tap(() => this.loadingService.hide()),
          catchError((err: any) => {
            this.toastService.show('Error', 'Error fetching data: ' + err.message, 'error');
            console.error('Error fetching data:', err);
            return throwError(() => err);
          })
        ),
      {
        initialValue: []
      }
    );
  }

  constructor() {
    this.allItems = this.getBloodData();
    effect(() => {
      if (this.allItems() !== undefined) {
        this.loadingService.hide();
      }
    });
  }

  openPrintModal(): void {
    this.isPrintModalOpen.set(true);
  }

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

  openModal(data: BloodPressure | null): void {
    this.selectedItem.set(data);
    this.isModalOpen.set(true);
    // Logic for calling the actual modal component will be added here
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async onSave(dataToSave: any): Promise<void> {
    this.loadingService.show();
    try {
      if (this.selectedItem()) { // Edit Mode
        const updatedData = {...this.selectedItem()!, ...dataToSave};
        await this.bloodService.update(updatedData);
        this.toastService.show('Success', 'อัปเดตข้อมูลสำเร็จ', 'success');
      } else { // Add Mode
        await this.bloodService.add(dataToSave);
        this.toastService.show('Success', 'เพิ่มข้อมูลสำเร็จ', 'success');
      }
      this.closeModal();
    } catch (error) {
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      console.error('Error saving blood:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  async onDelete(item: BloodPressure) {
    const thDate = (item.date as any).toDate().toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของวันที่ <strong>${thDate}</strong>?`
    });

    if (confirmed && item.id) {
      this.loadingService.show();
      try {
        await this.bloodService.delete(item.id);
        this.toastService.show('Success', 'ลบข้อมูลสำเร็จ', 'success');
      } catch (error) {
        this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
        console.error('Error deleting blood:', error);
      } finally {
        this.loadingService.hide();
      }
    }
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
}
