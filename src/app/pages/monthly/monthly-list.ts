import { Component, computed, inject, Signal, signal } from '@angular/core';
import { MonthlyService } from '../../services/monthly.service';
import { LoadingService } from '../../services/loading.service';
import { DialogService } from '../../shared/services/dialog';
import { ToastService } from '../../services/toast.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Monthly } from '../../models/monthly.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ThaiDatepicker } from '../../shared/components/thai-datepicker';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { ChristianToThaiYearPipe } from '../../pipe/christian-to-thai-year.pipe';
import { DateUtilityService } from '../../services/date-utility.service';
import { CustomTooltipDirective } from '../../shared/directives/custom-tooltip.directive';

@Component({
  selector: 'app-monthly-list',
  imports: [
    ReactiveFormsModule,
    ThaiDatepicker,
    ThaiDatePipe,
    ChristianToThaiYearPipe,
    CustomTooltipDirective
  ],
  template: `
    <main class="container mx-auto p-4 md:p-8 max-w-4xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-thasadith font-bold text-gray-800 dark:text-gray-200">จัดการรอบบัญชี</h1>
        <button (click)="openModal(null)" class="btn-primary">+ เพิ่มรอบบัญชี</button>
      </div>

      <!-- Table Display -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto p-2 md:p-5">
          <table class="min-w-full text-base divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="table-header">ปี (พ.ศ.)</th>
              <th class="table-header">เดือน</th>
              <th class="table-header">วันเริ่มต้น</th>
              <th class="table-header">วันสิ้นสุด</th>
              <th class="table-header text-right">Actions</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (item of paginatedItems(); track item.id) {
                <tr class="hover:bg-gray-200  dark:hover:bg-gray-700/50   text-gray-800 dark:text-gray-300">
                  <td class="table-cell">{{ item.year | christianToThaiYear }}</td>
                  <td class="table-cell font-semibold text-left">{{ item.month }}</td>
                  <td class="table-cell">{{ item.datestart | thaiDate }}</td>
                  <td class="table-cell">{{ item.dateend | thaiDate }}</td>
                  <td class="table-cell text-center">
                    <button (click)="openModal(item)" class="btn-icon" customTooltip="แก้ไข">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path
                          d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z"/>
                      </svg>
                    </button>
                    <button (click)="onDelete(item)" class="btn-icon-danger" customTooltip="ลบ">
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
        </div>
      </div>

      <!-- Paginator -->
      @if (totalPages() > 1) {
        <div class="mt-8 flex justify-center items-center gap-4">
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
    </main>

    <!-- Add/Edit Modal -->
    @if (isModalOpen()) {
      <div (click)="closeModal()" class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div (click)="$event.stopPropagation()"
             class="bg-white p-6 md:p-8 rounded-xl shadow-2xl z-50 w-full max-w-lg mx-auto dark:bg-gray-800">
          <h2 class="text-2xl font-thasadith font-semibold text-gray-700 dark:text-gray-200 mb-6">
            {{ isEditing() ? 'แก้ไขรอบบัญชี' : 'เพิ่มรอบบัญชีใหม่' }}
          </h2>
          <form [formGroup]="monthlyForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">ปี (พ.ศ.)</label>
                <select formControlName="year" class="form-input">
                  <option [ngValue]="null" disabled>-- เลือกปี --</option>
                  @for (year of yearRange; track year) {
                    <option [value]="year">{{ year }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label">เดือน</label>
                <select formControlName="month" class="form-input">
                  <option value="" disabled>-- เลือกเดือน --</option>
                  @for (month of months; track month.value) {
                    <option [value]="month.name">{{ month.name }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="form-label">วันเริ่มต้น</label>
                <app-thai-datepicker formControlName="datestart"></app-thai-datepicker>
              </div>
              <div>
                <label class="form-label">วันสิ้นสุด</label>
                <app-thai-datepicker formControlName="dateend"></app-thai-datepicker>
              </div>
            </div>
            <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
              <button type="button" (click)="closeModal()" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="monthlyForm.invalid" class="btn-primary">
                {{ isEditing() ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class MonthlyList {
  private monthlyService = inject(MonthlyService);
  private loadingService = inject(LoadingService);
  private dateUtilityService = inject(DateUtilityService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // --- Constants ---
  readonly months = this.dateUtilityService.getMonths();
  readonly yearRange = this.dateUtilityService.getYearRange(10); // หรือจำนวนปีที่ต้องการ


  // --- Data & State ---
  allItems: Signal<Monthly[]>;
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // --- Modal State ---
  isModalOpen = signal(false);
  selectedItem = signal<Monthly | null>(null);
  isEditing = computed(() => !!this.selectedItem());
  monthlyForm!: FormGroup;

  // --- Computed for Display ---
  paginatedItems = computed(() => {
    const items = this.allItems() ?? [];
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const startIndex = (page - 1) * perPage;
    return items.slice(startIndex, startIndex + perPage);
  });
  totalPages = computed(() => Math.ceil((this.allItems() ?? []).length / this.itemsPerPage()));

  private getMonthlyData(): Signal<Monthly[]> {
    this.loadingService.show();

    return toSignal(
      (this.monthlyService.getAll() as Observable<Monthly[]>)
        .pipe(
          tap(() => this.loadingService.hide()),
          catchError((err: any) => {
            this.toastService.show('Error', 'Error fetching data' + err, 'error');
            return throwError(() => err);
          }),
        ),
      {initialValue: []}
    );
  }

  constructor() {
    this.allItems = this.getMonthlyData();
    this.initializeForm();
  }

  initializeForm(data: Monthly | null = null): void {
    const yearForForm = data ? data.year + 543 : null;

    this.monthlyForm = this.fb.group({
      year: [yearForForm, Validators.required],
      month: [data?.month || '', Validators.required],
      datestart: [data?.datestart || null, Validators.required],
      dateend: [data?.dateend || null, Validators.required],
    });
  }

  openModal(data: Monthly | null): void {
    this.selectedItem.set(data);
    this.initializeForm(data);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.monthlyForm.invalid) return;
    this.loadingService.show();

    const formValue = this.monthlyForm.value;
    const dataToSave = {
      ...formValue,
      year: formValue.year - 543
    };

    try {
      if (this.isEditing() && this.selectedItem()) {
        const updatedData = {...this.selectedItem()!, ...dataToSave};
        await this.monthlyService.update(updatedData);
        this.toastService.show('Success', 'อัปเดตข้อมูลสำเร็จ', 'success');
      } else {
        await this.monthlyService.add(dataToSave);
        this.toastService.show('Success', 'เพิ่มข้อมูลสำเร็จ', 'success');
      }
      this.closeModal();
    } catch (error) {
      this.toastService.show('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      this.loadingService.hide();
    }
  }

  async onDelete(item: Monthly): Promise<void> {
    const confirmed = await this.dialogService.open({
      title: 'ยืนยันการลบ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรอบบัญชี <strong>${item.month} ${item.year}</strong>?`
    });
    if (confirmed && item.id) {
      this.loadingService.show();
      try {
        await this.monthlyService.delete(item.id);
        this.toastService.show('Success', 'ลบข้อมูลสำเร็จ', 'success');
      } catch (error) {
        this.toastService.show('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
      } finally {
        this.loadingService.hide();
      }
    }
  }

  /** Pagination */
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
